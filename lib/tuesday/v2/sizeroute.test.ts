import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from './fixtures.ts'
import { questionById, QUESTIONS } from './questions.ts'
import { score, sizeRouteApplies, type Result } from './score.ts'
import { strategyFor, type Strategy } from './strategy.ts'
import { assembleBrief, type StructuredBrief } from './brief.ts'
import { encode, decode } from './encode.ts'
import type { V2Answers } from './answers.ts'

/*
 * The size route.
 *
 * It settles HOW a protected size may be satisfied, and nothing else. Size
 * stays exactly as protected as it was, no option creates an `expansion`
 * requirement, and the four answers have to produce four different searches
 * or the question was not worth asking.
 */

const QUALIFIED: V2Answers = {
  version: 2,
  tuesday: 'room',
  dealbreaker: [{ option: 'outgrow' }],
  architecture: 'some',
  personalization: 'some',
  project: 'further',
  location: 'few',
}

const build = (route?: string) => {
  const result = score(route ? { ...QUALIFIED, sizeRoute: route } : QUALIFIED)
  const strategy = strategyFor(result)
  return { result, strategy, brief: assembleBrief(result, strategy) }
}

const ROUTES = [
  ['existing', 'existingOnly'],
  ['addition', 'additionOkay'],
  ['reconfigure', 'reconfigureOkay'],
  ['seeit', 'propertySpecific'],
] as const

const ids = (brief: StructuredBrief) => [
  ...brief.skipFaster.map((e) => e.id),
  ...brief.doNotFlex.map((e) => e.id),
  ...brief.secondLook.map((e) => e.id),
  ...brief.showingTests.map((e) => e.id),
]

// ---------------------------------------------------------------------------
// Reachability and the trigger
// ---------------------------------------------------------------------------

test('the conditional is reachable', () => {
  const { result } = build()
  assert.equal(result.needs, 'sizeRoute')
  assert.equal(questionById('sizeRoute')?.showWhen, 'sizeRoute')
})

test('it fires only when size is protected AND structural work was accepted', () => {
  // Both conditions.
  assert.ok(sizeRouteApplies(new Set(['size']), new Set(['structuralWorkOkay'])))
  // Size protected, no structural work: not asked.
  assert.ok(!sizeRouteApplies(new Set(['size']), new Set(['willBuild'])))
  // Structural work accepted, size not protected: not asked.
  assert.ok(!sizeRouteApplies(new Set(['layout']), new Set(['structuralWorkOkay'])))
  assert.ok(!sizeRouteApplies(new Set(), new Set()))
})

test('a high renovation tolerance alone never triggers it', () => {
  // `fixable` gives renovationTolerance = yes without structuralWorkOkay, and
  // this buyer never protected size either.
  const result = score({ version: 2, dealbreaker: [{ option: 'dark' }], project: 'fixable', location: 'few' })
  assert.notEqual(result.needs, 'sizeRoute')
  // Even with size protected, a general appetite is not an accepted addition.
  const withSize = score({ version: 2, dealbreaker: [{ option: 'outgrow' }], project: 'fixable', location: 'few' })
  assert.ok(!withSize.stances.has('structuralWorkOkay'))
  assert.notEqual(withSize.needs, 'sizeRoute')
})

test('the depends follow-up still takes precedence', () => {
  // `depends` and `further` are different single-choice answers, so the two
  // triggers cannot both be live. The precedence is asserted anyway.
  const result = score({ version: 2, dealbreaker: [{ option: 'outgrow' }], project: 'depends', location: 'few' })
  assert.equal(result.needs, 'depends')
})

test('answering it closes the follow-up', () => {
  for (const [option] of ROUTES) assert.equal(build(option).result.needs, null)
})

test('an unanswered route is never defaulted', () => {
  assert.equal(build().result.sizeRoute, null)
  assert.equal(build().brief.searchPattern.sizeRoute, null)
})

// ---------------------------------------------------------------------------
// It changes the route, never the requirement
// ---------------------------------------------------------------------------

test('size stays protected at the same strength on every route', () => {
  const baseline = build().result.attributes.find((e) => e.attribute.id === 'size')!
  assert.equal(baseline.state, 'protect')
  for (const [option] of ROUTES) {
    const size = build(option).result.attributes.find((e) => e.attribute.id === 'size')!
    assert.equal(size.state, 'protect', `${option} changed the state of size`)
    assert.equal(size.evidence.direct, baseline.evidence.direct, `${option} changed how much size matters`)
    assert.deepEqual(size.evidence.directSources, baseline.evidence.directSources)
    assert.equal(size.evidence.statedRank, baseline.evidence.statedRank)
  }
})

test('no size-route option carries an attribute weight or a scale delta', () => {
  for (const option of questionById('sizeRoute')!.options) {
    assert.equal(option.attributes, undefined, `${option.id} scores an attribute`)
    assert.equal(option.attributesAtRankTwo, undefined, `${option.id} scores an attribute`)
    assert.equal(option.scales, undefined, `${option.id} moves a scale`)
    assert.ok(option.stances?.length, `${option.id} records no position`)
  }
})

test('no route ever creates an expansion attribute', () => {
  for (const option of [undefined, ...ROUTES.map(([o]) => o)]) {
    const { result } = build(option)
    assert.ok(!result.attributes.some((e) => e.attribute.id === 'expansion'), `${option} created expansion`)
    assert.ok(!JSON.stringify(result.attributes).includes('expansion'))
  }
  // And it is not in the taxonomy at all.
  assert.ok(!QUESTIONS.some((q) => q.options.some((o) => 'expansion' in (o.attributes ?? {}))))
})

test('the route never changes the map, the bands or the stances it did not set', () => {
  const bare = build()
  for (const [option] of ROUTES) {
    const loaded = build(option)
    assert.equal(loaded.result.map, bare.result.map, option)
    assert.deepEqual(loaded.result.scales, bare.result.scales, `${option} moved a scale`)
    const added = [...loaded.result.stances].filter((stance) => !bare.result.stances.has(stance))
    assert.equal(added.length, 1, `${option} set ${added.length} stances`)
    assert.ok(added[0].startsWith('size'), `${option} set an unrelated stance: ${added[0]}`)
  }
})

// ---------------------------------------------------------------------------
// The four routes produce four different searches
// ---------------------------------------------------------------------------

test('each route reads back as the route the buyer chose', () => {
  for (const [option, route] of ROUTES) {
    assert.equal(build(option).result.sizeRoute, route)
    assert.equal(build(option).brief.searchPattern.sizeRoute, route)
  }
})

test('all four routes produce different structured strategy', () => {
  const shapes = ROUTES.map(([option]) => ids(build(option).brief).sort().join('|'))
  assert.equal(new Set(shapes).size, 4, `routes collapsed: ${shapes.join('  //  ')}`)
})

test('existingOnly: undersized is eliminated, never kept on an enlargement guess', () => {
  const { brief } = build('existing')
  assert.ok(brief.skipFaster.some((e) => e.id === 'reject.undersized' && e.subject === 'size'))
  assert.ok(brief.doNotFlex.some((e) => e.id === 'hold.sizeRoute'))
  // The route is closed by their own answer, so it is vetoed, not unranked.
  const lever = brief.flexOrder.candidates.find((e) => e.lever === 'sizeRoute')
  assert.equal(lever?.status, 'vetoed')
  assert.equal(lever?.veto, 'sizeMustExistAlready')
  // And nothing keeps a smaller house in play.
  assert.ok(!brief.secondLook.some((e) => e.subject === 'size'))
  assert.ok(!brief.showingTests.some((e) => e.id === 'inspect.expansionFeasibility'))
})

test('additionOkay: undersized may stay in, and feasibility is still verified', () => {
  const { brief } = build('addition')
  const look = brief.secondLook.find((e) => e.id === 'secondLook.smallerWithPotential')
  assert.ok(look, 'an undersized house is not kept in play')
  // The appetite is established. Whether THIS house can take an addition is not.
  assert.ok(look.doesNotImply.includes('expansionIsFeasibleHere'))
  assert.ok(look.doesNotImply.includes('sizeIsNegotiable'))
  assert.ok(brief.showingTests.some((e) => e.id === 'inspect.expansionFeasibility'))
  assert.ok(!brief.skipFaster.some((e) => e.subject === 'size'))
})

test('reconfigureOkay: a bad plan may stay in, genuinely too small may not', () => {
  const { brief } = build('reconfigure')
  const look = brief.secondLook.find((e) => e.id === 'secondLook.badlyArrangedNotSmall')
  assert.ok(look, 'a badly arranged house is not kept in play')
  assert.ok(look.doesNotImply.includes('insufficientAreaIsAcceptable'))
  // The question is the plan, not an addition they said they do not want.
  assert.ok(brief.showingTests.some((e) => e.id === 'inspect.areaCanBeRearranged'))
  assert.ok(!brief.showingTests.some((e) => e.id === 'inspect.expansionFeasibility'))
  assert.ok(!brief.secondLook.some((e) => e.id === 'secondLook.smallerWithPotential'))
})

test('propertySpecific: nothing is decided from the listing', () => {
  const { brief } = build('seeit')
  assert.ok(brief.showingTests.some((e) => e.id === 'inspect.sizeSolvableHere'))
  // No second look, because keeping a smaller house in play would be deciding
  // the thing they said they could not decide without seeing it.
  assert.ok(!brief.secondLook.some((e) => e.subject === 'size'))
  assert.ok(!brief.skipFaster.some((e) => e.subject === 'size'))
})

test('the open question disappears once the route is settled', () => {
  assert.ok(build().brief.unresolved.some((e) => e.id === 'mustSpaceExistAlready'))
  for (const [option] of ROUTES) {
    assert.ok(
      !build(option).brief.unresolved.some((e) => e.id === 'mustSpaceExistAlready'),
      `${option} left the question open after answering it`,
    )
  }
})

test('every route action traces back to the size-route question', () => {
  for (const [option, route] of ROUTES) {
    const { brief } = build(option)
    const routeActions = [...ids(brief)].length
    assert.ok(routeActions > 0, option)
    for (const entry of [...brief.skipFaster, ...brief.doNotFlex, ...brief.secondLook, ...brief.showingTests]) {
      if (!entry.trace.because?.some((fact) => fact.includes('sizeRoute'))) continue
      assert.ok(entry.trace.sources?.includes('sizeRoute'), `${option}: ${entry.id} cites no sizeRoute answer`)
      assert.ok(entry.trace.because.includes(`sizeRoute = ${route}`), `${option}: ${entry.id}`)
    }
  }
})

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

test('the route survives a round trip through a shared link', () => {
  for (const [option] of ROUTES) {
    const answers = { ...QUALIFIED, sizeRoute: option }
    const { answers: back, dropped } = decode(encode(answers))
    assert.deepEqual(dropped, [])
    assert.equal(back.sizeRoute, option)
    assert.equal(score(back).sizeRoute, score(answers).sizeRoute)
  }
})

test('an unknown route in an old link degrades rather than defaulting', () => {
  const { answers, dropped } = decode(encode({ ...QUALIFIED, sizeRoute: 'existing' }).replace('s.existing', 's.whatever'))
  assert.equal(answers.sizeRoute, undefined)
  assert.ok(dropped.some((entry) => entry.includes('sizeRoute')))
  assert.equal(score(answers).sizeRoute, null)
})

test('the four fixtures cover the four routes', () => {
  const covered = new Set(
    (['r1_sizeExistingOnly', 'r2_sizeAdditionOkay', 'r3_sizeReconfigureOkay', 'r4_sizePropertySpecific'] as const)
      .map((name) => score(FIXTURES[name].answers).sizeRoute),
  )
  assert.deepEqual([...covered].sort(), ['additionOkay', 'existingOnly', 'propertySpecific', 'reconfigureOkay'])
})
