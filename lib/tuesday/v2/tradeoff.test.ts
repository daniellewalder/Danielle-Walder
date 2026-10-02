import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATTRIBUTES, PROTECT_AT } from './model.ts'
import {
  ALLOWED,
  CLUSTERS,
  EXCLUSIONS,
  FALLBACKS,
  MAP,
  candidatesFrom,
  familyOf,
  isAllowedPair,
  mapIsCandidate,
  selectPair,
  type Candidate,
  type Preconditions,
} from './tradeoff.ts'
import { score } from './score.ts'
import type { V2Answers } from './answers.ts'

const CONCEPTS = Object.keys(ALLOWED)
const base = (over: Partial<Preconditions> = {}): Preconditions => ({
  map: null,
  projectIsMajor: false,
  wantsNeutral: false,
  qualified: new Set<string>(),
  ...over,
})
const strong = (concept: string, over: Partial<Candidate> = {}): Candidate => ({
  concept,
  direct: PROTECT_AT,
  sources: 1,
  statedRank: null,
  ...over,
})

// ---------------------------------------------------------------------------
// The matrix itself
// ---------------------------------------------------------------------------

test('every pair is symmetric', () => {
  const asymmetric: string[] = []
  for (const [a, partners] of Object.entries(ALLOWED)) {
    for (const b of partners) {
      if (!ALLOWED[b]) asymmetric.push(`${a} lists ${b}, which has no row`)
      else if (!ALLOWED[b].includes(a)) asymmetric.push(`${a} lists ${b}, but ${b} does not list ${a}`)
    }
  }
  assert.deepEqual(asymmetric, [])
})

test('no duplicate pair definitions', () => {
  for (const [a, partners] of Object.entries(ALLOWED)) {
    assert.equal(new Set(partners).size, partners.length, `${a} lists something twice`)
  }
})

test('nothing pairs with itself', () => {
  for (const [a, partners] of Object.entries(ALLOWED)) {
    assert.ok(!partners.includes(a), `${a} pairs with itself`)
  }
})

test('no pair contains a concept that no longer exists', () => {
  const known = new Set([...ATTRIBUTES.map((attribute) => attribute.id), MAP])
  for (const [a, partners] of Object.entries(ALLOWED)) {
    assert.ok(known.has(a), `${a} is in the matrix but not in the taxonomy`)
    for (const b of partners) assert.ok(known.has(b), `${a} pairs with unknown concept ${b}`)
  }
})

test('every attribute plus the map has a row', () => {
  for (const attribute of ATTRIBUTES) {
    assert.ok(ALLOWED[attribute.id], `${attribute.id} has no row in the matrix`)
  }
  assert.ok(ALLOWED[MAP], 'the map has no row')
  assert.equal(CONCEPTS.length, ATTRIBUTES.length + 1, 'the nineteenth concept is the map, nothing else')
})

test('utility never enters the tradeoff', () => {
  assert.deepEqual(ALLOWED.utility, [])
  for (const [a, partners] of Object.entries(ALLOWED)) {
    assert.ok(!partners.includes('utility'), `${a} offers to weigh utility`)
  }
})

test('the documented exclusions really are excluded', () => {
  for (const { pair, reason } of EXCLUSIONS) {
    assert.equal(isAllowedPair(pair[0], pair[1]), false, `${pair.join(' vs ')} is allowed despite: ${reason}`)
    assert.equal(isAllowedPair(pair[1], pair[0]), false)
  }
})

test('the same-cluster pairs Danielle named are allowed', () => {
  for (const [a, b] of [
    ['size', 'layout'],
    ['size', 'separation'],
    ['size', 'publicRooms'],
    ['separation', 'publicRooms'],
    ['light', 'privacy'],
    ['outdoor', 'privacy'],
  ] as const) {
    assert.ok(isAllowedPair(a, b), `${a} vs ${b} should be allowed`)
  }
})

test('clusters are organizational only and cover every concept once', () => {
  const seen = new Map<string, string>()
  for (const [name, members] of Object.entries(CLUSTERS)) {
    for (const member of members) {
      assert.ok(!seen.has(member), `${member} is in both ${seen.get(member)} and ${name}`)
      seen.set(member, name)
    }
  }
  for (const concept of CONCEPTS) assert.ok(seen.has(concept), `${concept} is in no cluster`)
})

test('family classification is deterministic and total', () => {
  for (const [a, partners] of Object.entries(ALLOWED)) {
    for (const b of partners) {
      const family = familyOf(a, b)
      assert.ok(family !== 'unknown', `${a} vs ${b} has no family`)
      assert.equal(family, familyOf(b, a), `${a} vs ${b} classifies differently by order`)
    }
  }
})

// ---------------------------------------------------------------------------
// Selection guards
// ---------------------------------------------------------------------------

test('an unset attribute can never be selected', () => {
  const chosen = selectPair([strong('light'), { ...strong('privacy'), direct: 0 }], base())
  assert.ok(!chosen.pair.includes('privacy'), 'an attribute with no evidence was offered')
  assert.ok(chosen.family.startsWith('fallback'), 'only one eligible side should force the fallback')
})

test('a weak context signal is never pitted against a dealbreaker', () => {
  const chosen = selectPair([strong('light'), { ...strong('privacy'), direct: 1.5 }], base())
  assert.ok(!chosen.pair.includes('privacy'))
})

test('a fixed map is never offered as movable', () => {
  assert.equal(mapIsCandidate('fixed'), false)
  const candidates = candidatesFrom(new Map(), 'fixed')
  assert.ok(!candidates.some((candidate) => candidate.concept === MAP))
  const chosen = selectPair([strong('light'), strong(MAP)], base({ map: 'fixed' }))
  assert.ok(!chosen.pair.includes(MAP), 'the map was offered to a buyer who said it does not move')
})

test('the map participates only in the postures that allow it', () => {
  assert.equal(mapIsCandidate('strongPreference'), true)
  assert.equal(mapIsCandidate('fewAreas'), true)
  assert.equal(mapIsCandidate('propertyLed'), false, 'property-led already answered the question')
  assert.equal(mapIsCandidate(null), false)
})

test('the map is selectable when the buyer said it moves', () => {
  const chosen = selectPair([strong('light'), strong(MAP)], base({ map: 'strongPreference' }))
  assert.deepEqual([...chosen.pair].sort(), [MAP, 'light'].sort())
  assert.equal(chosen.family, 'propertyVsPlace')
})

test('a buyer open to major work is not asked whether condition filters', () => {
  const pair = selectPair([strong('light'), strong('condition')], base({ projectIsMajor: true }))
  assert.ok(!(pair.pair.includes('light') && pair.pair.includes('condition')))
})

test('a buyer who wants it plain is not asked about character', () => {
  const pair = selectPair(
    [strong('architecturalCharacter'), strong('size')],
    base({ wantsNeutral: true }),
  )
  assert.ok(!pair.pair.includes('architecturalCharacter'))
})

test('qualifier-specific concepts need the qualifier before they can be weighed', () => {
  const without = selectPair([strong('upkeep'), strong('size')], base())
  assert.ok(!without.pair.includes('upkeep'), 'upkeep was weighed with no qualifier')

  const with_ = selectPair([strong('upkeep'), strong('size')], base({ qualified: new Set(['upkeep']) }))
  assert.deepEqual([...with_.pair].sort(), ['size', 'upkeep'])

  const parkingBare = selectPair([strong('parking'), strong('size')], base())
  assert.ok(!parkingBare.pair.includes('parking'))
})

test('joint strength pairs two strong things rather than a strong and a medium', () => {
  const chosen = selectPair(
    [strong('light', { direct: 6 }), strong('privacy', { direct: 6 }), strong('size', { direct: 3 })],
    base(),
  )
  assert.deepEqual([...chosen.pair].sort(), ['light', 'privacy'])
})

test('selection is stable: the same evidence always produces the same question', () => {
  const candidates = [strong('light'), strong('privacy'), strong('outdoor')]
  const first = selectPair(candidates, base())
  const shuffled = [candidates[2], candidates[0], candidates[1]]
  assert.deepEqual(selectPair(shuffled, base()), first)
})

test('the fallback follows the map posture so the fixed rule always holds', () => {
  assert.deepEqual(selectPair([], base({ map: 'fixed' })), FALLBACKS.fixed)
  assert.deepEqual(selectPair([], base({ map: 'propertyLed' })), FALLBACKS.fixed)
  assert.deepEqual(selectPair([], base({ map: 'strongPreference' })), FALLBACKS.movable)
  assert.deepEqual(selectPair([], base({ map: 'fewAreas' })), FALLBACKS.movable)
  assert.ok(!FALLBACKS.fixed.pair.includes(MAP), 'the fixed-map fallback offers the map')
})

test('candidatesFrom only offers the map when the posture allows', () => {
  const evidence = score({ version: 2, dealbreaker: [{ option: 'dark' }] } as V2Answers)
  const map = new Map(evidence.attributes.map((entry) => [entry.attribute.id, entry.evidence]))
  assert.ok(candidatesFrom(map, 'fewAreas').some((candidate) => candidate.concept === MAP))
  assert.ok(!candidatesFrom(map, 'fixed').some((candidate) => candidate.concept === MAP))
})
