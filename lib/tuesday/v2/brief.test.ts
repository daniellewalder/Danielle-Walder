import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from './fixtures.ts'
import { HANDOFFS } from './handoff.fixtures.ts'
import { score, type Result } from './score.ts'
import { strategyFor, type Strategy } from './strategy.ts'
import { assembleBrief, type BriefItem, type StructuredBrief, type Trace } from './brief.ts'
import { isEmptyHandoff } from './handoff.ts'
import { attributeById } from './model.ts'

const briefs = Object.entries(FIXTURES).map(([name, { answers }]) => {
  const result = score(answers)
  const strategy = strategyFor(result)
  return { name, result, strategy, brief: assembleBrief(result, strategy) }
})

const one = (name: keyof typeof FIXTURES) => {
  const result = score(FIXTURES[name].answers)
  const strategy = strategyFor(result)
  return { result, strategy, brief: assembleBrief(result, strategy) }
}

const withHandoff = (name: keyof typeof FIXTURES, handoff: keyof typeof HANDOFFS) => {
  const result = score(FIXTURES[name].answers)
  return assembleBrief(result, strategyFor(result), HANDOFFS[handoff].handoff)
}

const derivedSections = (brief: StructuredBrief): readonly BriefItem[] => [
  ...brief.doNotFlex,
  ...brief.skipFaster,
  ...brief.secondLook,
  ...brief.showingTests,
  ...brief.practicalProgram,
]

const traces = (brief: StructuredBrief): Trace[] => [
  ...Object.values(brief.searchPattern.trace),
  ...brief.nonNegotiables.map((entry) => entry.trace),
  ...brief.flexOrder.candidates.map((entry) => entry.trace),
  ...derivedSections(brief).map((entry) => entry.trace),
  ...brief.doNotSubstitute.map((entry) => entry.trace),
  ...brief.unresolved.map((entry) => entry.trace),
  ...brief.discrepancies.map((entry) => entry.trace),
  ...(brief.expectedTradeoff ? [brief.expectedTradeoff.trace] : []),
]

// ---------------------------------------------------------------------------
// The three sources stay distinct
// ---------------------------------------------------------------------------

test('every item declares which of the three layers it came from', () => {
  const LAYERS = new Set(['buyerEvidence', 'derived', 'handoff'])
  for (const { name, brief } of briefs) {
    for (const trace of traces(brief)) {
      assert.ok(LAYERS.has(trace.layer), `${name}: unknown layer ${trace.layer}`)
    }
  }
})

test('non-negotiables are buyer evidence and are never presented as derived', () => {
  for (const { name, brief } of briefs) {
    for (const entry of brief.nonNegotiables) {
      assert.equal(entry.trace.layer, 'buyerEvidence', `${name}: ${entry.attribute}`)
      assert.deepEqual(entry.trace.rules, undefined, `${name}: ${entry.attribute} claims a rule`)
      assert.ok(entry.trace.sources && entry.trace.sources.length > 0, `${name}: ${entry.attribute} has no source question`)
    }
  }
})

test('every derived item names facts, questions and the rule that produced it', () => {
  for (const { name, brief } of briefs) {
    for (const entry of derivedSections(brief)) {
      assert.equal(entry.trace.layer, 'derived', `${name}: ${entry.id}`)
      assert.ok(entry.trace.because?.length, `${name}: ${entry.id} states no facts`)
      assert.ok(entry.trace.sources?.length, `${name}: ${entry.id} names no question`)
      assert.ok(entry.trace.rules?.length, `${name}: ${entry.id} names no rule`)
    }
  }
})

test('the whole brief is JSON round-trippable, so it is useful raw', () => {
  for (const { name, brief } of briefs) {
    const json = JSON.stringify(brief)
    assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(brief)), name)
    assert.ok(!json.includes('undefined'), `${name}: leaked an undefined`)
  }
})

// ---------------------------------------------------------------------------
// Handoff facts never become evidence
// ---------------------------------------------------------------------------

test('a handoff changes searchFacts and discrepancies and nothing else', () => {
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    const result = score(FIXTURES[fixture].answers)
    const strategy = strategyFor(result)
    const bare = assembleBrief(result, strategy)
    for (const handoff of Object.keys(HANDOFFS) as (keyof typeof HANDOFFS)[]) {
      const loaded = assembleBrief(result, strategy, HANDOFFS[handoff].handoff)
      const strip = (brief: StructuredBrief) => {
        const { searchFacts, discrepancies, ...rest } = brief
        return rest
      }
      assert.deepEqual(
        strip(loaded),
        strip(bare),
        `${fixture} + ${handoff}: the handoff moved something it must not touch`,
      )
    }
  }
})

test('the handoff never re-scores the test', () => {
  const before = score(FIXTURES.t3_outdoorPoolConcern.answers)
  const brief = withHandoff('t3_outdoorPoolConcern', 'D_poolDiscrepancy')
  const after = score(FIXTURES.t3_outdoorPoolConcern.answers)
  assert.deepEqual(JSON.parse(JSON.stringify(dumpable(after))), JSON.parse(JSON.stringify(dumpable(before))))
  assert.equal(brief.searchPattern.map, before.map)
})

function dumpable(result: Result) {
  return {
    scales: result.scales,
    states: result.attributes.map((entry) => [entry.attribute.id, entry.state, entry.qualifier]),
    stances: [...result.stances].sort(),
    map: result.map,
  }
}

test('searchFacts is the supplied handoff verbatim, and null when nothing was given', () => {
  const { brief } = one('t3_outdoorPoolConcern')
  assert.equal(brief.searchFacts, null)
  assert.deepEqual(brief.discrepancies, [])

  const loaded = withHandoff('t3_outdoorPoolConcern', 'A_fullySpecified')
  assert.deepEqual(loaded.searchFacts, HANDOFFS.A_fullySpecified.handoff)
})

test('an empty handoff is treated as no handoff', () => {
  const result = score(FIXTURES.turnkey.answers)
  const strategy = strategyFor(result)
  assert.equal(assembleBrief(result, strategy, {}).searchFacts, null)
  assert.equal(assembleBrief(result, strategy, { price: {} }).searchFacts, null)
  assert.ok(isEmptyHandoff({ geography: {} }))
  assert.ok(!isEmptyHandoff({ schoolBoundary: 'x' }))
})

// ---------------------------------------------------------------------------
// Fair housing
// ---------------------------------------------------------------------------

test('a school boundary is stored exactly as typed and nothing is added to it', () => {
  const brief = withHandoff('fixedMap', 'B_schoolBoundary')
  assert.equal(brief.searchFacts?.schoolBoundary, HANDOFFS.B_schoolBoundary.handoff.schoolBoundary)
  // Scan the values the brief produced, not its field names: `statedRank` is a
  // Q2 ordering and has nothing to do with a school.
  const produced = strings(brief).filter((value) => value !== brief.searchFacts?.schoolBoundary)
  for (const word of ['rating', 'rated', 'score', 'ranked', 'good school', 'better school', 'quality', 'boundary']) {
    for (const value of produced) {
      assert.ok(!value.toLowerCase().includes(word), `the brief produced school language: "${value}"`)
    }
  }
  // The boundary is a constraint, never a derived finding or a discrepancy.
  assert.deepEqual(brief.discrepancies, [])
  for (const entry of derivedSections(brief)) {
    assert.ok(!entry.subject.toLowerCase().includes('school'), 'a school reached the derived layer')
  }
})

test('destinations are recorded as written, uncategorised and unexplained', () => {
  const brief = withHandoff('fewAreasMap', 'C_regularDestination')
  assert.deepEqual(brief.searchFacts?.destinations, HANDOFFS.C_regularDestination.handoff.destinations)
  assert.deepEqual(brief.discrepancies, [])
  // No field anywhere labels, groups or explains a destination.
  const json = JSON.stringify({ ...brief, searchFacts: null })
  for (const place of HANDOFFS.C_regularDestination.handoff.destinations ?? []) {
    assert.ok(!json.includes(place), 'a destination leaked out of searchFacts into analysis')
  }
  for (const word of ['medical', 'religio', 'worship', 'family', 'commute reason', 'because']) {
    assert.ok(!JSON.stringify(brief.searchFacts).toLowerCase().includes(word), `a reason was attached: ${word}`)
  }
})

test('no handoff field is ever read as a reason for anything', () => {
  // Every trace source must be a real question id or the literal `handoff`.
  const QUESTIONS = new Set(['tuesday', 'dealbreaker', 'daily', 'architecture', 'personalization', 'project', 'location', 'tradeoff', 'depends', 'handoff'])
  for (const handoff of Object.keys(HANDOFFS) as (keyof typeof HANDOFFS)[]) {
    for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
      const brief = withHandoff(fixture, handoff)
      for (const trace of traces(brief)) {
        for (const source of trace.sources ?? []) {
          assert.ok(QUESTIONS.has(source), `${fixture} + ${handoff}: bogus source ${source}`)
        }
      }
    }
  }
})

// ---------------------------------------------------------------------------
// Discrepancies: only an explicit incompatible pair
// ---------------------------------------------------------------------------

test('D: pool upkeep named as a burden, then a pool required, is a discrepancy', () => {
  const brief = withHandoff('t3_outdoorPoolConcern', 'D_poolDiscrepancy')
  assert.equal(brief.discrepancies.length, 1)
  const [found] = brief.discrepancies
  assert.equal(found.kind, 'structuredConflict')
  assert.equal(found.status, 'needsClarification')
  assert.match(found.testEvidence, /pool/)
  assert.match(found.handoffFact, /pool/)
})

test('E: the same buyer with the handoff silent on pools produces nothing', () => {
  assert.deepEqual(withHandoff('t3_outdoorPoolConcern', 'E_silentOnPool').discrepancies, [])
})

test('a planting qualifier plus a required pool is not a pool conflict', () => {
  // t4 named planting, not the pool. Nothing here may mention a pool.
  const brief = withHandoff('t4_outdoorPlantingConcern', 'D_poolDiscrepancy')
  assert.deepEqual(brief.discrepancies, [])
  const json = JSON.stringify({ ...brief, searchFacts: null })
  assert.ok(!json.toLowerCase().includes('pool'), 'a pool was mentioned on planting evidence')
})

test('F: a fixed map and several areas listed is NOT a discrepancy', () => {
  const brief = withHandoff('fixedMap', 'F_severalAreas')
  assert.equal(brief.searchPattern.map, 'fixed')
  assert.deepEqual(brief.discrepancies, [], 'a map conflict was manufactured from a list of areas')
})

test('G: a settled no-renovation posture against a note about gutting is quoted, not interpreted', () => {
  const brief = withHandoff('turnkey', 'G_projectNote')
  assert.equal(brief.discrepancies.length, 1)
  const [found] = brief.discrepancies
  assert.equal(found.kind, 'freeTextMayConflict')
  assert.equal(found.status, 'needsClarification')
  assert.ok(found.quote?.includes('gutting the kitchen'), 'the note was not quoted verbatim')
  // And the posture itself is untouched: nothing was re-read from the note.
  assert.equal(brief.searchPattern.project, 'turnkey')
})

test('the same note against a buyer who never settled renovation says nothing', () => {
  // `fewAreasMap` answered project: depends, so there is no posture to contradict.
  assert.deepEqual(withHandoff('fewAreasMap', 'G_projectNote').discrepancies, [])
})

test('A: a fully specified buyer with no incompatible pair produces no discrepancy', () => {
  for (const fixture of ['turnkey', 'fixedMap', 'structuralBuilder', 'lowInformation'] as const) {
    assert.deepEqual(
      withHandoff(fixture, 'A_fullySpecified').discrepancies,
      [],
      `${fixture}: a discrepancy was invented from a consistent handoff`,
    )
  }
})

test('discrepancies never appear from an absent handoff field', () => {
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    for (const handoff of ['B_schoolBoundary', 'C_regularDestination', 'E_silentOnPool', 'F_severalAreas'] as const) {
      assert.deepEqual(
        withHandoff(fixture, handoff).discrepancies,
        [],
        `${fixture} + ${handoff}: silence was read as a contradiction`,
      )
    }
  }
})

// ---------------------------------------------------------------------------
// No duplication across sections
// ---------------------------------------------------------------------------

test('every concept in the brief has exactly one factual home', () => {
  for (const { name, brief } of briefs) {
    for (const [concept, entry] of Object.entries(brief.conceptIndex)) {
      assert.ok(entry.home, `${name}: ${concept} is described nowhere`)
      assert.ok(!entry.referencedIn.includes(entry.home), `${name}: ${concept} is its own reference`)
      assert.equal(
        new Set(entry.referencedIn).size,
        entry.referencedIn.length,
        `${name}: ${concept} is referenced twice in one section`,
      )
    }
  }
})

test('the concept index accounts for every attribute the brief mentions', () => {
  for (const { name, brief } of briefs) {
    const mentioned = new Set<string>()
    for (const entry of brief.nonNegotiables) mentioned.add(entry.attribute)
    for (const entry of derivedSections(brief)) mentioned.add(entry.subject)
    for (const entry of brief.doNotSubstitute) mentioned.add(entry.wanted)
    for (const lever of brief.flexOrder.candidates) mentioned.add(lever.lever)
    for (const subject of mentioned) {
      if (!attributeById(subject)) continue
      assert.ok(brief.conceptIndex[subject], `${name}: ${subject} is missing from the index`)
    }
  }
})

test('nothing is both filtered out and offered as a compromise', () => {
  for (const { name, brief } of briefs) {
    const skipped = new Set(brief.skipFaster.map((entry) => entry.subject))
    for (const lever of brief.flexOrder.candidates) {
      if (lever.status !== 'available') continue
      assert.ok(!skipped.has(lever.lever), `${name}: ${lever.lever} is filtered and flexed`)
    }
  }
})

test('a non-negotiable is never repeated as a do-not-flex', () => {
  for (const { name, brief } of briefs) {
    const protected_ = new Set(brief.nonNegotiables.map((entry) => entry.attribute))
    for (const entry of brief.doNotFlex) {
      assert.ok(!protected_.has(entry.subject), `${name}: ${entry.subject} is protected and told not to flex`)
    }
  }
})

test('derived reasoning folded into a non-negotiable keeps its full trace', () => {
  for (const { name, brief } of briefs) {
    for (const entry of brief.nonNegotiables) {
      for (const trace of entry.reinforcedBy ?? []) {
        assert.equal(trace.layer, 'derived', `${name}: ${entry.attribute}`)
        assert.ok(trace.because?.length && trace.rules?.length, `${name}: ${entry.attribute} lost its trace`)
      }
    }
  }
})

/*
 * A concept in several sections is fine when each says a different thing: a
 * non-negotiable means do not compromise it, a program item means the house
 * has to have it. What must never happen is the same concept arriving as two
 * findings with no record of which one describes it.
 */
test('a concept in several sections has exactly one of them as its home', () => {
  for (const { name, brief } of briefs) {
    const appearances: Record<string, number> = {}
    const seen = (subject: string) => {
      appearances[subject] = (appearances[subject] ?? 0) + 1
    }
    for (const entry of brief.nonNegotiables) seen(entry.attribute)
    for (const entry of derivedSections(brief)) seen(entry.subject)
    for (const [subject, count] of Object.entries(appearances)) {
      if (count < 2 || !attributeById(subject)) continue
      const indexed = brief.conceptIndex[subject]
      assert.ok(indexed?.home, `${name}: ${subject} appears ${count} times with no home`)
      assert.ok(indexed.referencedIn.length > 0, `${name}: ${subject} appears ${count} times but references nothing`)
    }
  }
})

test('a skip-faster is never repeated as a do-not-flex', () => {
  for (const { name, brief } of briefs) {
    const skipped = new Set(brief.skipFaster.map((entry) => entry.subject))
    for (const entry of brief.doNotFlex) {
      assert.ok(!skipped.has(entry.subject), `${name}: ${entry.subject} appears in both`)
    }
  }
})

test('a non-negotiable is never also offered as an available lever', () => {
  for (const { name, brief } of briefs) {
    const protected_ = new Set(brief.nonNegotiables.map((entry) => entry.attribute))
    for (const lever of brief.flexOrder.candidates) {
      if (lever.status !== 'available') continue
      assert.ok(!protected_.has(lever.lever), `${name}: ${lever.lever} is protected and offered as the give`)
    }
  }
})

test('one instruction per subject within a section', () => {
  for (const { name, brief } of briefs) {
    for (const [section, entries] of [
      ['skipFaster', brief.skipFaster],
      ['doNotFlex', brief.doNotFlex],
      ['secondLook', brief.secondLook],
      ['showingTests', brief.showingTests],
      ['practicalProgram', brief.practicalProgram],
    ] as const) {
      const subjects = entries.map((entry) => entry.subject)
      assert.equal(new Set(subjects).size, subjects.length, `${name}: ${section} repeats a subject`)
    }
  }
})

// ---------------------------------------------------------------------------
// The flex order
// ---------------------------------------------------------------------------

test('every lever the strategy emitted appears in the flex order', () => {
  for (const { name, brief, strategy } of briefs) {
    const listed = new Set(brief.flexOrder.candidates.map((entry) => entry.lever))
    for (const action of strategy.derived.flexFirst) {
      assert.ok(listed.has(action.subject), `${name}: ${action.subject} is an emitted lever but is not listed`)
    }
  }
})

test('an eligible lever we simply did not lead with is never reported as vetoed', () => {
  for (const { name, brief, strategy } of briefs) {
    for (const entry of brief.flexOrder.candidates) {
      const candidate = strategy.derived.lever.candidates.find((c) => c.concept === entry.lever)
      assert.ok(candidate, `${name}: ${entry.lever}`)
      if (candidate.accepted) {
        assert.notEqual(entry.status, 'vetoed', `${name}: ${entry.lever} is eligible but reported as vetoed`)
        assert.equal(entry.veto, undefined, `${name}: ${entry.lever} is eligible but carries a veto`)
      } else {
        assert.equal(entry.status, 'vetoed', `${name}: ${entry.lever} was vetoed but not reported as such`)
      }
    }
  }
})

test('available levers are ranked, contiguously, from one', () => {
  for (const { name, brief } of briefs) {
    const ranks = brief.flexOrder.candidates
      .filter((entry) => entry.status === 'available')
      .map((entry) => entry.rank)
      .sort((a, b) => (a ?? 0) - (b ?? 0))
    assert.deepEqual(ranks, ranks.map((_, index) => index + 1), `${name}: ranks are ${ranks.join(',')}`)
  }
})

test('a vetoed lever names its veto, and never carries a rank', () => {
  for (const { name, brief } of briefs) {
    for (const entry of brief.flexOrder.candidates) {
      if (entry.status !== 'vetoed') continue
      assert.equal(entry.rank, undefined, `${name}: ${entry.lever} is vetoed but ranked`)
      assert.ok(entry.veto || entry.trace.because?.length, `${name}: ${entry.lever} is vetoed without a reason`)
    }
  }
})

test('closed and notEstablished are never reported as the same thing', () => {
  for (const { name, brief } of briefs) {
    const { state, reason, candidates, missing } = brief.flexOrder
    if (state === 'identified') {
      assert.ok(candidates.some((entry) => entry.status === 'available'), `${name}: identified with no lever`)
      assert.equal(reason, null, `${name}: identified but gave a reason`)
      assert.equal(missing, undefined)
      continue
    }
    assert.ok(!candidates.some((entry) => entry.status === 'available'), `${name}: ${state} with a lever`)
    assert.ok(reason, `${name}: ${state} with no reason code`)
    if (state === 'closed') {
      assert.equal(reason, 'closedByExplicitConstraints')
      assert.ok(candidates.length > 0, `${name}: closed but nothing was ever a candidate`)
      assert.equal(missing, undefined, `${name}: closed should not report a gap in our own data`)
    } else {
      assert.ok(missing?.length, `${name}: notEstablished must say what we never gathered`)
      // Specific enough to act on: it has to name a question, not a mood.
      assert.ok(
        missing.some((gap) => /question|follow-up|gathered/.test(gap)),
        `${name}: the gap is too vague to act on: ${missing.join(' / ')}`,
      )
    }
  }
})

// ---------------------------------------------------------------------------
// Claims the brief must not make
// ---------------------------------------------------------------------------

test('the brief asserts no market fact and no claim about Danielle', () => {
  const FORBIDDEN =
    /usually|typically|tend to|rare\b|common\b|undervalued|overpriced|good deal|hot market|appreciat|investment|years of experience|award|top \d|luxury|white glove|school (rating|district quality)/i
  for (const { name, brief } of briefs) {
    const json = JSON.stringify(brief)
    const hit = json.match(FORBIDDEN)
    assert.equal(hit, null, `${name}: the brief asserted "${hit?.[0]}"`)
  }
})

test('a second look states what it does not license', () => {
  for (const { name, brief } of briefs) {
    for (const entry of brief.secondLook) {
      assert.ok(Array.isArray(entry.doesNotImply), `${name}: ${entry.id}`)
    }
  }
})

test('an expected tradeoff distinguishes an established order from one still to test', () => {
  for (const { name, brief, result } of briefs) {
    const item = brief.expectedTradeoff
    if (!item) continue
    if (item.confidence === 'established') {
      assert.ok(result.tradeoff?.winner, `${name}: claimed established with no forced choice`)
      assert.equal(item.ordering, 'sideAWins')
    } else {
      assert.equal(item.ordering, 'none', `${name}: ordered a tension it only expects`)
    }
  }
})

test('turnkey is never reported for a buyer who accepted renovation', () => {
  for (const { name, brief, strategy } of briefs) {
    if (brief.searchPattern.project !== 'turnkey') continue
    assert.notEqual(strategy.buyerEvidence.bands.renovation, 'yes', `${name}: turnkey over renovation = yes`)
    assert.notEqual(strategy.buyerEvidence.bands.renovation, 'conditional', `${name}: turnkey over renovation = conditional`)
  }
})

test('a posture is never asserted without naming its evidence', () => {
  for (const { name, brief, result } of briefs) {
    const { trace, project, personalization, map } = brief.searchPattern
    assert.ok(trace.project.because?.length, `${name}: project posture has no facts`)
    assert.ok(trace.personalization.because?.length, `${name}: personalization posture has no facts`)
    if (map) assert.deepEqual(trace.map.sources, ['location'], `${name}: a map with no source`)
    if (personalization !== 'notEstablished') {
      assert.deepEqual(trace.personalization.sources, ['personalization'], `${name}: posture without the question`)
    } else {
      assert.deepEqual(trace.personalization.sources, [], `${name}: notEstablished with a source`)
    }
    if (project === 'notEstablished') {
      assert.deepEqual(trace.project.sources, [], `${name}: notEstablished project with a source`)
    }
    assert.equal(result.version, 2)
  }
})

test('a gap in our questioning is never reported as the buyer refusing', () => {
  const partial = score({ version: 2, dealbreaker: [{ option: 'dark' }, { option: 'privacy' }], location: 'fixed' })
  const brief = assembleBrief(partial, strategyFor(partial))
  assert.equal(brief.flexOrder.state, 'notEstablished')
  assert.ok(brief.flexOrder.missing?.some((gap) => gap.includes('renovation question')))
  assert.ok(brief.flexOrder.missing?.some((gap) => gap.includes('personalization question')))
  const condition = brief.flexOrder.candidates.find((entry) => entry.lever === 'condition')
  assert.equal(condition?.veto, 'renovationNotEstablished')
  const finish = brief.flexOrder.candidates.find((entry) => entry.lever === 'cosmeticFinish')
  assert.equal(finish?.veto, 'personalizationNotEstablished')
})

test('the brief declares its instrument version, so a V1 link can never be read as one', () => {
  for (const { name, brief } of briefs) assert.equal(brief.version, 2, name)
})

/** Every string value anywhere in the brief. Field names excluded. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}
