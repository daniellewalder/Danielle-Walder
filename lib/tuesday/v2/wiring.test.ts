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
    assert.match(route, /v1=\{<Tuesday(Test|Result) \/>\}/)
    assert.match(route, /v2=\{<Tuesday(Test|Result)V2 \/>\}/)
  }
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
  assert.equal(tuesdayV2.tradeoff.prompt, 'Two of these came up. If you had to pick one, which survives?')
  assert.equal(tuesdayV2.tradeoff.decline, "I'd keep looking.")
})

// ---------------------------------------------------------------------------
// Progress must not promise a length
// ---------------------------------------------------------------------------

test('the progress readout carries no denominator', () => {
  assert.match(TEST_V2, /Question \{String\(position \+ 1\)/)
  assert.ok(!/\{sequence\.length\}|of \{|\/ \{String\(/.test(TEST_V2), 'a denominator reached the screen')
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
