import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QUESTIONS } from './questions.ts'
import { bandOf, score } from './score.ts'
import type { V2Answers } from './answers.ts'

const A = (partial: Omit<V2Answers, 'version'>): V2Answers => ({ version: 2, ...partial })

test('every conditional question is actually reachable', () => {
  /*
   * A follow-up that can never fire is dead code pretending to be a feature.
   * The contradiction needs `wantsFinished` and `willBuild` from two DIFFERENT
   * questions, because one question is single choice and cannot produce both.
   */
  const stanceSources = new Map<string, Set<string>>()
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      for (const stance of option.stances ?? []) {
        if (!stanceSources.has(stance)) stanceSources.set(stance, new Set())
        stanceSources.get(stance)!.add(question.id)
      }
    }
  }
  const finished = stanceSources.get('wantsFinished') ?? new Set()
  const build = stanceSources.get('willBuild') ?? new Set()
  const canCollide = [...finished].some((a) => [...build].some((b) => a !== b))
  assert.ok(
    canCollide,
    'wantsFinished and willBuild only arrive from the same single-choice question, so the contradiction can never fire',
  )
})

test('the depends follow-up fires on the depends answer and nothing else', () => {
  assert.equal(score(A({ project: 'depends' })).needs, 'depends')
  assert.equal(score(A({ project: 'fixable' })).needs, null)
  assert.equal(score(A({ project: 'done' })).needs, null)
})

test('the contradiction fires when the two positions arrive from two questions', () => {
  const conflicted = score(A({ personalization: 'finished', project: 'fixable' }))
  assert.ok(conflicted.stances.has('wantsFinished'))
  assert.ok(conflicted.stances.has('willBuild'))
  assert.equal(conflicted.conflict.present, true)
  assert.equal(conflicted.needs, 'contradiction')
})

test('agreeing answers produce no contradiction', () => {
  const agreed = score(A({ personalization: 'finished', project: 'done' }))
  assert.equal(agreed.conflict.present, false)
  assert.equal(agreed.needs, null)
})

test('a resolved contradiction stops reading as open', () => {
  const open = score(A({ personalization: 'finished', project: 'fixable' }))
  const settled = score(A({ personalization: 'finished', project: 'fixable', clarify: 'cosmetic' }))

  assert.equal(open.conflict.resolvedBy, null)
  assert.equal(open.needs, 'contradiction')

  assert.equal(settled.conflict.present, true, 'the history is kept')
  assert.equal(settled.conflict.resolvedBy, 'cosmetic', 'but it is settled')
  assert.equal(settled.needs, null, 'a settled contradiction must not keep asking')
})

test('the resolution actually moves the reading, it does not just get recorded', () => {
  const open = score(A({ personalization: 'finished', project: 'fixable' }))
  const cosmetic = score(A({ personalization: 'finished', project: 'fixable', clarify: 'cosmetic' }))
  const major = score(A({ personalization: 'finished', project: 'fixable', clarify: 'major' }))

  assert.ok(
    cosmetic.scales.renovationTolerance < open.scales.renovationTolerance,
    'choosing cosmetic did not lower renovation tolerance',
  )
  assert.ok(
    major.scales.renovationTolerance > cosmetic.scales.renovationTolerance,
    'the two resolutions read the same, so the follow-up changed nothing',
  )
  assert.ok(major.stances.has('structuralWorkOkay'))
})

test('only one follow-up is ever asked, and depends takes precedence', () => {
  const both = score(A({ personalization: 'finished', project: 'depends' }))
  assert.equal(both.needs, 'depends')
  const answered = score(A({ personalization: 'finished', project: 'depends', depends: 'money' }))
  assert.equal(answered.needs, null)
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
