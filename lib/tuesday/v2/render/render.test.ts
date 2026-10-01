import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from '../fixtures.ts'
import { HANDOFFS } from '../handoff.fixtures.ts'
import { QUESTIONS } from '../questions.ts'
import { QUALIFIERS } from '../model.ts'
import { score } from '../score.ts'
import { strategyFor } from '../strategy.ts'
import { assembleBrief, type StructuredBrief } from '../brief.ts'
import { compose, renderAgentBrief, renderBuyerCopy } from './index.ts'
import {
  CRITERION, CRITERION_BUYER, DISCREPANCY, NO_SUBSTITUTE, PROGRAM, PROGRAM_QUALIFIED,
  QUALIFIER_CRITERION, SECOND_LOOK, SHOWING, SKIP, TRADEOFF, UNRESOLVED, VETO,
} from './phrases.ts'
import type { Pick, V2Answers } from '../answers.ts'

const briefFor = (fixture: keyof typeof FIXTURES, handoff?: keyof typeof HANDOFFS) => {
  const result = score(FIXTURES[fixture].answers)
  return assembleBrief(result, strategyFor(result), handoff ? HANDOFFS[handoff].handoff : undefined)
}

const all: { name: string; brief: StructuredBrief }[] = [
  ...Object.keys(FIXTURES).map((name) => ({ name, brief: briefFor(name as keyof typeof FIXTURES) })),
  ...(Object.keys(HANDOFFS) as (keyof typeof HANDOFFS)[]).map((handoff) => ({
    name: `t3+${handoff}`,
    brief: briefFor('t3_outdoorPoolConcern', handoff),
  })),
  ...(Object.keys(HANDOFFS) as (keyof typeof HANDOFFS)[]).map((handoff) => ({
    name: `turnkey+${handoff}`,
    brief: briefFor('turnkey', handoff),
  })),
]

const texts = (brief: StructuredBrief) => [renderAgentBrief(brief), renderBuyerCopy(brief)]

// ---------------------------------------------------------------------------
// Copy rules
// ---------------------------------------------------------------------------

test('no reader-facing em dash anywhere', () => {
  for (const { name, brief } of all) {
    for (const text of texts(brief)) {
      assert.ok(!text.includes('—'), `${name} contains an em dash`)
      assert.ok(!text.includes('–'), `${name} contains an en dash`)
    }
  }
})

test('none of the banned phrasings appear', () => {
  const BANNED = [
    /this tells us/i, /the signal is/i, /your preferences indicate/i,
    /the useful distinction is/i, /by design/i, /the property leads/i,
    /journey/i, /dream home/i, /curated/i, /elevated/i, /bespoke/i,
    /white glove/i, /\bprotect\b/i, /\bscrutinize\b/i, /\bband\b/i,
    /\bstance\b/i, /\battribute\b/i, /\bprovenance\b/i, /\bevidence\b/i,
    /\bqualifier\b/i, /\bnormalis/i, /\blever state\b/i, /\bnotEstablished\b/,
  ]
  for (const { name, brief } of all) {
    for (const text of texts(brief)) {
      for (const pattern of BANNED) {
        const hit = text.match(pattern)
        assert.equal(hit, null, `${name} says "${hit?.[0]}"`)
      }
    }
  }
})

test('nothing claims to know anything about the market', () => {
  const MARKET =
    /\b(usually|typically|tend to|tends to|rare|rarely|commonly|undervalued|overpriced|good deal|appreciat|resale|market rate|inventory|comps?)\b/i
  for (const { name, brief } of all) {
    for (const text of texts(brief)) {
      const hit = text.match(MARKET)
      assert.equal(hit, null, `${name} asserts a market fact: "${hit?.[0]}"`)
    }
  }
})

test('no engine id leaks into either rendering', () => {
  for (const { name, brief } of all) {
    for (const text of texts(brief)) {
      for (const pattern of [/inspect\./, /reject\./, /secondLook\./, /noSub\./, /flex\./, /doNotFlex\./, /program\./, /hold\./]) {
        assert.ok(!pattern.test(text), `${name} leaked an engine id matching ${pattern}`)
      }
      assert.ok(!/[a-z][A-Z]/.test(text.replace(/EV/g, '')), `${name} leaked a camelCase id`)
    }
  }
})

// ---------------------------------------------------------------------------
// One interpretation, two voices
// ---------------------------------------------------------------------------

test('the buyer copy never contains a section the agent brief lacks', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const rendered = new Set(composed.sections.map((entry) => entry.id))
    // Everything in the buyer copy is drawn from the same composed sections.
    for (const section of composed.sections) {
      assert.ok(rendered.has(section.id), name)
    }
    // And a section is either composed or explicitly omitted, never neither.
    const accounted = new Set([...rendered, ...composed.omitted.map((entry) => entry.id)])
    for (const id of ['facts', 'filter', 'showing', 'unresolved', 'clarify'] as const) {
      assert.ok(accounted.has(id), `${name}: ${id} is neither rendered nor omitted`)
    }
  }
})

test('both renderings agree about whether a lever exists', () => {
  for (const { name, brief } of all) {
    const [agent, buyer] = texts(brief)
    const agentHasFlex = agent.includes('USE THIS AS THE FLEX')
    const buyerHasFlex = buyer.includes('Where I can move')
    assert.equal(agentHasFlex, buyerHasFlex, `${name}: the two disagree about the lever`)
    assert.equal(agentHasFlex, brief.flexOrder.state === 'identified', name)
  }
})

test('the buyer copy carries the sections the email needs, in order', () => {
  const ORDER = ['What I am looking for', 'Has to have', 'Where I can move', 'Worth checking when we see something', 'One thing I have not settled']
  for (const { name, brief } of all) {
    const text = renderBuyerCopy(brief, { resultUrl: 'https://example.test/x' })
    const positions = ORDER.map((heading) => text.indexOf(heading)).filter((index) => index >= 0)
    assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${name}: sections are out of order`)
    assert.ok(text.includes('My full result: https://example.test/x'), `${name}: no link back`)
  }
})

test('every buyer copy fits comfortably in a mailto body', () => {
  for (const { name, brief } of all) {
    const encoded = encodeURIComponent(
      renderBuyerCopy(brief, { resultUrl: 'https://daniellewalder.example/tuesday-test?r=' + 'x'.repeat(120) }),
    ).length
    assert.ok(encoded < 1800, `${name}: ${encoded} encoded characters is too long for a mailto`)
  }
})

// ---------------------------------------------------------------------------
// The snapshot is strategy, not a recap
// ---------------------------------------------------------------------------

test('the snapshot is one to four sentences, and never padded', () => {
  /*
   * Four is the ceiling. One is allowed: `twoDealbreakers` establishes a
   * movable map and two hard stops, and there is no second honest sentence in
   * that, so it gets one rather than a line added for rhythm.
   */
  for (const { name, brief } of all) {
    const { snapshot } = compose(brief)
    assert.ok(snapshot.length >= 1 && snapshot.length <= 4, `${name}: ${snapshot.length} sentences`)
    for (const entry of snapshot) {
      assert.ok(entry.agent.trim().length > 0, name)
      assert.ok(entry.buyer.trim().length > 0, name)
    }
  }
})

test('the snapshot never just lists the non-negotiables', () => {
  /*
   * The no-shit-sherlock rule. A snapshot that names a protected criterion and
   * nothing else is the buyer's own answer read back to them, so it has to
   * carry an instruction: what to do first, or what not to reach for.
   */
  for (const { name, brief } of all) {
    const text = compose(brief).snapshot.map((entry) => entry.agent).join(' ')
    /*
     * A closed list of instruction forms on purpose. Loosening this to "any
     * sentence" would make the test pass while the snapshot went back to being
     * a recap, which is the failure it exists to catch.
     */
    const INSTRUCTIONS = [
      /\bI would\b/, /\bI'd\b/, /\bDo not\b/, /\bLook for\b/, /\bWatch\b/,
      /next thing I would test/, /next thing to put in front of them/,
      /the only part I would push on/, /the first place I would push/,
      /Worth asking before narrowing anything/, /Watch which way/,
      /treat the area as the wider field/, /keep the search narrow/,
      /stop screening on/, /they can do themselves/, /will tell us more/,
      /I would show them houses/, /Look for the usable version/,
      /I would ask before narrowing/, /has to be somewhere they would sit/,
      /not another job/, /comes with a landscaping job/,
    ]
    assert.ok(
      INSTRUCTIONS.some((pattern) => pattern.test(text)),
      `${name}: the snapshot states facts without an instruction: "${text}"`,
    )
  }
})

test('the snapshot never carries abstract engine language', () => {
  /*
   * The internal vocabulary is useful in the engine and nowhere near a reader.
   * "The finish has room in it" is correct and still makes the buyer translate
   * the scoring model before they can use the sentence.
   */
  const ABSTRACT = [
    /\bsoft give\b/i, /\bhas room in it\b/i, /\bthe lever\b/i, /\bspend the map\b/i,
    /\bthis dimension\b/i, /\bproperty posture\b/i, /\broute is closed\b/i,
    /\bconstraint set\b/i, /\bwiden anything about the house\b/i, /\bposture\b/i,
    /\buse the map before\b/i, /\bsecond thing to try\b/i, /\bthe give\b/i,
  ]
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const strategic = [
      ...composed.snapshot,
      ...composed.sections
        .filter((section) => ['flex', 'noLever', 'leverUnknown', 'secondLook', 'skip', 'tradeoff', 'unresolved'].includes(section.id))
        .flatMap((section) => section.lines),
    ]
    for (const entry of strategic) {
      for (const pattern of ABSTRACT) {
        for (const text of [entry.agent, entry.buyer]) {
          const hit = text.match(pattern)
          assert.equal(hit, null, `${name}: "${hit?.[0]}" in "${text}"`)
        }
      }
    }
  }
})

test('willingness to renovate is never rendered as a preference for renovating', () => {
  /*
   * PERMISSION IS NOT PREFERENCE. The same rule the model enforces.
   *
   * `structuralWorkOkay` and a high renovation reading mean a real project is
   * acceptable. They do not mean the buyer wants one, and a low
   * personalization reading does not mean they would rather move a wall than
   * paint a room. One line said a structural project "will land better than
   * one that just needs painting", which claimed exactly that.
   */
  const PREFERENCE = [
    /rather (do|take on|have|buy|see) [^.]*(work|renovat|structural|project|gut)/i,
    /prefers?[^.]*(project|renovation|structural work|gut)/i,
    /will land better/i,
    /suits? (them|me) better/i,
    /looking for (a|something) (project|to do|to work on)/i,
    /wants? (a |real |some )?(project|renovation|structural work)/i,
    /\bthe draw\b/i,
    /enjoys? (the )?(work|renovat|project)/i,
    /\beager\b/i, /\bkeen (to|on)\b/i, /\bexcited\b/i,
    /the more work the better/i,
    /\bideally[^.]*(work|renovat|project)/i,
  ]
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const strategic = [
      ...composed.snapshot,
      ...composed.sections
        .filter((section) =>
          ['flex', 'noLever', 'leverUnknown', 'secondLook', 'skip', 'tradeoff', 'unresolved'].includes(section.id),
        )
        .flatMap((section) => section.lines),
    ]
    for (const entry of strategic) {
      for (const text of [entry.agent, entry.buyer]) {
        for (const pattern of PREFERENCE) {
          const hit = text.match(pattern)
          assert.equal(hit, null, `${name}: renders work as something they want, via "${hit?.[0]}" in "${text}"`)
        }
      }
    }
  }
})

test('the renovation reading is rendered as permission', () => {
  // And the positive half: where a real project is acceptable and it reaches
  // the snapshot, the sentence has to be about it being allowed.
  const result = score(FIXTURES.structuralBuilder.answers)
  const brief = assembleBrief(result, strategyFor(result))
  const snapshot = compose(brief).snapshot.map((entry) => entry.agent).join(' ')
  assert.match(snapshot, /open to real work/)
  assert.doesNotMatch(snapshot, /better|rather|prefer|draw/i)
})

test('nothing frames the buyer as rigid, difficult or indecisive', () => {
  const ADVERSARIAL = [
    /digging in/i, /dug in/i, /\brigid\b/i, /inflexible/i, /\bdifficult\b/i,
    /indecisive/i, /resistant/i, /\bstubborn\b/i, /\bfussy\b/i, /\bpicky\b/i,
    /unwilling/i, /refuses/i, /\bdemanding\b/i, /won't budge/i,
  ]
  // And no apology for the instrument.
  const APOLOGETIC = [/unfortunately/i, /we failed/i, /the test could not/i, /sorry/i, /our fault/i]
  for (const { name, brief } of all) {
    for (const text of texts(brief)) {
      for (const pattern of [...ADVERSARIAL, ...APOLOGETIC]) {
        const hit = text.match(pattern)
        assert.equal(hit, null, `${name}: "${hit?.[0]}"`)
      }
    }
  }
})

test('the outdoor burden is named the way the buyer named it', () => {
  const pool = compose(briefFor('t3_outdoorPoolConcern')).snapshot.map((e) => e.agent).join(' ')
  const planting = compose(briefFor('t4_outdoorPlantingConcern')).snapshot.map((e) => e.agent).join(' ')
  assert.notEqual(pool, planting, 'the two upkeep qualifiers produce identical strategy')
  assert.match(pool, /pool/i)
  assert.match(planting, /landscaping/i)
  // And neither invents a position the buyer never took.
  for (const [label, text] of [['pool', pool], ['planting', planting]] as const) {
    for (const pattern of [
      /dislikes? (a )?pool/i, /no pool/i, /does not want a pool/i,
      /refuses? (to )?landscap/i, /smaller (yard|lot|garden)/i,
      /too much (land|property|garden)/i, /bigger is/i,
    ]) {
      const hit = text.match(pattern)
      assert.equal(hit, null, `${label}: invented "${hit?.[0]}"`)
    }
  }
  // The planting fixture must never mention a pool, and the reverse.
  assert.doesNotMatch(planting, /pool/i)
})

test('no sentence exists only to sound polished', () => {
  // Slogan endings. A short sharp line is fine when it clarifies; it is not
  // fine as punctuation for a paragraph that felt unfinished.
  const SLOGANS = [
    /Fewer, better showings/i, /That route is closed/i, /Use the map before the house/i,
    /Spend the geography/i, /The property wins/i, /showings are the instrument/i,
  ]
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const lines = [...composed.snapshot, ...composed.sections.flatMap((section) => section.lines)]
    for (const entry of lines) {
      for (const pattern of SLOGANS) {
        assert.equal(entry.agent.match(pattern), null, `${name}: slogan in "${entry.agent}"`)
        assert.equal(entry.buyer.match(pattern), null, `${name}: slogan in "${entry.buyer}"`)
      }
    }
  }
})

test('a missing lever is never reported as the buyer being inflexible', () => {
  for (const { name, brief } of all) {
    if (brief.flexOrder.state !== 'notEstablished') continue
    const agent = renderAgentBrief(brief)
    assert.ok(agent.includes('LEVER NOT ESTABLISHED YET'), name)
    assert.ok(!agent.includes('NO OBVIOUS LEVER'), `${name}: our gap was reported as a closed search`)
    assert.ok(
      /gap in what we asked|never answered|not settled|follow-up is still open/i.test(agent),
      `${name}: does not say the gap is ours`,
    )
  }
})

test('a closed lever is presented as strategy, not as a failure', () => {
  for (const { name, brief } of all) {
    if (brief.flexOrder.state !== 'closed') continue
    const agent = renderAgentBrief(brief)
    assert.ok(agent.includes('NO OBVIOUS LEVER'), name)
    assert.ok(!/fail|unfortunately|sorry|cannot help|too picky|unrealistic/i.test(agent), name)
    assert.ok(
      agent.includes('I would keep the search narrow rather than loosen one of these'),
      `${name}: no instruction for a closed search`,
    )
  }
})

// ---------------------------------------------------------------------------
// Duplication
// ---------------------------------------------------------------------------

test('no line is printed twice in one brief', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const lines = [
      ...composed.snapshot.map((entry) => entry.agent),
      ...composed.sections.flatMap((section) => section.lines.map((entry) => entry.agent)),
    ]
    assert.equal(new Set(lines).size, lines.length, `${name} repeats a line`)
  }
})

test('a concept is never described in both the filter list and the program', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const concepts = (id: string) =>
      new Set(
        composed.sections.find((section) => section.id === id)?.lines.map((entry) => entry.concept).filter(Boolean),
      )
    const filter = concepts('filter')
    for (const concept of concepts('program')) {
      assert.ok(!filter.has(concept), `${name}: ${concept} is in both the filter list and the program`)
    }
  }
})

test('the skip list never restates a filter criterion', () => {
  const DESCRIBES_A_HOUSE = ['size', 'architecturalCharacter', 'upkeep']
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const filter = new Set(
      composed.sections.find((section) => section.id === 'filter')?.lines.map((entry) => entry.concept),
    )
    for (const entry of composed.sections.find((section) => section.id === 'skip')?.lines ?? []) {
      if (!entry.concept || DESCRIBES_A_HOUSE.includes(entry.concept)) continue
      assert.ok(!filter.has(entry.concept), `${name}: ${entry.concept} is filtered and skipped`)
    }
  }
})

test('the snapshot does not restate the tradeoff section', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const tradeoff = composed.sections.find((section) => section.id === 'tradeoff')
    if (!tradeoff) continue
    const snapshot = composed.snapshot.map((entry) => entry.agent).join(' ')
    // No seven-word run in common. Near-identical sentences were arriving in
        // both places in slightly different words.
    const words = tradeoff.lines[0].agent.toLowerCase().split(/\W+/)
    for (let i = 0; i + 7 <= words.length; i++) {
      const run = words.slice(i, i + 7).join(' ')
      assert.ok(!snapshot.toLowerCase().includes(run), `${name}: the snapshot repeats the tradeoff: "${run}"`)
    }
  }
})

test('the snapshot does not restate the no-lever section', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const section = composed.sections.find((entry) => entry.id === 'noLever')
    if (!section) continue
    const snapshot = composed.snapshot.map((entry) => entry.agent).join(' ')
    const words = section.lines[0].agent.toLowerCase().split(/\W+/)
    for (let i = 0; i + 6 <= words.length; i++) {
      const run = words.slice(i, i + 6).join(' ')
      assert.ok(!snapshot.toLowerCase().includes(run), `${name}: the snapshot repeats the constraints: "${run}"`)
    }
  }
})

// ---------------------------------------------------------------------------
// Nothing is invented, and nothing silently vanishes
// ---------------------------------------------------------------------------

test('every section omission says why', () => {
  for (const { name, brief } of all) {
    for (const entry of compose(brief).omitted) {
      assert.ok(entry.why.length > 10, `${name}: ${entry.id} omitted without a reason`)
    }
  }
})

test('a section with no entries is omitted rather than padded', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    for (const section of composed.sections) {
      assert.ok(section.lines.length > 0, `${name}: ${section.id} rendered empty`)
    }
    if (brief.discrepancies.length === 0) {
      assert.ok(!renderAgentBrief(brief).includes('NEEDS CLARIFICATION'), name)
    }
    if (!brief.searchFacts) {
      assert.ok(!renderAgentBrief(brief).includes('SEARCH FACTS'), name)
    }
  }
})

test('a discrepancy is flagged and never resolved', () => {
  const brief = briefFor('t3_outdoorPoolConcern', 'D_poolDiscrepancy')
  const agent = renderAgentBrief(brief)
  assert.ok(agent.includes('NEEDS CLARIFICATION'))
  assert.ok(/Worth one question/.test(agent))
  // The renderer must not pick a side.
  assert.ok(!/so (we|I) should|ignore the|the test is right|the handoff is right/i.test(agent))
})

test('search facts are reproduced without interpretation', () => {
  const brief = briefFor('t1_strongMapLowRenoCosmetic', 'A_fullySpecified')
  const composed = compose(brief)
  const facts = composed.sections.find((section) => section.id === 'facts')!
  const handoff = HANDOFFS.A_fullySpecified.handoff
  const text = facts.lines.map((entry) => entry.agent).join('\n')
  assert.ok(text.includes('Mar Vista, Culver City, Playa del Rey'))
  assert.ok(text.includes('anything east of La Brea'))
  assert.ok(text.includes(handoff.buyerNote!))
  assert.ok(text.includes('1,600 sq ft'))
  // No conclusion drawn inside the section.
  assert.ok(!/which means|so |suggests|implies/i.test(text))
})

test('a school boundary and a destination are reproduced exactly, with nothing added', () => {
  for (const [fixture, handoff] of [['fixedMap', 'B_schoolBoundary'], ['fewAreasMap', 'C_regularDestination']] as const) {
    const brief = briefFor(fixture, handoff)
    for (const text of texts(brief)) {
      if (HANDOFFS[handoff].handoff.schoolBoundary) {
        assert.ok(text.includes(HANDOFFS[handoff].handoff.schoolBoundary!), `${handoff}: boundary not reproduced`)
      }
      for (const place of HANDOFFS[handoff].handoff.destinations ?? []) {
        assert.ok(text.includes(place), `${handoff}: destination not reproduced`)
      }
      for (const word of ['rating', 'rated', 'ranked', 'good school', 'school quality', 'because', 'medical', 'worship']) {
        assert.ok(!text.toLowerCase().includes(word), `${handoff}: added "${word}"`)
      }
    }
  }
})

// ---------------------------------------------------------------------------
// Catalogue completeness
// ---------------------------------------------------------------------------

test('every id the engine can produce has a phrase', () => {
  /*
   * A missing phrase means an instruction disappears silently, which is worse
   * than an ugly sentence. This walks a broad slice of the answer space and
   * fails on anything the catalogue cannot say.
   */
  const opt = (id: string) => QUESTIONS.find((question) => question.id === id)!.options
  const picksOf = (question: 'dealbreaker' | 'daily'): Pick[] => {
    const out: Pick[] = []
    for (const option of opt(question)) {
      if (option.qualifies) {
        for (const qualifier of QUALIFIERS[option.qualifies] ?? []) {
          out.push({ option: option.id, qualifier: qualifier.id })
        }
      }
      out.push({ option: option.id })
    }
    return out
  }
  const missing = new Set<string>()
  for (const deal of picksOf('dealbreaker')) {
    for (const daily of picksOf('daily')) {
      for (const project of [undefined, ...opt('project').map((o) => o.id)]) {
        for (const personalization of [undefined, 'all', 'some', 'notmuch']) {
          for (const location of ['fixed', 'strong', 'few', 'property']) {
            for (const sizeRoute of [undefined, 'existing', 'addition', 'reconfigure', 'seeit']) {
              const answers: V2Answers = { version: 2, dealbreaker: [deal], daily: [daily], location }
              if (project) answers.project = project
              if (personalization) answers.personalization = personalization
              if (sizeRoute) answers.sizeRoute = sizeRoute
              const result = score(answers)
              const brief = assembleBrief(result, strategyFor(result))
              for (const entry of brief.skipFaster) if (!SKIP[entry.id]) missing.add(`SKIP:${entry.id}`)
              for (const entry of brief.secondLook) if (!SECOND_LOOK[entry.id]) missing.add(`SECOND_LOOK:${entry.id}`)
              for (const entry of brief.showingTests) {
                const key = entry.qualifier ? `${entry.id}~${entry.qualifier}` : entry.id
                if (!SHOWING[key] && !SHOWING[entry.id]) missing.add(`SHOWING:${key}`)
              }
              for (const entry of brief.doNotSubstitute) {
                if (!NO_SUBSTITUTE[`${entry.wanted}/${entry.doNotSubstitute}`]) {
                  missing.add(`NO_SUBSTITUTE:${entry.wanted}/${entry.doNotSubstitute}`)
                }
              }
              for (const entry of brief.unresolved) if (!UNRESOLVED[entry.id]) missing.add(`UNRESOLVED:${entry.id}`)
              for (const entry of brief.nonNegotiables) {
                if (!CRITERION[entry.attribute]) missing.add(`CRITERION:${entry.attribute}`)
                if (!CRITERION_BUYER[entry.attribute]) missing.add(`CRITERION_BUYER:${entry.attribute}`)
                if (entry.qualifier && !QUALIFIER_CRITERION[`${entry.attribute}:${entry.qualifier}`]) {
                  missing.add(`QUALIFIER_CRITERION:${entry.attribute}:${entry.qualifier}`)
                }
                if (entry.changeability === 'verifyPerProperty') {
                  const key = entry.qualifier ? `${entry.attribute}:${entry.qualifier}` : entry.attribute
                  if (!PROGRAM_QUALIFIED[key] && !PROGRAM[entry.attribute]) missing.add(`PROGRAM:${key}`)
                }
              }
              for (const candidate of brief.flexOrder.candidates) {
                if (candidate.veto && !VETO[candidate.veto]) missing.add(`VETO:${candidate.veto}`)
              }
              if (brief.expectedTradeoff && !TRADEOFF[brief.expectedTradeoff.why]) {
                missing.add(`TRADEOFF:${brief.expectedTradeoff.why}`)
              }
            }
          }
        }
      }
    }
  }
  assert.deepEqual([...missing].sort(), [], 'ids with no phrase')
})

test('the tradeoff catalogue covers both why codes', () => {
  const ordered = briefFor('t9_rankOneWinsQ8')
  assert.ok(ordered.expectedTradeoff)
  assert.ok(TRADEOFF[ordered.expectedTradeoff.why], ordered.expectedTradeoff.why)
  const outdoor = briefFor('t3_outdoorPoolConcern')
  assert.ok(TRADEOFF[outdoor.expectedTradeoff!.why])
})

test('both discrepancy pairs have a phrase', () => {
  for (const [fixture, handoff] of [['t3_outdoorPoolConcern', 'D_poolDiscrepancy'], ['turnkey', 'G_projectNote']] as const) {
    const brief = briefFor(fixture, handoff)
    assert.equal(brief.discrepancies.length, 1, fixture)
    const found = brief.discrepancies[0]
    assert.ok(DISCREPANCY[`${found.testEvidence}|${found.handoffFact}`], `${found.testEvidence}|${found.handoffFact}`)
  }
})

/** Architecture and size-route combinations, so the sweep reaches every rule. */
const EXTRAS: readonly Partial<V2Answers>[] = [
  {},
  { architecture: 'alot' },
  { architecture: 'plain' },
  { sizeRoute: 'existing' },
  { sizeRoute: 'addition' },
  { sizeRoute: 'reconfigure' },
  { sizeRoute: 'seeit' },
]

/*
 * The contract keeps two fields the renderer does not read directly, because
 * both are about meaning rather than wording. These two tests tie them to the
 * copy anyway, so the engine and the catalogue cannot drift apart silently.
 */
test('a second look never says the thing its doesNotImply forbids', () => {
  const FORBIDDEN: Readonly<Record<string, RegExp>> = {
    renovationTolerance: /\b(renovat|gut|rebuild|move a wall|structural)/i,
    structuralWork: /\b(structural|move a wall|addition)/i,
    sizeIsNegotiable: /\b(smaller is fine|less space is fine|size is flexible)/i,
    expansionIsFeasibleHere: /\b(can be extended|will take an addition|expansion is possible here)/i,
    insufficientAreaIsAcceptable: /\b(too small is fine|less area is fine)/i,
    acceptingABadPlan: /\b(bad plan is fine|plan does not matter)/i,
    acceptingACompromisedSite: /\b(site does not matter|bad site is fine)/i,
  }
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const rendered = composed.sections.find((section) => section.id === 'secondLook')
    if (!rendered) continue
    for (const entry of brief.secondLook) {
      const phrase = SECOND_LOOK[entry.id]
      if (!phrase) continue
      for (const claim of entry.doesNotImply) {
        const pattern = FORBIDDEN[claim]
        assert.ok(pattern, `${name}: no check written for doesNotImply "${claim}"`)
        for (const text of [phrase.agent, phrase.buyer ?? phrase.agent]) {
          const hit = text.match(pattern)
          assert.equal(hit, null, `${name}: ${entry.id} implies ${claim} by saying "${hit?.[0]}"`)
        }
      }
    }
  }
})

test('any concept printed in two sections is one the index knows is shared', () => {
  for (const { name, brief } of all) {
    const composed = compose(brief)
    const where = new Map<string, string[]>()
    for (const section of composed.sections) {
      for (const entry of section.lines) {
        if (!entry.concept) continue
        where.set(entry.concept, [...(where.get(entry.concept) ?? []), section.id])
      }
    }
    for (const [concept, sections] of where) {
      if (sections.length < 2) continue
      const indexed = brief.conceptIndex[concept]
      assert.ok(indexed, `${name}: ${concept} is printed twice but is not in the concept index`)
      assert.ok(
        indexed.referencedIn.length > 0,
        `${name}: ${concept} is printed in ${sections.join(' and ')} but the contract has it in one place only`,
      )
    }
  }
})

test('no catalogue phrase is dead copy', () => {
  // Every entry has to be reachable, or it is copy nobody will ever read and
  // nobody will ever maintain.
  const reachable = {
    SKIP: new Set<string>(), SECOND_LOOK: new Set<string>(), SHOWING: new Set<string>(),
    UNRESOLVED: new Set<string>(), VETO: new Set<string>(),
  }
  const opt = (id: string) => QUESTIONS.find((question) => question.id === id)!.options
  for (const deal of opt('dealbreaker')) {
    for (const qualifier of [undefined, ...(deal.qualifies ? QUALIFIERS[deal.qualifies].map((q) => q.id) : [])]) {
      for (const daily of opt('daily')) {
        for (const dq of [undefined, ...(daily.qualifies ? QUALIFIERS[daily.qualifies].map((q) => q.id) : [])]) {
          for (const project of [undefined, ...opt('project').map((o) => o.id)]) {
            for (const personalization of [undefined, 'all', 'some', 'notmuch']) {
              for (const location of ['fixed', 'strong', 'few', 'property']) {
                for (const extra of EXTRAS) {
                  const answers: V2Answers = {
                    version: 2,
                    dealbreaker: [qualifier ? { option: deal.id, qualifier } : { option: deal.id }],
                    daily: [dq ? { option: daily.id, qualifier: dq } : { option: daily.id }],
                    location,
                    ...extra,
                  }
                  if (project) answers.project = project
                  if (personalization) answers.personalization = personalization
                  const result = score(answers)
                  const brief = assembleBrief(result, strategyFor(result))
                  for (const entry of brief.skipFaster) reachable.SKIP.add(entry.id)
                  for (const entry of brief.secondLook) reachable.SECOND_LOOK.add(entry.id)
                  for (const entry of brief.showingTests) {
                    reachable.SHOWING.add(entry.qualifier ? `${entry.id}~${entry.qualifier}` : entry.id)
                  }
                  for (const entry of brief.unresolved) reachable.UNRESOLVED.add(entry.id)
                  for (const candidate of brief.flexOrder.candidates) {
                    if (candidate.veto) reachable.VETO.add(candidate.veto)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  const dead: string[] = []
  for (const key of Object.keys(SKIP)) if (!reachable.SKIP.has(key)) dead.push(`SKIP:${key}`)
  for (const key of Object.keys(SECOND_LOOK)) if (!reachable.SECOND_LOOK.has(key)) dead.push(`SECOND_LOOK:${key}`)
  for (const key of Object.keys(SHOWING)) if (!reachable.SHOWING.has(key)) dead.push(`SHOWING:${key}`)
  for (const key of Object.keys(UNRESOLVED)) if (!reachable.UNRESOLVED.has(key)) dead.push(`UNRESOLVED:${key}`)
  for (const key of Object.keys(VETO)) if (!reachable.VETO.has(key)) dead.push(`VETO:${key}`)
  assert.deepEqual(dead, [], 'catalogue entries nothing can reach')
})
