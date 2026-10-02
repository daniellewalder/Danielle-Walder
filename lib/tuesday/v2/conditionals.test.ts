import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QUESTIONS } from './questions.ts'
import { bandOf, score } from './score.ts'
import type { V2Answers } from './answers.ts'

const A = (partial: Omit<V2Answers, 'version'>): V2Answers => ({ version: 2, ...partial })

/*
 * THE RULE: a conditional exists because the evidence can genuinely produce
 * the state, not because we want the conditional to remain reachable.
 *
 * This brute-forces every single answer to every base question and collects
 * which follow-ups the engine ever asks for. Anything declared but never
 * reached is dead logic, and the only honest fixes are to remove it or to find
 * a real path. Broadening what another answer means, to keep it alive, is
 * exactly the overreach this test exists to prevent.
 */
test('no conditional exists unless a real answer path triggers it', () => {
  const base = QUESTIONS.filter((question) => !question.showWhen)
  const reachable = new Set<string>()

  const walk = (index: number, answers: Record<string, unknown>) => {
    if (index === base.length) {
      const needs = score({ version: 2, ...answers } as V2Answers).needs
      if (needs) reachable.add(needs)
      return
    }
    const question = base[index]
    for (const option of question.options) {
      const value =
        question.choose === 2 ? [{ option: option.id }] : option.id
      walk(index + 1, { ...answers, [question.id]: value })
    }
  }
  walk(0, {})

  const declared = QUESTIONS.filter((question) => question.showWhen).map((q) => q.showWhen!)
  for (const conditional of declared) {
    assert.ok(
      reachable.has(conditional),
      `the "${conditional}" follow-up is declared but no answer path can trigger it`,
    )
  }
  assert.deepEqual([...reachable].sort(), [...new Set(declared)].sort())
})

test('the contradiction follow-up is gone, not hidden', () => {
  // The union no longer contains it, so this compares as a plain string: the
  // type system is itself part of the proof that it is gone.
  assert.equal(
    QUESTIONS.some((question) => String(question.showWhen) === 'contradiction'),
    false,
  )
  // And the answer that was widened to keep it alive is back to what it means.
  const finished = QUESTIONS.find((q) => q.id === 'personalization')?.options.find(
    (o) => o.id === 'finished',
  )
  assert.equal(finished?.stances, undefined, 'preferring a finished house is not a refusal to renovate')
  const result = score({ version: 2, personalization: 'finished', project: 'fixable' })
  assert.equal(result.needs, null, 'a manufactured contradiction is still firing')
  assert.ok(!result.stances.has('wantsFinished'))
})

test('the depends follow-up fires on the depends answer and nothing else', () => {
  assert.equal(score(A({ project: 'depends' })).needs, 'depends')
  assert.equal(score(A({ project: 'fixable' })).needs, null)
  assert.equal(score(A({ project: 'done' })).needs, null)
})

test('a follow-up stops being asked once it is answered', () => {
  assert.equal(score(A({ project: 'depends' })).needs, 'depends')
  assert.equal(score(A({ project: 'depends', depends: 'money' })).needs, null)
})

test('the depends follow-up splits one bucket into four different buyers', () => {
  const readings = ['money', 'time', 'scale', 'house'].map((answer) => {
    const result = score(A({ project: 'depends', depends: answer }))
    return `${bandOf('renovationTolerance', result)}/${[...result.stances].join(',')}`
  })
  assert.equal(new Set(readings).size, 4, 'two depends answers produce the same reading')
})

test('an unanswered follow-up is unresolved, never defaulted to the middle', () => {
  const result = score(A({ project: 'depends' }))
  assert.equal(result.needs, 'depends')
  assert.ok(!result.stances.has('budgetLed'))
  assert.ok(!result.stances.has('timeLed'))
  assert.ok(!result.stances.has('scaleLimited'))
  assert.ok(!result.stances.has('propertyGated'))
})

test('a scale no answered question could move reads as unset, not as an answer', () => {
  const quiet = score(A({ dealbreaker: [{ option: 'dark' }], location: 'few' }))
  assert.equal(bandOf('renovationTolerance', quiet), 'unset')
  assert.equal(bandOf('personalizationAppetite', quiet), 'unset')
  assert.equal(bandOf('dayOneReadiness', quiet), 'unset')
})

test('structuralWorkOkay is a stance and creates no attribute', () => {
  const builder = score(A({ project: 'further' }))
  assert.ok(builder.stances.has('structuralWorkOkay'))
  assert.equal(builder.attributes.length, 0, 'the major-project answer established an attribute')
  assert.equal(bandOf('renovationTolerance', builder), 'yes')
})

test('wantsNeutral is a stance and never a negative score', () => {
  const plain = score(A({ architecture: 'plain' }))
  assert.ok(plain.stances.has('wantsNeutral'))
  assert.equal(plain.attributes.length, 0)
  const some = score(A({ architecture: 'some' }))
  assert.equal(some.attributes[0]?.evidence.direct, 1)
})
