import assert from 'node:assert/strict'
import { test } from 'node:test'
import { independentSources, isRepeated, stateOf } from './model.ts'
import { score } from './score.ts'
import type { V2Answers } from './answers.ts'

const A = (partial: Omit<V2Answers, 'version'>): V2Answers => ({ version: 2, ...partial })
const of = (result: ReturnType<typeof score>, id: string) =>
  result.attributes.find((entry) => entry.attribute.id === id)

test('both dealbreaker picks are direct 3, and rank is stored apart from importance', () => {
  const result = score(A({ dealbreaker: [{ option: 'dark' }, { option: 'privacy' }] }))
  const light = of(result, 'light')
  const privacy = of(result, 'privacy')
  assert.equal(light?.evidence.direct, 3)
  assert.equal(privacy?.evidence.direct, 3, 'the second dealbreaker was down-weighted')
  assert.equal(light?.state, 'protect')
  assert.equal(privacy?.state, 'protect')
  assert.equal(light?.evidence.statedRank, 1)
  assert.equal(privacy?.evidence.statedRank, 2)
})

test('two dealbreaker picks are one provenance source', () => {
  const result = score(A({ dealbreaker: [{ option: 'dark' }, { option: 'privacy' }] }))
  assert.deepEqual([...(of(result, 'light')?.evidence.corroboration ?? [])], ['dealbreaker'])
  assert.equal(independentSources(of(result, 'privacy')!.evidence), 1)
  assert.equal(of(result, 'privacy')?.repeated, false)
})

test('the daily secondary is weaker and lands in scrutinize', () => {
  const result = score(A({ daily: [{ option: 'separation' }, { option: 'stairs' }] }))
  assert.equal(of(result, 'separation')?.evidence.direct, 3)
  assert.equal(of(result, 'separation')?.state, 'protect')
  assert.equal(of(result, 'circulation')?.evidence.direct, 2)
  assert.equal(of(result, 'circulation')?.state, 'scrutinize')
})

test('two daily picks are one provenance source', () => {
  const result = score(A({ daily: [{ option: 'separation' }, { option: 'stairs' }] }))
  assert.deepEqual([...(of(result, 'circulation')?.evidence.corroboration ?? [])], ['daily'])
})

test('recurrence needs two different questions, not two picks in one', () => {
  const oneQuestion = score(A({ dealbreaker: [{ option: 'dark' }, { option: 'privacy' }] }))
  assert.equal(oneQuestion.attributes.some((entry) => entry.repeated), false)

  const twoQuestions = score(A({ tuesday: 'quiet', dealbreaker: [{ option: 'privacy' }] }))
  assert.equal(of(twoQuestions, 'privacy')?.repeated, true)
  assert.equal(independentSources(of(twoQuestions, 'privacy')!.evidence), 2)
})

test('qualifiers add vocabulary, never weight or provenance', () => {
  const bare = score(A({ daily: [{ option: 'utility' }] }))
  const qualified = score(A({ daily: [{ option: 'utility', qualifier: 'storage' }] }))

  assert.equal(bare.attributes.find((e) => e.attribute.id === 'utility')?.evidence.direct, 3)
  assert.equal(qualified.attributes.find((e) => e.attribute.id === 'utility')?.evidence.direct, 3)
  assert.deepEqual(
    [...(qualified.attributes.find((e) => e.attribute.id === 'utility')?.evidence.corroboration ?? [])],
    ['daily'],
  )
  assert.equal(of(bare, 'utility')?.qualifier, null)
  assert.equal(of(qualified, 'utility')?.qualifier, 'storage')
})

test('a site dealbreaker carries its qualifier without changing its evidence', () => {
  const result = score(A({ dealbreaker: [{ option: 'site', qualifier: 'land' }] }))
  assert.equal(of(result, 'site')?.evidence.direct, 3)
  assert.equal(of(result, 'site')?.qualifier, 'land')
  assert.equal(independentSources(of(result, 'site')!.evidence), 1)
})

// ---------------------------------------------------------------------------
// The tradeoff produces ordering, never importance
// ---------------------------------------------------------------------------

const TWO_PROTECTED = {
  dealbreaker: [{ option: 'dark' }, { option: 'privacy' }],
} as const

test('a tradeoff win adds no direct importance', () => {
  const before = score(A({ ...TWO_PROTECTED }))
  const after = score(
    A({ ...TWO_PROTECTED, tradeoff: { pair: ['light', 'privacy'], winner: 'light', family: 'setting' } }),
  )
  assert.equal(of(before, 'light')?.evidence.direct, of(after, 'light')?.evidence.direct)
})

test('a tradeoff loss reduces nothing, and a protected loser stays protected', () => {
  const after = score(
    A({ ...TWO_PROTECTED, tradeoff: { pair: ['light', 'privacy'], winner: 'light', family: 'setting' } }),
  )
  const privacy = of(after, 'privacy')
  assert.equal(privacy?.evidence.direct, 3, 'losing a forced choice reduced importance')
  assert.equal(privacy?.state, 'protect', 'a protected loser must stay protected')
  assert.deepEqual(privacy?.evidence.ordering, [
    { against: 'light', outcome: 'lost', question: 'tradeoff' },
  ])
})

test('a tradeoff cannot push anything across the protect threshold', () => {
  const result = score(
    A({ tradeoff: { pair: ['site', 'condition'], winner: 'site', family: 'fallbackSite' } }),
  )
  const site = of(result, 'site')
  assert.equal(site?.evidence.direct, 0)
  assert.equal(site?.state, 'scrutinize', 'a win with no direct evidence is not a requirement')
  assert.equal(of(result, 'condition')?.state, 'flexibilityToTest')
})

test('tradeoff evidence stays identifiable as tradeoff evidence', () => {
  const result = score(
    A({ ...TWO_PROTECTED, tradeoff: { pair: ['light', 'privacy'], winner: 'light', family: 'setting' } }),
  )
  const light = of(result, 'light')!
  assert.deepEqual([...light.evidence.directSources], ['dealbreaker'])
  assert.deepEqual([...light.evidence.corroboration], ['dealbreaker', 'tradeoff'])
  assert.equal(light.evidence.ordering[0].question, 'tradeoff')
  assert.equal(light.repeated, true, 'a separate question is a genuine second interaction')
})

test('declining the tradeoff establishes no ordering at all', () => {
  const result = score(
    A({ ...TWO_PROTECTED, tradeoff: { pair: ['light', 'privacy'], winner: null, family: 'setting' } }),
  )
  assert.equal(result.declinedTradeoff, true)
  assert.ok(result.stances.has('narrowCriteria'))
  assert.deepEqual(of(result, 'light')?.evidence.ordering, [])
  assert.deepEqual(of(result, 'privacy')?.evidence.ordering, [])
})

test('the presented pair is echoed on the result, never re-derived', () => {
  const tradeoff = { pair: ['light', 'privacy'], winner: 'light', family: 'setting' } as const
  const result = score(A({ ...TWO_PROTECTED, tradeoff }))
  assert.deepEqual(result.tradeoff, tradeoff)
})

// ---------------------------------------------------------------------------
// Derived states are never evidence
// ---------------------------------------------------------------------------

test('one answer reaching several result states is still one source', () => {
  const result = score(A({ project: 'done' }))
  const condition = of(result, 'condition')!
  const kitchen = of(result, 'kitchen')!
  assert.deepEqual([...condition.evidence.corroboration], ['project'])
  assert.deepEqual([...kitchen.evidence.corroboration], ['project'])
  assert.equal(condition.repeated, false)
  // It legitimately reaches two attributes, a scale and a stance from one click.
  assert.ok(result.stances.has('wantsFinished'))
  assert.ok(result.scales.dayOneReadiness > 0)
})

test('an unanswered test produces no verdict and no invented evidence', () => {
  const result = score(A({}))
  assert.equal(result.answered, 0)
  assert.equal(result.attributes.length, 0)
  assert.equal(result.unknowns.length, 18)
  assert.equal(result.map, null)
})

test('stateOf keeps ordering and importance apart', () => {
  const protectedLoser = {
    direct: 3,
    directSources: ['dealbreaker'],
    corroboration: ['dealbreaker', 'tradeoff'],
    ordering: [{ against: 'light', outcome: 'lost' as const, question: 'tradeoff' }],
    statedRank: 1,
  }
  assert.equal(stateOf(protectedLoser), 'protect')
  assert.equal(isRepeated(protectedLoser), true)
})
