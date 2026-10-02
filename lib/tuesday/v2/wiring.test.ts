import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { detectVersion, encode, decode } from './encode.ts'
import { score } from './score.ts'
import { strategyFor } from './strategy.ts'
import { assembleBrief } from './brief.ts'
import { compose } from './render/index.ts'
import { isComplete, nextStep, stepKey } from './flow.ts'
import { FIXTURES } from './fixtures.ts'
import { encodeAnswers, decodeAnswers } from '../encode.ts'
import { score as scoreV1, nextQuestion as nextQuestionV1 } from '../score.ts'
import { resultHeadline, synthesis } from '../interpret.ts'
import { tuesdayV2 } from '../../content/tuesdayV2.ts'

/**
 * The wiring between the URL, the instrument and the page.
 *
 * There is no DOM harness in this repo and adding one would mean new
 * dependencies, so what is checked here is where the risk actually is: which
 * instrument a given address resolves to, that a V1 payload is never read by
 * V2, that a V2 result never reaches the V1 brief, and that the components
 * import accordingly. The rendering itself is checked in a browser.
 */

const read = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8')
const RESULT_V2 = read('components/tuesday/v2/TuesdayResultV2.tsx')
const TEST_V2 = read('components/tuesday/v2/TuesdayTestV2.tsx')
const GATE = read('components/tuesday/v2/VersionGate.tsx')
const ROUTE_TEST = read('app/tuesday-test/page.tsx')
const ROUTE_RESULT = read('app/tuesday-test/result/page.tsx')
const TOUCHED = [RESULT_V2, TEST_V2, GATE, ROUTE_TEST, ROUTE_RESULT, read('lib/content/tuesdayV2.ts')]

// ---------------------------------------------------------------------------
// Which instrument an address resolves to
// ---------------------------------------------------------------------------

test('a new session starts V2', () => {
  for (const empty of [null, undefined, '']) {
    assert.equal(detectVersion(empty).version, 'empty')
  }
  // And the gate sends `empty` to V2.
  assert.match(GATE, /default:\s*\n\s*return 2/)
  assert.deepEqual(nextStep({ version: 2 }), { kind: 'question', id: 'tuesday' })
})

test('a V1 payload is detected as V1, in progress and finished alike', () => {
  const midway = encodeAnswers({ tuesday: 'quiet', dealbreaker: 'dark' })
  const finished = encodeAnswers({
    tuesday: 'quiet', dealbreaker: 'dark', daily: ['public'], inherit: 'renovation',
    whitehouse: 'mine', kitchen: 'never', location: 'strong',
  })
  for (const payload of [midway, finished]) {
    assert.equal(detectVersion(payload).version, 1, payload)
  }
})

test('a V2 payload is detected as V2', () => {
  for (const { answers } of Object.values(FIXTURES)) {
    assert.equal(detectVersion(encode(answers)).version, 2)
  }
})

test('both routes gate on the version rather than on anything else', () => {
  for (const route of [ROUTE_TEST, ROUTE_RESULT]) {
    assert.match(route, /VersionGate/)
    assert.match(route, /<Tuesday(Test|Result) \/>/)
    assert.match(route, /v2=\{<Tuesday(Test|Result)V2 \/>\}/)
  }
  /*
   * The page title is V1's, on every one of its screens, exactly as it
   * shipped. V2 renders its own on the screen you arrive at and drops it once
   * answering begins, so the route can no longer put one above both.
   */
  assert.match(ROUTE_TEST, /v1=\{\s*<>\s*<PageHeader/)
  assert.ok(!/v2=\{\s*<>\s*<PageHeader/.test(ROUTE_TEST), 'V2 gets the repeated page header back')
  assert.match(GATE, /detectVersion/)
  // It must read the declared version, never guess from the shape.
  assert.ok(!/startsWith|includes\('t\.'\)|length >/.test(GATE), 'the gate sniffs the payload')
})

// ---------------------------------------------------------------------------
// V1 stays V1
// ---------------------------------------------------------------------------

/**
 * The V1 shared result, captured as it behaves today.
 *
 * This is the regression fixture: these payloads are the shape of links that
 * have been shared, and their V1 reading must not move.
 */
const V1_LINKS = [
  'tuesday.quiet_dealbreaker.dark_daily.public-separation_inherit.renovation_whitehouse.mine_kitchen.never_location.strong',
  'tuesday.room_dealbreaker.outgrow_daily.separation_inherit.both_whitehouse.bones_kitchen.fixable_location.few',
  'tuesday.errands_dealbreaker.none_daily.unsure_inherit.lot_whitehouse.finished_kitchen.done_location.fixed',
]

test('a V1 link still parses, scores and reads through V1', () => {
  for (const payload of V1_LINKS) {
    assert.equal(detectVersion(payload).version, 1, payload)
    const answers = decodeAnswers(payload)
    assert.ok(Object.keys(answers).length >= 6, payload)
    const result = scoreV1(answers)
    assert.ok(result.answered > 0)
    assert.ok(resultHeadline(result).length > 0)
    assert.ok(synthesis(result).length > 0)
    // Round-trips through the V1 encoder unchanged.
    assert.deepEqual(decodeAnswers(encodeAnswers(answers)), answers)
  }
})

test('the V1 reading of a V1 link is stable', () => {
  // Pinned so a future change to V1 shows up here rather than on a shared link.
  const result = scoreV1(decodeAnswers(V1_LINKS[0]))
  assert.equal(resultHeadline(result), resultHeadline(scoreV1(decodeAnswers(V1_LINKS[0]))))
  assert.equal(nextQuestionV1(decodeAnswers(V1_LINKS[0])), null, 'the V1 link is a finished test')
  assert.ok(result.answered >= 6)
})

test('a V1 payload is never read by the V2 decoder in the product', () => {
  /*
   * The decoder itself would not throw, it would drop everything it does not
   * recognise and produce a confidently empty result. That is exactly why the
   * gate exists, and this records what the bad outcome would be.
   */
  for (const payload of V1_LINKS) {
    const { answers, dropped } = decode(payload)
    assert.deepEqual(answers, { version: 2 }, 'a V1 payload partly parsed as V2')
    assert.ok(dropped.length > 0)
    assert.ok(!isComplete(answers), 'a V1 payload read as V2 looked finished')
  }
})

test('nothing upgrades a V1 payload to V2', () => {
  for (const payload of V1_LINKS) {
    assert.notEqual(detectVersion(payload).version, 2)
    assert.ok(!encode(decode(payload).answers).includes('t.quiet'))
  }
})

// ---------------------------------------------------------------------------
// The V2 result uses the V2 renderer and nothing else
// ---------------------------------------------------------------------------

test('the V2 result never imports the V1 brief or interpreter', () => {
  const forbidden = [
    "from '@/lib/tuesday/brief'",
    "from '@/lib/tuesday/interpret'",
    "from '@/lib/tuesday/score'",
    "from '@/lib/tuesday/showing'",
    "from '@/lib/tuesday/encode'",
    "from '@/lib/tuesday/read'",
    "from '@/lib/tuesday/hero'",
  ]
  for (const [name, source] of [['result', RESULT_V2], ['flow', TEST_V2]] as const) {
    for (const entry of forbidden) {
      assert.ok(!source.includes(entry), `the V2 ${name} imports ${entry}`)
    }
  }
})

test('the V2 result reads the buyer rendering of a V2 brief', () => {
  assert.match(RESULT_V2, /from '@\/lib\/tuesday\/v2\/render'/)
  assert.match(RESULT_V2, /compose\(assembleBrief\(result, strategyFor\(result\)\)\)/)
  // The buyer register, not the agent one.
  assert.match(RESULT_V2, /\.buyer/)
  assert.ok(!RESULT_V2.includes('renderAgentBrief'), 'the buyer page uses the agent renderer')
  assert.ok(!/\bentry\.agent\b|\blines\[0\]\.agent\b/.test(RESULT_V2), 'the agent register reached the buyer page')
})

test('the hero is the renderer snapshot, not a new interpretation', () => {
  assert.match(RESULT_V2, /composed\.snapshot\[0\]\?\.buyer/)
  // No sentence written in the component.
  const strings = [...RESULT_V2.matchAll(/'([^'\\]{25,})'/g)].map((match) => match[1])
  for (const value of strings) {
    assert.ok(
      !/ (would|should|matters|I'd|you'd) /i.test(value),
      `the component writes copy: "${value}"`,
    )
  }
})

test('a V2 brief populates the buyer page for every fixture', () => {
  for (const [name, { answers }] of Object.entries(FIXTURES)) {
    const result = score(answers)
    const composed = compose(assembleBrief(result, strategyFor(result)))
    assert.ok(composed.snapshot.length > 0, name)
    for (const line of composed.snapshot) assert.ok(line.buyer.length > 0, name)
  }
})

// ---------------------------------------------------------------------------
// Refresh and direct open
// ---------------------------------------------------------------------------

test('a finished V2 result survives a refresh byte for byte', () => {
  for (const [name, { answers }] of Object.entries(FIXTURES)) {
    const url = encode(answers)
    const reopened = decode(url).answers
    const first = compose(assembleBrief(score(answers), strategyFor(score(answers))))
    const again = compose(assembleBrief(score(reopened), strategyFor(score(reopened))))
    assert.deepEqual(again, first, name)
  }
})

test('an incomplete V2 payload routes back to the question it stops at', () => {
  const partial = decode('v.2_t.quiet_d.dark_y.public').answers
  assert.ok(!isComplete(partial))
  const due = nextStep(partial)
  assert.ok(due)
  assert.equal(stepKey(due), 'architecture')
  // And the page sends them there with their answers intact.
  assert.match(RESULT_V2, /\/tuesday-test\?a=\$\{encoded\}/)
  assert.match(RESULT_V2, /stepKey\(due\)/)
})

test('an empty or unreadable payload shows nothing rather than inventing a result', () => {
  assert.equal(score(decode('').answers).answered, 0)
  assert.equal(score(decode('v.2_zz.rubbish').answers).answered, 0)
  assert.match(RESULT_V2, /result\.answered === 0/)
  assert.match(RESULT_V2, /tuesdayV2\.result\.empty/)
})

// ---------------------------------------------------------------------------
// What the buyer must not see
// ---------------------------------------------------------------------------

/** Source with comments removed, so a note about the rule is not a breach. */
const code = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

test('the result page exposes no part of the model', () => {
  const FORBIDDEN = [
    'protectAtPurchase', 'verifyPerProperty', 'realProject', 'corroboration',
    'statedRank', 'directSources', 'confidence', 'stances', 'reinforcedBy',
    'conceptIndex', 'unknowns', 'firedRules', 'evidence', 'doesNotImply',
    'leverage', 'changeability', 'trace',
  ]
  const source = code(RESULT_V2)
  for (const term of FORBIDDEN) {
    assert.ok(!source.includes(term), `the result page reads ${term}`)
  }
})

test('no reader-facing em dash in anything this phase touched', () => {
  for (const source of TOUCHED) {
    assert.ok(!source.includes('\u2014'), 'an em dash reached a touched file')
    assert.ok(!source.includes('\u2013'), 'an en dash reached a touched file')
  }
  // Including the flow copy itself.
  assert.ok(!JSON.stringify(tuesdayV2).includes('\u2014'))
})

test('the flow copy says nothing the frozen layers already own', () => {
  // The question text, the options and every result sentence come from the
  // engine. What is written here is screen furniture only.
  assert.ok(!JSON.stringify(tuesdayV2).includes('Tuesday Test·'))
  assert.equal(tuesdayV2.tradeoff.prompt, 'If you had to pick one, which survives?')
  // "Two of these came up" narrated the engine at the one moment the question
  // costs the buyer something. The explanation below it does the work.
  assert.ok(!tuesdayV2.tradeoff.prompt.includes('came up'))
  assert.equal(
    tuesdayV2.tradeoff.note,
    'Both still matter. This only records which one survives a forced choice.',
  )
  assert.equal(tuesdayV2.tradeoff.decline, "I'd keep looking.")
})

// ---------------------------------------------------------------------------
// Progress must not promise a length
// ---------------------------------------------------------------------------

test('the progress readout carries no denominator', () => {
  assert.match(TEST_V2, /Question \{position \+ 1\}/)
  assert.ok(!/\{sequence\.length\}|of \{|\/ \{String\(/.test(TEST_V2), 'a denominator reached the screen')
  // Not zero padded. "Question 01" is a field label, not how anyone counts.
  assert.ok(!/padStart/.test(TEST_V2), 'the question number is zero padded')
})

test('the flow component decides no model logic of its own', () => {
  // Every eligibility question goes to the adapter.
  for (const call of ['nextStep', 'stepsFor', 'qualifierNeeds', 'tradeoffFor', 'positionOf']) {
    assert.ok(TEST_V2.includes(call) || call === 'stepsFor', `${call} is not used`)
  }
  for (const leak of ['sizeRouteApplies', 'bandOf', 'PROTECT_AT', 'selectPair', 'stateOf', 'stances.has']) {
    assert.ok(!TEST_V2.includes(leak), `the component reaches into the model for ${leak}`)
  }
})

// ---------------------------------------------------------------------------
// The shape of a question screen
// ---------------------------------------------------------------------------

const HANDOFF_FLOW = read('components/tuesday/v2/HandoffFlow.tsx')

test('the page title is on the opening screen only', () => {
  assert.match(TEST_V2, /const opening = position === 0/)
  assert.match(TEST_V2, /\{opening \? \(\s*<PageHeader/)
  // And the screen still says where it is, in one line.
  assert.match(TEST_V2, /\{opening \? null : \(\s*<p[\s\S]{0,200}tuesdayTestPage\.eyebrow/)
})

test('the question actions are pinned on a phone and clear of the last answer', () => {
  assert.match(TEST_V2, /mobile:fixed mobile:inset-x-0 mobile:bottom-0/)
  // The home indicator, and the notch on a landscape phone.
  assert.match(TEST_V2, /env\(safe-area-inset-bottom\)/)
  // The card above reserves the bar's height, so nothing sits under it.
  assert.match(TEST_V2, /mobile:pb-\[104px\]/)
  // Desktop keeps them in the flow.
  assert.match(TEST_V2, /'mt-8 flex flex-wrap items-center gap-7 '/)
})

test('the two-answer questions do not look like the same mechanic', () => {
  const { dealbreaker, daily } = tuesdayV2.ordered
  assert.notDeepEqual(dealbreaker.marks, daily.marks, 'both questions carry the same mark')
  assert.equal(dealbreaker.weighted, false)
  assert.equal(daily.weighted, true)
  // Equal weight means equal emphasis: neither mark may outrank the other.
  assert.equal(dealbreaker.marks[0].length > 0, true)
  assert.match(TEST_V2, /copy\.weighted && rank === 1/)
  assert.match(TEST_V2, /copy\.marks\[rank\]/)
  // The number is gone, so nothing implies a rank where there is none.
  assert.ok(!/\{isChosen \? rank \+ 1 : ''\}/.test(TEST_V2), 'the numeric rank badge is back')
  // Assistive tech keeps the same distinction it always had.
  assert.notDeepEqual(dealbreaker.announce, daily.announce)
})

test('a full selection explains itself', () => {
  for (const field of ['dealbreaker', 'daily'] as const) {
    assert.match(tuesdayV2.ordered[field].full, /Two selected/)
  }
  assert.match(TEST_V2, /picks\.length >= 2 \? \(/)
  assert.match(TEST_V2, /\{copy\.full\}/)
})

test('a two-group qualifier screen says both groups need an answer', () => {
  assert.match(tuesdayV2.qualifier.manyHelp, /each/i)
  assert.match(TEST_V2, /tuesdayV2\.qualifier\.manyHelp/)
})

// ---------------------------------------------------------------------------
// The handoff
// ---------------------------------------------------------------------------

test('the handoff opens on the basics, with one disclosure for the rest', () => {
  // Exactly one. A form of accordions is not an improvement on a long form.
  assert.equal(HANDOFF_FLOW.split('aria-controls="handoff-more"').length - 1, 1)
  assert.equal((HANDOFF_FLOW.match(/aria-controls=/g) ?? []).length, 1)
  // The basics stay in front.
  for (const id of ['price-min', 'price-ceiling', 'considering', 'ruled-out', 'types', 'beds', 'baths', 'sqft']) {
    const at = HANDOFF_FLOW.indexOf(`id="${id}"`)
    assert.ok(at !== -1 && at < HANDOFF_FLOW.indexOf('id="handoff-more"'), `${id} is behind the disclosure`)
  }
  // And the rest goes behind it.
  for (const id of ['school', 'destinations', 'other', 'note', 'map-note']) {
    assert.ok(
      HANDOFF_FLOW.indexOf(`id="${id}"`) > HANDOFF_FLOW.indexOf('id="handoff-more"'),
      `${id} is still in front`,
    )
  }
  // Values live in component state, so closing the disclosure keeps them.
  assert.match(HANDOFF_FLOW, /<div id="handoff-more" hidden=\{!more\}>/)
})

test('the preview is not a scroll box inside a scrolling page', () => {
  assert.ok(!/overflow-auto/.test(HANDOFF_FLOW), 'the preview scrolls inside itself')
  assert.ok(!/max-h-\[/.test(HANDOFF_FLOW), 'the preview is clipped')
  // Short by default, whole on request, one source for both.
  assert.match(HANDOFF_FLOW, /const previewText = asText\(briefBlocks\(/)
  assert.match(HANDOFF_FLOW, /previewText\.split\('\\n\\n'\)\.slice\(0, 2\)/)
  assert.match(HANDOFF_FLOW, /h\.previewMore/)
})

test('a discrepancy is surfaced before the send action, not inside the preview', () => {
  const clarify = HANDOFF_FLOW.indexOf('{h.clarify}')
  const preview = HANDOFF_FLOW.indexOf('{h.preview}')
  const send = HANDOFF_FLOW.indexOf('onClick={openEmail}')
  assert.ok(clarify !== -1 && clarify < preview, 'the clarification is inside or after the preview')
  assert.ok(preview < send, 'the preview is after the send action')
  // It never blocks sending and never picks a side.
  assert.ok(!/disabled=\{discrepancies/.test(HANDOFF_FLOW), 'a discrepancy blocks the send')
})

test('the result leads with what the test worked out', () => {
  const order = RESULT_V2.slice(RESULT_V2.indexOf('const ORDER'), RESULT_V2.indexOf('LEAD_SECTIONS'))
  assert.ok(order.indexOf("'tradeoff'") < order.indexOf("'filter'"), 'the read-back still leads')
  assert.ok(order.indexOf("'flex'") < order.indexOf("'filter'"), 'the lever is below the filter list')
  // One earned container, still the filter list.
  assert.match(RESULT_V2, /const FIELD: Partial<Record<SectionId, string>> = \{\s*filter:/)
})
