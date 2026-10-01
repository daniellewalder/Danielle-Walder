import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QUESTIONS, questionById } from './questions.ts'
import { bandOf, score, type Band } from './score.ts'
import { strategyFor } from './strategy.ts'
import { assembleBrief } from './brief.ts'
import type { V2Answers } from './answers.ts'

/*
 * The personalization scale.
 *
 * Four answers, four meanings, and before this they collapsed into two: at +1
 * "some" normalised to 0.667, above the 0.62 threshold, so it scored exactly
 * like "all of it" and the middle band could never occur at all.
 */

const answersWith = (personalization?: string): V2Answers => ({
  version: 2,
  dealbreaker: [{ option: 'dark' }],
  daily: [{ option: 'public' }],
  architecture: 'notreally',
  ...(personalization ? { personalization } : {}),
  project: 'never',
  location: 'strong',
})

const INTENDED: readonly [string, Band][] = [
  ['all', 'yes'],
  ['some', 'conditional'],
  ['notmuch', 'no'],
  ['finished', 'no'],
]

test('the four personalization answers land in the intended bands', () => {
  for (const [option, expected] of INTENDED) {
    const result = score(answersWith(option))
    assert.equal(bandOf('personalizationAppetite', result), expected, `${option} should be ${expected}`)
  }
})

test('every band of the personalization scale is reachable', () => {
  const reached = new Set(
    questionById('personalization')!.options.map((option) =>
      bandOf('personalizationAppetite', score(answersWith(option.id))),
    ),
  )
  for (const band of ['yes', 'conditional', 'no'] as const) {
    assert.ok(reached.has(band), `${band} is unreachable on the personalization scale`)
  }
})

test('no scale has an unreachable middle band', () => {
  // The defect generalised: a scale whose options cannot produce `conditional`
  // is one that collapses distinct answers into the same reading.
  const paths: V2Answers[] = []
  for (const project of [undefined, ...questionById('project')!.options.map((o) => o.id)]) {
    for (const personalization of [undefined, ...questionById('personalization')!.options.map((o) => o.id)]) {
      for (const depends of [undefined, ...questionById('depends')!.options.map((o) => o.id)]) {
        const answers: V2Answers = { version: 2, dealbreaker: [{ option: 'dark' }], location: 'few' }
        if (project) answers.project = project
        if (personalization) answers.personalization = personalization
        if (depends) answers.depends = depends
        paths.push(answers)
      }
    }
  }
  const reached: Record<string, Set<Band>> = {}
  for (const answers of paths) {
    const result = score(answers)
    for (const scale of ['personalizationAppetite', 'renovationTolerance', 'dayOneReadiness'] as const) {
      ;(reached[scale] ??= new Set()).add(bandOf(scale, result))
    }
  }
  for (const [scale, bands] of Object.entries(reached)) {
    assert.ok(bands.has('conditional'), `${scale} can never read as conditional`)
  }
})

test('"some" never produces a conclusion only high personalization licenses', () => {
  const result = score(answersWith('some'))
  const strategy = strategyFor(result)
  const brief = assembleBrief(result, strategy)

  assert.equal(brief.searchPattern.personalization, 'someChanges')
  // Not the cosmetic lever, and not a second look on a plain house. "I'd change
  // what bothers me" is not "a blank house is an opportunity".
  const lever = brief.flexOrder.candidates.find((entry) => entry.lever === 'cosmeticFinish')
  assert.equal(lever?.status, 'vetoed')
  assert.equal(lever?.veto, 'limitedCosmeticAppetite')
  assert.ok(!brief.secondLook.some((entry) => entry.id === 'secondLook.cosmeticallyPlain'))
  assert.ok(!brief.doNotFlex.some((entry) => entry.subject === 'cosmeticFinish'))
})

test('"some" and "all of it" are no longer the same buyer', () => {
  const some = assembleBrief(score(answersWith('some')), strategyFor(score(answersWith('some'))))
  const all = assembleBrief(score(answersWith('all')), strategyFor(score(answersWith('all'))))
  assert.notDeepEqual(some.flexOrder.candidates, all.flexOrder.candidates)
  assert.notEqual(some.searchPattern.personalization, all.searchPattern.personalization)
})

test('a low personalization answer never establishes renovation tolerance', () => {
  for (const option of ['notmuch', 'finished'] as const) {
    const bare: V2Answers = { version: 2, dealbreaker: [{ option: 'dark' }], personalization: option, location: 'few' }
    const result = score(bare)
    assert.equal(
      bandOf('renovationTolerance', result),
      'unset',
      `${option} moved the renovation scale`,
    )
  }
})

test('the personalization question is the only thing that moves its scale', () => {
  const movers = QUESTIONS.filter((question) =>
    question.options.some((option) => (option.scales?.personalizationAppetite ?? 0) !== 0),
  ).map((question) => question.id)
  assert.deepEqual(movers, ['personalization'])
})
