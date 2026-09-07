import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fixtureArea } from './areas/__fixture.ts'
import { calabasas } from './areas/calabasas.ts'
import { places } from './places.ts'
import type { Area, FactBlock, Place, Provenance } from './types.ts'
import {
  areaInvariantViolations,
  isGuideRenderable,
  isPublishable,
  isRenderable,
  publicationBlockers,
  publishedAreas,
  renderableFact,
  renderablePlaces,
  stalenessReport,
} from './verify.ts'

/**
 * The verification gates are the safety model for every factual claim on an
 * area guide, so they are tested against fixtures rather than only against the
 * one real area. Run with `npm test`.
 */

const source = { kind: 'government', label: 'Test source', url: 'https://example.gov/x', sourceDate: null } as const

const good: Provenance = { sources: [source], lastVerified: '2026-09-05', nextReview: '2026-12-05' }

const block = (provenance: Provenance): FactBlock => ({ body: ['A verified sentence.'], provenance })

const place = (id: string, provenance: Provenance, overrides: Partial<Place> = {}): Place => ({
  id,
  name: id,
  category: 'park',
  areaIds: ['fixture'],
  address: null,
  officialUrl: null,
  status: 'open',
  description: null,
  provenance,
  note: null,
  ...overrides,
})

const area = (overrides: Partial<Area> = {}): Area => ({
  id: 'fixture',
  slug: 'fixture',
  name: 'Fixture',
  region: 'west-valley',
  clusterIds: [],
  compareWith: [],
  facts: { orientation: block(good), housing: null, access: null },
  editorial: { shortVersion: null, tuesday: null, tradeoffs: null, note: null },
  provenance: good,
  published: true,
  currentConditionsFlag: null,
  metaDescription: null,
  guide: null,
  ...overrides,
})

// ---------------------------------------------------------------- the gate

test('a verified, sourced record renders', () => {
  assert.equal(isRenderable(good), true)
})

test('no verification date means it never renders', () => {
  assert.equal(isRenderable({ ...good, lastVerified: null }), false)
})

test('a verification date with no source is not a verification', () => {
  assert.equal(isRenderable({ ...good, sources: [] }), false)
})

test('suppressed and held records never render', () => {
  assert.equal(isRenderable({ ...good, suppressed: true }), false)
  assert.equal(isRenderable({ ...good, hold: true, holdReason: 'pending' }), false)
})

test('an empty fact block renders nothing even when verified', () => {
  assert.equal(renderableFact({ body: [], provenance: good }), null)
  assert.equal(renderableFact(null), null)
})

// --------------------------------------------------------------- places

test('a closed place is not listed as somewhere to go', () => {
  const closed = place('closed', good, { status: 'permanently-closed' })
  assert.deepEqual(renderablePlaces([closed], 'fixture'), [])
})

test('a held place is not listed', () => {
  const held = place('held', { ...good, lastVerified: null, hold: true, holdReason: 'pending' })
  assert.deepEqual(renderablePlaces([held], 'fixture'), [])
})

test('places are matched by area membership', () => {
  const mine = place('mine', good)
  const theirs = place('theirs', good, { areaIds: ['elsewhere'] })
  assert.deepEqual(
    renderablePlaces([mine, theirs], 'fixture').map((p) => p.id),
    ['mine'],
  )
})

// ------------------------------------------------------------ publication

test('published:false means no URL', () => {
  assert.equal(isPublishable(area({ published: false })), false)
  assert.deepEqual(publishedAreas([area({ published: false })]), [])
})

test('published:true with no renderable fact is still not publishable', () => {
  const empty = area({ facts: { orientation: null, housing: null, access: null } })
  assert.equal(isPublishable(empty), false)
  assert.ok(publicationBlockers(empty).includes('no renderable orientation'))
})

// -------------------------------------------------------------- staleness

test('a record past its review date is surfaced, not removed', () => {
  const stale = stalenessReport([area()], [], '2027-01-01')
  assert.ok(stale.some((record) => record.id === 'fixture'))
  assert.equal(stale[0].reason, 'past-review')
})

test('held records cannot go stale — they are already not rendering', () => {
  const held = place('held', { ...good, hold: true, holdReason: 'pending' })
  assert.deepEqual(stalenessReport([], [held], '2030-01-01'), [])
})

test('nothing is stale before its review date', () => {
  assert.deepEqual(stalenessReport([area()], [], '2026-09-06'), [])
})

// ------------------------------------------------------------- invariants

test('duplicate slugs are caught', () => {
  const problems = areaInvariantViolations([area(), area({ id: 'other' })], [])
  assert.ok(problems.some((p) => p.includes('Duplicate area slug')))
})

test('a place pointing at an unknown area is caught', () => {
  const problems = areaInvariantViolations([area()], [place('orphan', good, { areaIds: ['nowhere'] })])
  assert.ok(problems.some((p) => p.includes('unknown area')))
})

test('a hold without a reason is caught', () => {
  const problems = areaInvariantViolations(
    [area()],
    [place('held', { ...good, lastVerified: null, hold: true })],
  )
  assert.ok(problems.some((p) => p.includes('on hold without a stated reason')))
})

// ----------------------------------------------------- the real content set

test('the real content set has no invariant violations', () => {
  assert.deepEqual(areaInvariantViolations([calabasas], places), [])
})

test('Calabasas is publishable and is the only published area', () => {
  assert.deepEqual(
    publishedAreas([calabasas]).map((a) => a.slug),
    ['calabasas'],
  )
})

test('every held Calabasas place stays out of the guide', () => {
  const rendered = renderablePlaces(places, 'calabasas').map((p) => p.id)
  const held = places.filter((p) => p.provenance.hold).map((p) => p.id)
  assert.ok(held.length > 0, 'fixture check: there should be held records')
  for (const id of held) assert.ok(!rendered.includes(id), `${id} must not render`)
})

test('no rendered Calabasas place carries a guessed URL', () => {
  for (const rendered of renderablePlaces(places, 'calabasas')) {
    if (rendered.officialUrl === null) continue
    const cited = rendered.provenance.sources.some((s) => s.url === rendered.officialUrl)
    assert.ok(cited, `${rendered.id}: officialUrl must be one of its cited sources`)
  }
})

// ------------------------------------------------- the itinerary gate

const stop = (id: string, over: Partial<import('./itinerary.ts').ItineraryStop> = {}) =>
  ({
    id,
    time: null,
    title: id,
    kind: 'anchor' as const,
    location: null,
    whySentHere: null,
    whatThisTeaches: null,
    whatToNotice: [],
    whatNotToConclude: null,
    howLong: null,
    drive: null,
    access: 'public' as const,
    accessNote: null,
    media: null,
    provenance: good,
    ...over,
  })

const guide = (over: Partial<import('./itinerary.ts').AreaGuide> = {}) => ({
  headline: 'How I would spend a day here',
  intro: { body: 'An intro.', written: null },
  pointOfTheDay: { body: 'The point.', written: null },
  heroMedia: null,
  stops: [stop('one'), stop('two')],
  normalLifeTest: null,
  beforeYouLeave: null,
  showingCtaAfterStopId: null,
  ...over,
})

test('a complete itinerary renders', () => {
  assert.equal(isGuideRenderable(guide()), true)
})

test('no itinerary renders nothing — the factual guide stands alone', () => {
  assert.equal(isGuideRenderable(null), false)
})

test('a half-written itinerary never leaks onto the site', () => {
  assert.equal(isGuideRenderable(guide({ stops: [] })), false, 'no stops')
  assert.equal(isGuideRenderable(guide({ stops: [stop('one')] })), false, 'one stop is not a day')
  assert.equal(isGuideRenderable(guide({ headline: '  ' })), false, 'no headline')
  assert.equal(isGuideRenderable(guide({ intro: { body: '', written: null } })), false, 'no intro')
  assert.equal(
    isGuideRenderable(guide({ pointOfTheDay: { body: '', written: null } })),
    false,
    'no point of the day',
  )
})

test('Calabasas has no itinerary yet and its factual guide is unaffected', () => {
  assert.equal(calabasas.guide, null, 'the real route is not written')
  assert.equal(isGuideRenderable(calabasas.guide), false)
  assert.equal(isPublishable(calabasas), true, 'the factual guide still publishes')
})

test('the layout fixture can never be published', () => {
  assert.equal(fixtureArea.published, false)
  assert.equal(isPublishable(fixtureArea), false)
  assert.deepEqual(
    publishedAreas([calabasas, fixtureArea]).map((a) => a.slug),
    ['calabasas'],
    'the fixture is absent from every published surface',
  )
})

test('an optional itinerary module missing is not a failure', () => {
  const bare = guide({ normalLifeTest: null, beforeYouLeave: null, heroMedia: null })
  assert.equal(isGuideRenderable(bare), true)
})
