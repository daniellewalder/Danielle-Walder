import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from './fixtures.ts'
import { score } from './score.ts'
import { decode, encode, detectVersion } from './encode.ts'
import {
  CORE, EXCLUSIVE, answerQuestion, isComplete, nextStep, positionOf, qualifierNeeds,
  reconcile, selectTradeoff, setQualifier, setTradeoff, stepFromKey, stepKey, stepsFor,
  togglePick, tradeoffFor, tradeoffStillValid, questionById,
} from './flow.ts'
import type { V2Answers } from './answers.ts'

const EMPTY: V2Answers = { version: 2 }

/** Walk the flow the way a buyer would, answering with the given picks. */
const run = (picks: Readonly<Record<string, string>>): V2Answers => {
  let answers = EMPTY
  for (let guard = 0; guard < 20; guard += 1) {
    const step = nextStep(answers)
    if (!step) return answers
    if (step.kind === 'question') {
      const id = step.id
      if (id === 'dealbreaker' || id === 'daily') {
        for (const option of (picks[id] ?? '').split('+').filter(Boolean)) {
          answers = togglePick(answers, id, option, EXCLUSIVE[id])
        }
      } else {
        // A conditional the caller did not name still has to be answered, or
        // the walk never terminates. The default is the first option.
        const fallback = questionById(id)!.options[0].id
        answers = answerQuestion(answers, id, picks[id] ?? fallback)
      }
    } else if (step.kind === 'qualifier') {
      for (const need of qualifierNeeds(answers, step.question)) {
        answers = setQualifier(answers, step.question, need.option, picks[`${need.option}~`] ?? need.choices[0].id)
      }
    } else {
      const pair = tradeoffFor(answers)
      answers = setTradeoff(answers, pair.pair, picks.tradeoff ?? pair.pair[0], pair.family)
    }
  }
  throw new Error('the flow did not terminate')
}

// ---------------------------------------------------------------------------
// The engine is the controller
// ---------------------------------------------------------------------------

test('a new session starts on the first core question', () => {
  const step = nextStep(EMPTY)
  assert.deepEqual(step, { kind: 'question', id: 'tuesday' })
  assert.ok(!isComplete(EMPTY))
})

test('the core seven are asked in order, then the forced choice', () => {
  const answers = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  assert.ok(isComplete(answers))
  const keys = stepsFor(answers).map(stepKey)
  assert.deepEqual(keys, [...CORE, 'tradeoff'])
})

test('the forced choice is never offered before the core is answered', () => {
  let answers = EMPTY
  for (const id of CORE.slice(0, 6)) {
    answers = id === 'dealbreaker' || id === 'daily'
      ? togglePick(answers, id, id === 'dealbreaker' ? 'dark' : 'public', EXCLUSIVE[id])
      : answerQuestion(answers, id, { tuesday: 'quiet', architecture: 'some', personalization: 'all', project: 'never' }[id] ?? '')
    assert.ok(!stepsFor(answers).some((step) => step.kind === 'tradeoff'), `after ${id}`)
  }
})

test('a bundled pick adds a which-part screen, and only then', () => {
  let answers = togglePick(EMPTY, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  assert.ok(!stepsFor(answers).some((step) => step.kind === 'qualifier'))
  answers = togglePick(answers, 'dealbreaker', 'site', EXCLUSIVE.dealbreaker)
  assert.ok(stepsFor(answers).some((step) => stepKey(step) === 'part-dealbreaker'))
  const needs = qualifierNeeds(answers, 'dealbreaker')
  assert.equal(needs.length, 1)
  assert.equal(needs[0].attribute, 'site')
  assert.ok(needs[0].choices.length >= 4)
  assert.equal(needs[0].chosen, null)
})

test('two bundled picks share one which-part screen', () => {
  let answers = togglePick(EMPTY, 'daily', 'utility', EXCLUSIVE.daily)
  answers = togglePick(answers, 'daily', 'parking', EXCLUSIVE.daily)
  const screens = stepsFor(answers).filter((step) => step.kind === 'qualifier')
  assert.equal(screens.length, 1)
  assert.equal(qualifierNeeds(answers, 'daily').length, 2)
})

test('the depends follow-up appears only for the depends answer', () => {
  const withIt = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'depends', location: 'strong',
  })
  assert.ok(stepsFor(withIt).some((step) => stepKey(step) === 'depends'))
  const without = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  assert.ok(!stepsFor(without).some((step) => stepKey(step) === 'depends'))
})

test('the size-route follow-up appears only on both conditions', () => {
  const both = run({
    tuesday: 'room', dealbreaker: 'outgrow', daily: 'separation',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  assert.ok(stepsFor(both).some((step) => stepKey(step) === 'sizeRoute'))
  // Structural work accepted, size never protected.
  const noSize = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  assert.ok(!stepsFor(noSize).some((step) => stepKey(step) === 'sizeRoute'))
  // Size protected, no structural work.
  const noWork = run({
    tuesday: 'room', dealbreaker: 'outgrow', daily: 'separation',
    architecture: 'some', personalization: 'some', project: 'fixable', location: 'few',
  })
  assert.ok(!stepsFor(noWork).some((step) => stepKey(step) === 'sizeRoute'))
})

test('a conditional is never part of a fixed question count', () => {
  const plain = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  const withFollowUp = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'depends', location: 'strong',
  })
  assert.notEqual(stepsFor(plain).length, stepsFor(withFollowUp).length)
})

test('step keys round-trip, and an unknown key resolves to nothing', () => {
  for (const step of stepsFor(run({
    tuesday: 'room', dealbreaker: 'outgrow+site', daily: 'utility',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  }))) {
    assert.deepEqual(stepFromKey(stepKey(step)), step)
  }
  assert.equal(stepFromKey('nonsense'), null)
  assert.equal(stepFromKey(null), null)
})

// ---------------------------------------------------------------------------
// Back navigation
// ---------------------------------------------------------------------------

test('changing the project answer clears a now-unreachable follow-up', () => {
  const withFollowUp = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'depends', location: 'strong',
    depends: 'money',
  })
  assert.equal(withFollowUp.depends, 'money', 'the walk did not reach the follow-up')
  assert.ok(isComplete(withFollowUp))

  // Now change the answer that made it reachable.
  const changed = answerQuestion(withFollowUp, 'project', 'never')
  assert.equal(changed.depends, undefined, 'a stale follow-up survived')
  assert.ok(!stepsFor(changed).some((step) => stepKey(step) === 'depends'))

  // And going back to `depends` asks again rather than restoring the old answer.
  const again = answerQuestion(changed, 'project', 'depends')
  assert.equal(again.depends, undefined, 'a discarded answer came back')
  assert.deepEqual(nextStep(again), { kind: 'question', id: 'depends' })
})

test('losing the size conditions clears the size-route answer', () => {
  let answers = run({
    tuesday: 'room', dealbreaker: 'outgrow', daily: 'separation',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  answers = answerQuestion(answers, 'sizeRoute', 'addition')
  assert.equal(answers.sizeRoute, 'addition')
  // Withdraw the structural-work answer.
  const changed = answerQuestion(answers, 'project', 'never')
  assert.equal(changed.sizeRoute, undefined)
})

test('deselecting a bundled option removes its which-part answer', () => {
  let answers = togglePick(EMPTY, 'daily', 'utility', EXCLUSIVE.daily)
  answers = setQualifier(answers, 'daily', 'utility', 'pantry')
  assert.equal(answers.daily?.[0].qualifier, 'pantry')
  answers = togglePick(answers, 'daily', 'utility', EXCLUSIVE.daily)
  assert.deepEqual(answers.daily, [])
  // And reselecting asks again rather than remembering.
  answers = togglePick(answers, 'daily', 'utility', EXCLUSIVE.daily)
  assert.equal(answers.daily?.[0].qualifier, undefined)
  assert.equal(qualifierNeeds(answers, 'daily')[0].chosen, null)
})

test('a qualifier that does not belong to its option is dropped', () => {
  const bogus = reconcile({
    version: 2,
    daily: [{ option: 'utility', qualifier: 'pool' }],
  })
  assert.equal(bogus.daily?.[0].qualifier, undefined)
  const real = reconcile({ version: 2, daily: [{ option: 'upkeep', qualifier: 'pool' }] })
  assert.equal(real.daily?.[0].qualifier, 'pool')
})

test('a qualifier on an option that cannot take one is dropped', () => {
  const bogus = reconcile({ version: 2, dealbreaker: [{ option: 'dark', qualifier: 'land' }] })
  assert.equal(bogus.dealbreaker?.[0].qualifier, undefined)
})

// ---------------------------------------------------------------------------
// The forced choice, across a change of mind
// ---------------------------------------------------------------------------

const settled = (): V2Answers =>
  run({
    tuesday: 'quiet', dealbreaker: 'dark+privacy', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'fixed',
  })

test('going back without touching the evidence preserves the exact pair', () => {
  const before = settled()
  assert.ok(before.tradeoff)
  const pair = before.tradeoff.pair
  const winner = before.tradeoff.winner

  // Change something the pair does not depend on, twice over.
  let after = answerQuestion(before, 'personalization', 'notmuch')
  after = answerQuestion(after, 'architecture', 'notreally')
  assert.deepEqual(after.tradeoff?.pair, pair, 'the pair they answered was replaced')
  assert.equal(after.tradeoff?.winner, winner, 'their answer was discarded')
  assert.deepEqual(tradeoffFor(after).pair, pair)
})

test('a remount alone never produces a different forced choice', () => {
  const answers = settled()
  const first = tradeoffFor(answers)
  for (let again = 0; again < 5; again += 1) {
    assert.deepEqual(tradeoffFor(answers), first)
  }
})

test('changing the evidence behind the pair invalidates it', () => {
  const before = settled()
  const pair = before.tradeoff!.pair
  assert.ok(pair.includes('light') && pair.includes('privacy'), `pair was ${pair.join(' vs ')}`)
  // Replace both dealbreakers, so neither side of the pair is protected.
  let after = togglePick(before, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  after = togglePick(after, 'dealbreaker', 'privacy', EXCLUSIVE.dealbreaker)
  after = togglePick(after, 'dealbreaker', 'outgrow', EXCLUSIVE.dealbreaker)
  assert.equal(after.tradeoff, undefined, 'a pair survived the evidence that produced it')
  assert.ok(!isComplete(after), 'the forced choice was not asked again')
})

test('the map leaving the candidate set invalidates a pair that used it', () => {
  const answers = run({
    tuesday: 'quiet', dealbreaker: 'outside', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  if (!answers.tradeoff?.pair.includes('MAP')) return
  const fixed = answerQuestion(answers, 'location', 'fixed')
  assert.equal(fixed.tradeoff, undefined, 'the map was weighed after they said it does not move')
})

test('validity is about the pair standing, not about being the current pick', () => {
  const answers = settled()
  const pair = answers.tradeoff!.pair
  assert.ok(tradeoffStillValid(answers, pair))
  // A pair of two concepts this buyer never established cannot stand.
  assert.ok(!tradeoffStillValid(answers, ['circulation', 'utility']))
})

test('the recorded pair is what the result reads, not a fresh selection', () => {
  const answers = settled()
  const result = score(answers)
  assert.deepEqual(result.tradeoff?.pair, answers.tradeoff?.pair)
  assert.deepEqual(result.tradeoff?.family, answers.tradeoff?.family)
})

test('declining the forced choice is a real answer and completes the test', () => {
  let answers = settled()
  answers = setTradeoff(answers, answers.tradeoff!.pair, null, answers.tradeoff!.family)
  assert.equal(answers.tradeoff?.winner, null)
  assert.ok(isComplete(answers))
  assert.ok(score(answers).declinedTradeoff)
})

// ---------------------------------------------------------------------------
// Ordered multi-select
// ---------------------------------------------------------------------------

test('first tap is rank one, second is rank two, a third is ignored', () => {
  let answers = togglePick(EMPTY, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  answers = togglePick(answers, 'dealbreaker', 'privacy', EXCLUSIVE.dealbreaker)
  assert.deepEqual(answers.dealbreaker?.map((p) => p.option), ['dark', 'privacy'])
  // A third tap must not silently evict the first choice.
  answers = togglePick(answers, 'dealbreaker', 'street', EXCLUSIVE.dealbreaker)
  assert.deepEqual(answers.dealbreaker?.map((p) => p.option), ['dark', 'privacy'])
})

test('tapping a chosen option removes it and the other keeps its place', () => {
  let answers = togglePick(EMPTY, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  answers = togglePick(answers, 'dealbreaker', 'privacy', EXCLUSIVE.dealbreaker)
  answers = togglePick(answers, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  assert.deepEqual(answers.dealbreaker?.map((p) => p.option), ['privacy'])
})

test('the exclusive option clears the others, and is cleared by them', () => {
  let answers = togglePick(EMPTY, 'dealbreaker', 'dark', EXCLUSIVE.dealbreaker)
  answers = togglePick(answers, 'dealbreaker', 'none', EXCLUSIVE.dealbreaker)
  assert.deepEqual(answers.dealbreaker?.map((p) => p.option), ['none'])
  answers = togglePick(answers, 'dealbreaker', 'privacy', EXCLUSIVE.dealbreaker)
  assert.deepEqual(answers.dealbreaker?.map((p) => p.option), ['privacy'])

  let daily = togglePick(EMPTY, 'daily', 'public', EXCLUSIVE.daily)
  daily = togglePick(daily, 'daily', 'unsure', EXCLUSIVE.daily)
  assert.deepEqual(daily.daily?.map((p) => p.option), ['unsure'])
})

test('both dealbreakers reach the model at full strength', () => {
  const answers = run({
    tuesday: 'errands', dealbreaker: 'dark+privacy', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  const result = score(answers)
  const light = result.attributes.find((e) => e.attribute.id === 'light')!
  const privacy = result.attributes.find((e) => e.attribute.id === 'privacy')!
  assert.equal(light.state, 'protect')
  assert.equal(privacy.state, 'protect')
  // Rank is recorded, and it is the only thing the order changes.
  assert.equal(light.evidence.statedRank, 1)
  assert.equal(privacy.evidence.statedRank, 2)
  assert.equal(light.evidence.direct, privacy.evidence.direct)
})

test('the daily question does weight its second pick lower', () => {
  const answers = run({
    tuesday: 'errands', dealbreaker: 'dark', daily: 'separation+stairs',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  const result = score(answers)
  const first = result.attributes.find((e) => e.attribute.id === 'separation')!
  const second = result.attributes.find((e) => e.attribute.id === 'circulation')!
  assert.ok(first.evidence.direct > second.evidence.direct)
})

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

const roundTrip = (answers: V2Answers) => decode(encode(answers))

test('a finished V2 path round-trips through the URL exactly', () => {
  const answers = run({
    tuesday: 'room', dealbreaker: 'outgrow+site', 'site~': 'land', daily: 'utility+upkeep',
    'utility~': 'pantry', 'upkeep~': 'pool',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  const { answers: back, dropped } = roundTrip(answers)
  assert.deepEqual(dropped, [])
  assert.deepEqual(back, answers)
  assert.equal(detectVersion(encode(answers)).version, 2)
})

test('ordered picks keep their order through the URL', () => {
  const answers = run({
    tuesday: 'quiet', dealbreaker: 'privacy+dark', daily: 'stairs+public',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  const { answers: back } = roundTrip(answers)
  assert.deepEqual(back.dealbreaker?.map((p) => p.option), ['privacy', 'dark'])
  assert.deepEqual(back.daily?.map((p) => p.option), ['stairs', 'public'])
  assert.equal(score(back).attributes.find((e) => e.attribute.id === 'privacy')?.evidence.statedRank, 1)
})

test('qualifiers keep their option through the URL', () => {
  const answers = run({
    tuesday: 'quiet', dealbreaker: 'site', 'site~': 'neighbours', daily: 'parking+upkeep',
    'parking~': 'charging', 'upkeep~': 'planting',
    architecture: 'some', personalization: 'all', project: 'never', location: 'strong',
  })
  const { answers: back } = roundTrip(answers)
  assert.equal(back.dealbreaker?.[0].qualifier, 'neighbours')
  assert.deepEqual(
    back.daily?.map((p) => `${p.option}:${p.qualifier}`),
    ['parking:charging', 'upkeep:planting'],
  )
})

test('both follow-ups survive the URL', () => {
  let depends = run({
    tuesday: 'quiet', dealbreaker: 'dark', daily: 'public',
    architecture: 'some', personalization: 'all', project: 'depends', location: 'strong',
  })
  depends = answerQuestion(depends, 'depends', 'scale')
  assert.equal(roundTrip(depends).answers.depends, 'scale')

  let sizeRoute = run({
    tuesday: 'room', dealbreaker: 'outgrow', daily: 'separation',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  sizeRoute = answerQuestion(sizeRoute, 'sizeRoute', 'reconfigure')
  assert.equal(roundTrip(sizeRoute).answers.sizeRoute, 'reconfigure')
  assert.equal(score(roundTrip(sizeRoute).answers).sizeRoute, 'reconfigureOkay')
})

test('the pair that was presented survives the URL, winner and all', () => {
  const answers = settled()
  const { answers: back } = roundTrip(answers)
  assert.deepEqual(back.tradeoff, answers.tradeoff)
  assert.deepEqual(tradeoffFor(back).pair, answers.tradeoff!.pair)
})

test('a declined forced choice survives the URL as declined', () => {
  let answers = settled()
  answers = setTradeoff(answers, answers.tradeoff!.pair, null, answers.tradeoff!.family)
  const { answers: back } = roundTrip(answers)
  assert.equal(back.tradeoff?.winner, null)
  assert.ok(score(back).declinedTradeoff)
})

test('every fixture is reachable through the flow and round-trips', () => {
  for (const [name, { answers }] of Object.entries(FIXTURES)) {
    const { answers: back, dropped } = roundTrip(answers)
    assert.deepEqual(dropped, [], name)
    assert.deepEqual(back, answers, name)
  }
})

// ---------------------------------------------------------------------------
// Incomplete payloads
// ---------------------------------------------------------------------------

test('a partial payload resumes at the right step rather than inventing one', () => {
  const partial = decode('v.2_t.quiet_d.dark').answers
  assert.deepEqual(nextStep(partial), { kind: 'question', id: 'daily' })
  assert.ok(!isComplete(partial))
})

test('a payload missing the forced choice is incomplete, not completed for them', () => {
  const answers = settled()
  const { tradeoff, ...withoutIt } = answers
  assert.ok(!isComplete(withoutIt as V2Answers))
  assert.deepEqual(nextStep(withoutIt as V2Answers), { kind: 'tradeoff' })
})

test('a garbage payload yields an empty start, never a half-invented result', () => {
  const { answers, dropped } = decode('v.2_zz.nonsense_d.notanoption')
  assert.deepEqual(answers, { version: 2 })
  assert.ok(dropped.length >= 2)
  assert.deepEqual(nextStep(answers), { kind: 'question', id: 'tuesday' })
})

test('position is read from the path, never from a fixed table', () => {
  const answers = run({
    tuesday: 'room', dealbreaker: 'outgrow+site', 'site~': 'land', daily: 'separation',
    architecture: 'some', personalization: 'some', project: 'further', location: 'few',
  })
  const steps = stepsFor(answers)
  assert.equal(positionOf(answers, steps[0]), 0)
  assert.equal(positionOf(answers, steps[steps.length - 1]), steps.length - 1)
  // The which-part screen sits straight after the question that produced it.
  const part = steps.findIndex((step) => stepKey(step) === 'part-dealbreaker')
  assert.equal(stepKey(steps[part - 1]), 'dealbreaker')
})

test('the selector and the preserved pair agree when nothing has changed', () => {
  const answers = settled()
  assert.deepEqual(selectTradeoff(answers).pair, answers.tradeoff!.pair)
})
