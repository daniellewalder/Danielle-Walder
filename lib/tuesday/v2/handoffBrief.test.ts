import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { FIXTURES } from './fixtures.ts'
import { HANDOFFS } from './handoff.fixtures.ts'
import { score } from './score.ts'
import { strategyFor } from './strategy.ts'
import { assembleBrief } from './brief.ts'
import { encode, decode } from './encode.ts'
import { isEmptyHandoff, type Handoff } from './handoff.ts'
import {
  BRIEF_SUBJECT, MAILTO_LIMIT, asText, briefBlocks, buildMailto, clipboardBrief,
  emailBody, mailtoHref,
} from './handoffBrief.ts'
import { tuesdayV2 } from '../../content/tuesdayV2.ts'

const read = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8')
const FLOW = read('components/tuesday/v2/HandoffFlow.tsx')
const FIELDS = read('components/tuesday/v2/HandoffFields.tsx')
const RESULT = read('components/tuesday/v2/TuesdayResultV2.tsx')

const URL_FOR = (fixture: keyof typeof FIXTURES) =>
  `https://daniellewalder.com/tuesday-test/result?a=${encode(FIXTURES[fixture].answers)}`

const briefFor = (fixture: keyof typeof FIXTURES, handoff?: Handoff) => {
  const result = score(FIXTURES[fixture].answers)
  return assembleBrief(result, strategyFor(result), handoff)
}

// ---------------------------------------------------------------------------
// The search details never reach the URL
// ---------------------------------------------------------------------------

test('no handoff field has any representation in the serialized payload', () => {
  /*
   * The whole point of keeping the two apart: a buyer can send their result to
   * a friend without also sending their budget, the boundary they asked for,
   * or where they drive.
   */
  const bare = encode(FIXTURES.t3_outdoorPoolConcern.answers)
  for (const [name, { handoff }] of Object.entries(HANDOFFS)) {
    const result = score(FIXTURES.t3_outdoorPoolConcern.answers)
    const loaded = assembleBrief(result, strategyFor(result), handoff)
    // Assembling with a handoff does not change the answers, and the answers
    // are the only thing that is ever encoded.
    assert.equal(encode(FIXTURES.t3_outdoorPoolConcern.answers), bare, name)
    assert.ok(loaded.searchFacts, name)
  }
  // And nothing private appears in the payload itself.
  for (const term of ['1600000', 'Mar Vista', 'Westwood', 'dialysis', 'El Segundo', 'minBeds', 'school']) {
    assert.ok(!bare.includes(term), `the payload carries ${term}`)
  }
})

test('the handoff lives in component state and is never pushed to the address bar', () => {
  // The flow owns the fields with useState and writes no url.
  assert.match(FLOW, /useState/)
  for (const leak of ['router.push', 'router.replace', 'history.pushState', 'searchParams.set', 'encode(']) {
    assert.ok(!FLOW.includes(leak), `the handoff flow writes to the url via ${leak}`)
  }
  assert.ok(!FLOW.includes('useRouter'), 'the handoff flow can navigate')
})

test('the handoff never rescores the test', () => {
  const answers = FIXTURES.t3_outdoorPoolConcern.answers
  const before = score(answers)
  for (const { handoff } of Object.values(HANDOFFS)) {
    const after = score(answers)
    const strip = (r: typeof before) => ({
      scales: r.scales,
      states: r.attributes.map((e) => [e.attribute.id, e.state, e.qualifier, e.evidence.direct]),
      stances: [...r.stances].sort(),
      map: r.map,
      sizeRoute: r.sizeRoute,
    })
    assert.deepEqual(strip(after), strip(before))
    // And the brief's evidence is untouched by the facts beside it.
    const bare = assembleBrief(before, strategyFor(before))
    const loaded = assembleBrief(before, strategyFor(before), handoff)
    assert.deepEqual(loaded.nonNegotiables, bare.nonNegotiables)
    assert.deepEqual(loaded.flexOrder, bare.flexOrder)
    assert.deepEqual(loaded.searchPattern, bare.searchPattern)
  }
})

// ---------------------------------------------------------------------------
// Optional means optional
// ---------------------------------------------------------------------------

test('an empty handoff is valid and produces a brief with no search details', () => {
  const brief = briefFor('r2_sizeAdditionOkay')
  assert.equal(brief.searchFacts, null)
  const text = clipboardBrief(brief, 'https://x.test/r')
  assert.ok(text.length > 0)
  assert.ok(!text.includes('The search details I gave'))
  assert.ok(buildMailto(brief, 'https://x.test/r').kind === 'ready')
})

test('a single search fact is valid', () => {
  for (const partial of [
    { price: { targetMax: 2_000_000 } },
    { schoolBoundary: 'Inside the Roscomare line.' },
    { destinations: ['the studio in Culver City'] },
    { hardFilters: { stairs: 'stepFreeNeeded' as const } },
    { propertyBasics: { minBeds: 4 } },
  ]) {
    assert.ok(!isEmptyHandoff(partial))
    const brief = briefFor('turnkey', partial)
    assert.ok(brief.searchFacts)
    const text = clipboardBrief(brief, 'https://x.test/r')
    assert.ok(text.includes('The search details I gave:'), JSON.stringify(partial))
  }
})

test('a fully specified handoff assembles every field', () => {
  const brief = briefFor('t1_strongMapLowRenoCosmetic', HANDOFFS.A_fullySpecified.handoff)
  const text = clipboardBrief(brief, 'https://x.test/r')
  for (const expected of [
    '$1.6m to $2.1m', 'Hard ceiling: $2.25m', 'actively looking now',
    'Mar Vista, Culver City, Playa del Rey', 'anything east of La Brea',
    'my office in El Segundo', 'single family', 'Minimum bedrooms: 3',
    'Minimum bathrooms: 2', '1,600 sq ft', 'Parking: required', 'prefers minimal stairs',
  ]) {
    assert.ok(text.includes(expected), `missing ${expected}`)
  }
})

// ---------------------------------------------------------------------------
// Fair housing: the constraint, never the reason
// ---------------------------------------------------------------------------

test('a school boundary travels word for word and gains nothing', () => {
  const stated = 'Needs to stay inside the Westwood Charter attendance boundary.'
  const brief = briefFor('fixedMap', { schoolBoundary: stated })
  for (const text of [
    clipboardBrief(brief, 'https://x.test/r'),
    emailBody(brief, { resultUrl: 'https://x.test/r' }),
  ]) {
    assert.ok(text.includes(stated), 'the boundary was not carried verbatim')
    for (const inferred of [
      'rating', 'rated', 'ranked', 'good school', 'school quality', 'test scores',
      'family', 'children', 'kids', 'important to', 'because',
    ]) {
      assert.ok(!text.toLowerCase().includes(inferred), `inferred "${inferred}" from a boundary`)
    }
  }
})

test('a destination travels word for word and gains no reason', () => {
  const places = ['the dialysis centre on Sawtelle', 'my mother in Sherman Oaks']
  const brief = briefFor('fewAreasMap', { destinations: places })
  const text = clipboardBrief(brief, 'https://x.test/r')
  for (const place of places) assert.ok(text.includes(place))
  for (const inferred of ['medical', 'health', 'worship', 'religio', 'employ', 'work at', 'family', 'care for', 'because', 'minutes', 'drive time']) {
    assert.ok(!text.toLowerCase().includes(inferred), `inferred "${inferred}" from a destination`)
  }
})

test('a bedroom count is a specification, never a household', () => {
  const brief = briefFor('turnkey', { propertyBasics: { minBeds: 4, minBaths: 3 } })
  const text = clipboardBrief(brief, 'https://x.test/r')
  assert.ok(text.includes('Minimum bedrooms: 4'))
  for (const inferred of ['children', 'kids', 'family', 'household', 'guests', 'room for', 'growing']) {
    assert.ok(!text.toLowerCase().includes(inferred), `inferred "${inferred}" from a bedroom count`)
  }
})

test('a step-free requirement is a filter, never a health reason', () => {
  const brief = briefFor('turnkey', { hardFilters: { stairs: 'stepFreeNeeded' } })
  const text = clipboardBrief(brief, 'https://x.test/r')
  assert.ok(text.includes('needs to be step-free'))
  for (const inferred of ['mobility', 'accessib', 'disab', 'health', 'age', 'elderly', 'injur', 'wheelchair']) {
    assert.ok(!text.toLowerCase().includes(inferred), `inferred "${inferred}" from a stairs requirement`)
  }
})

test('no form field asks why, anywhere', () => {
  const copy = JSON.stringify(tuesdayV2.result.handoff).toLowerCase()
  for (const asking of ['why ', 'reason', 'who will', 'who else', 'household', 'children', 'family', 'rating', 'good schools', 'how many people']) {
    assert.ok(!copy.includes(asking), `the form asks about "${asking}"`)
  }
})

// ---------------------------------------------------------------------------
// Discrepancies
// ---------------------------------------------------------------------------

test('an explicit pool conflict surfaces, and does not block anything', () => {
  const brief = briefFor('t3_outdoorPoolConcern', HANDOFFS.D_poolDiscrepancy.handoff)
  assert.equal(brief.discrepancies.length, 1)
  const text = clipboardBrief(brief, 'https://x.test/r')
  assert.ok(text.includes('One thing to clarify:'))
  assert.ok(/pool/i.test(text))
  // Still sendable.
  assert.equal(buildMailto(brief, 'https://x.test/r').kind, 'ready')
  // And the renderer never picks a side.
  assert.ok(!/you should|ignore the|is wrong|is right|instead of/i.test(text))
})

test('silence creates no discrepancy', () => {
  for (const handoff of [{}, HANDOFFS.E_silentOnPool.handoff, HANDOFFS.F_severalAreas.handoff]) {
    const brief = briefFor('t3_outdoorPoolConcern', isEmptyHandoff(handoff) ? undefined : handoff)
    assert.deepEqual(brief.discrepancies, [])
    assert.ok(!clipboardBrief(brief, 'https://x.test/r').includes('One thing to clarify'))
  }
})

test('a fixed map plus several named areas is not a discrepancy', () => {
  const brief = briefFor('fixedMap', HANDOFFS.F_severalAreas.handoff)
  assert.deepEqual(brief.discrepancies, [])
})

// ---------------------------------------------------------------------------
// One source for the clipboard and the email
// ---------------------------------------------------------------------------

const factual = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^Hi Danielle,$/.test(line))
    .filter((line) => !/^I took the Tuesday Test/.test(line))

test('the clipboard and the email say the same things', () => {
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    for (const handoff of [undefined, HANDOFFS.A_fullySpecified.handoff, HANDOFFS.D_poolDiscrepancy.handoff]) {
      const brief = briefFor(fixture, handoff)
      const url = URL_FOR(fixture)
      const clip = factual(clipboardBrief(brief, url))
      const mail = factual(emailBody(brief, { resultUrl: url }))
      assert.deepEqual(mail, clip, `${fixture} + ${handoff ? 'handoff' : 'bare'}`)
    }
  }
})

test('both read the frozen buyer renderer, and neither writes a sentence', () => {
  const source = readFileSync(new URL('./handoffBrief.ts', import.meta.url), 'utf8')
  assert.match(source, /from '\.\/render\/index\.ts'/)
  assert.match(source, /line\.buyer/)
  assert.ok(!source.includes('.agent'), 'the agent register reached the buyer brief')
  // No findings written here: the only literals are headings and the greeting.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  for (const sentence of [...code.matchAll(/'([^'\\]{30,})'/g)].map((m) => m[1])) {
    assert.ok(
      !/ (would|should|matters|protect|flex) /i.test(sentence),
      `handoffBrief writes copy: "${sentence}"`,
    )
  }
})

// ---------------------------------------------------------------------------
// The mailto length guard
// ---------------------------------------------------------------------------

test('every fixture and handoff pairing produces a safe mailto', () => {
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    for (const handoff of [undefined, ...Object.values(HANDOFFS).map((h) => h.handoff)]) {
      const built = buildMailto(briefFor(fixture, handoff), URL_FOR(fixture))
      assert.equal(built.kind, 'ready', `${fixture}: no safe mailto`)
      if (built.kind === 'ready') {
        assert.ok(built.href.length <= MAILTO_LIMIT, `${fixture}: ${built.href.length}`)
        assert.ok(built.href.startsWith('mailto:homes@daniellewalder.com?'))
        assert.ok(built.href.includes(encodeURIComponent(BRIEF_SUBJECT).replace(/%20/g, '%20')))
      }
    }
  }
})

test('the limit is measured on the encoded url, not the raw body', () => {
  const body = 'a b\nc d'
  const href = mailtoHref('x@y.test', BRIEF_SUBJECT, body)
  assert.ok(href.length > body.length)
  assert.ok(!href.includes('+'), 'a space encoded as + would show literally in the body')
  assert.ok(href.includes('%20'))
})

test('a very long note is dropped before the brief is, and the drop is reported', () => {
  const brief = briefFor(
    't1_strongMapLowRenoCosmetic',
    { ...HANDOFFS.A_fullySpecified.handoff, buyerNote: 'x '.repeat(600).trim() },
  )
  const built = buildMailto(brief, URL_FOR('t1_strongMapLowRenoCosmetic'))
  assert.equal(built.kind, 'ready')
  if (built.kind !== 'ready') return
  assert.equal(built.keptNote, false, 'the note was kept and the url is unsafe')
  assert.ok(built.href.length <= MAILTO_LIMIT)
  // The brief itself survived intact.
  assert.ok(built.body.includes('Has to have:'))
  assert.ok(built.body.includes('My full result:'))
  // And the full version, note and all, is still what the clipboard gets.
  assert.ok(clipboardBrief(brief, URL_FOR('t1_strongMapLowRenoCosmetic')).includes('A few other things:'))
})

test('a note long enough to break any mailto falls back rather than truncating', () => {
  const brief = briefFor('t1_strongMapLowRenoCosmetic', { buyerNote: 'y '.repeat(3000).trim() })
  const built = buildMailto(brief, URL_FOR('t1_strongMapLowRenoCosmetic'))
  // The note alone cannot be carried, so the brief goes without it rather than
  // the whole thing failing.
  assert.equal(built.kind, 'ready')
  if (built.kind === 'ready') assert.equal(built.keptNote, false)
})

test('when nothing safe can be built the caller is told, not left guessing', () => {
  // A result url long enough that even the shortest brief will not fit.
  const brief = briefFor('turnkey')
  const built = buildMailto(brief, `https://x.test/r?a=${'z'.repeat(2200)}`)
  assert.equal(built.kind, 'tooLong')
  if (built.kind === 'tooLong') assert.ok(built.body.length > 0, 'nothing to fall back to')
})

test('the page copies and says so when a mailto cannot be built', () => {
  assert.match(FLOW, /built\.kind === 'tooLong'/)
  assert.match(FLOW, /setTooLong\(true\)/)
  assert.match(FLOW, /void copyText\(built\.body/)
  assert.match(JSON.stringify(tuesdayV2.result.handoff.tooLong), /copied instead/)
})

// ---------------------------------------------------------------------------
// Nothing claims to have been sent
// ---------------------------------------------------------------------------

test('no wording claims a submission that did not happen', () => {
  const copy = JSON.stringify([tuesdayV2.result.cta, tuesdayV2.result.handoff]).toLowerCase()
  for (const lie of ['sent!', 'sent.', 'we have received', 'submitted', 'thanks for your submission', 'on its way']) {
    assert.ok(!copy.includes(lie), `the page claims "${lie}"`)
  }
  // And it says what the button actually does.
  assert.equal(tuesdayV2.result.handoff.open, 'Open email to Danielle')
  assert.match(tuesdayV2.result.handoff.openNote, /opens your email app/)
  assert.match(tuesdayV2.result.handoff.openNote, /Nothing is sent until you press send/)
})

test('the development placeholder is gone', () => {
  for (const source of [RESULT, FLOW, read('lib/content/tuesdayV2.ts')]) {
    for (const phrase of ['being built now', 'coming soon', 'next phase', 'not yet', 'under construction', 'work in progress']) {
      assert.ok(!source.toLowerCase().includes(phrase), `development language survives: ${phrase}`)
    }
  }
})

test('the clipboard failure has a stated fallback', () => {
  assert.match(FLOW, /catch \{\s*announce\('failed'\)/)
  assert.match(tuesdayV2.result.cta.copyFailed, /Select the brief below and copy it/)
})

// ---------------------------------------------------------------------------
// Copy rules and the form itself
// ---------------------------------------------------------------------------

test('no reader-facing em dash in anything this phase touched', () => {
  for (const source of [FLOW, FIELDS, RESULT, read('lib/content/tuesdayV2.ts'), read('lib/tuesday/v2/handoffBrief.ts')]) {
    assert.ok(!source.includes('\u2014'), 'an em dash reached a touched file')
    assert.ok(!source.includes('\u2013'), 'an en dash reached a touched file')
  }
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    const brief = briefFor(fixture, HANDOFFS.A_fullySpecified.handoff)
    assert.ok(!clipboardBrief(brief, URL_FOR(fixture)).includes('\u2014'), fixture)
  }
})

test('no model vocabulary reaches the brief a person reads', () => {
  const FORBIDDEN = [
    'protectAtPurchase', 'verifyPerProperty', 'realProject', 'corroboration',
    'statedRank', 'directSources', 'confidence', 'stance', 'conceptIndex',
    'changeability', 'provenance', 'lowRenovation', 'isDealbreaker', 'flexOrder',
    'secondLook.', 'inspect.', 'reject.', 'structuralWorkOkay', 'sizeRoute',
  ]
  for (const fixture of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    const text = clipboardBrief(briefFor(fixture, HANDOFFS.A_fullySpecified.handoff), URL_FOR(fixture))
    for (const term of FORBIDDEN) {
      assert.ok(!text.includes(term), `${fixture}: the brief says ${term}`)
    }
  }
})

test('the brief carries the sections that matter and not every section that exists', () => {
  const brief = briefFor('t3_outdoorPoolConcern', HANDOFFS.A_fullySpecified.handoff)
  const blocks = briefBlocks(brief, { resultUrl: 'https://x.test/r' })
  const headings = blocks.map((block) => block.heading).filter(Boolean)
  // Present: the operational ones.
  assert.ok(headings.includes('The search details I gave:'))
  assert.ok(headings.includes('Has to have:'))
  assert.ok(headings.includes('My full result:'))
  // Absent: the agent-only ones.
  for (const absent of ['Probably not worth the time:', 'Not the same thing:', 'Practical list:', 'The one to watch:']) {
    assert.ok(!headings.includes(absent), `the buyer brief carries ${absent}`)
  }
  // Showing checks are capped.
  const showing = blocks.find((block) => block.heading === 'Worth checking when we see something:')
  if (showing) assert.ok(showing.lines.length <= 4)
})

test('the snapshot leads, and the result link is near the end', () => {
  const blocks = briefBlocks(briefFor('turnkey'), { resultUrl: 'https://x.test/r' })
  assert.equal(blocks[0].heading, null, 'the brief does not open with the snapshot')
  assert.ok(blocks[0].lines.length > 0)
  assert.equal(blocks[blocks.length - 1].heading, 'My full result:')
})

test('the buyer note lands at the end, in their words, and only once', () => {
  const brief = briefFor('turnkey', { buyerNote: 'We looked at fifteen already.', price: { targetMax: 2_000_000 } })
  const text = clipboardBrief(brief, 'https://x.test/r')
  assert.equal(text.split('We looked at fifteen already.').length - 1, 1, 'the note appears twice')
  assert.ok(text.includes('A few other things:\nWe looked at fifteen already.'))
  assert.ok(text.indexOf('A few other things:') > text.indexOf('My full result:'))
})

test('the form uses real labels, not placeholders standing in for them', () => {
  assert.ok(!FIELDS.includes('placeholder='), 'a placeholder is doing a label job')
  assert.match(FIELDS, /<label htmlFor=\{id\}/)
  assert.match(FIELDS, /aria-describedby=\{helpId\}/)
  assert.match(FIELDS, /<legend/)
  assert.match(FLOW, /role="status" aria-live="polite"/)
})

test('optional is said once, not beside every field', () => {
  const copy = JSON.stringify(tuesdayV2.result.handoff)
  assert.ok((copy.match(/optional/gi) ?? []).length <= 1, 'optional is repeated down the form')
  assert.match(tuesdayV2.result.handoff.body, /All optional/)
})

// ---------------------------------------------------------------------------
// V1 is untouched
// ---------------------------------------------------------------------------

test('nothing here reaches V1', () => {
  for (const source of [FLOW, FIELDS, read('lib/tuesday/v2/handoffBrief.ts')]) {
    for (const entry of ["lib/tuesday/brief", "lib/tuesday/interpret", "lib/tuesday/score", "lib/tuesday/encode", "lib/tuesday/showing"]) {
      assert.ok(!source.includes(`from '@/${entry}'`), `imports ${entry}`)
      assert.ok(!source.includes(`from '../${entry.replace('lib/tuesday/', '')}.ts'`), `imports ${entry}`)
    }
  }
})

test('a V1 payload still has nothing to do with any of this', () => {
  const v1 = 'tuesday.quiet_dealbreaker.dark_daily.public-separation_inherit.renovation_whitehouse.mine_kitchen.never_location.strong'
  const { answers } = decode(v1)
  assert.deepEqual(answers, { version: 2 })
  assert.equal(score(answers).answered, 0)
})
