import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATTRIBUTES, BUNDLED, PROTECT_AT, QUALIFIERS, SCALE_IDS, qualifiersFor } from './model.ts'
import { QUESTIONS } from './questions.ts'

/** Every attribute an option can produce direct evidence for, by question. */
function reachability() {
  const sources = new Map<string, Set<string>>()
  const best = new Map<string, number>()
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      for (const [id, weight] of Object.entries(option.attributes ?? {})) {
        if (!sources.has(id)) sources.set(id, new Set())
        sources.get(id)!.add(question.id)
        best.set(id, Math.max(best.get(id) ?? 0, weight * question.weight))
      }
    }
  }
  return { sources, best }
}

test('every modeled attribute has at least one reachable source', () => {
  const { sources } = reachability()
  const dead = ATTRIBUTES.filter((attribute) => !sources.has(attribute.id))
  assert.deepEqual(
    dead.map((attribute) => attribute.id),
    [],
    'a dead attribute pads every result with something that can never be established',
  )
})

test('every attribute can actually reach the protect threshold', () => {
  const { best } = reachability()
  for (const attribute of ATTRIBUTES) {
    assert.ok(
      (best.get(attribute.id) ?? 0) >= PROTECT_AT,
      `${attribute.id} maxes at ${best.get(attribute.id)} against a threshold of ${PROTECT_AT}, so it can never be a priority`,
    )
  }
})

test('the taxonomy is eighteen attributes, deliberately', () => {
  assert.equal(ATTRIBUTES.length, 18)
  assert.equal(new Set(ATTRIBUTES.map((a) => a.id)).size, 18, 'duplicate attribute id')
})

test('the concepts V1 could never establish are gone', () => {
  const ids = new Set(ATTRIBUTES.map((attribute) => attribute.id))
  for (const removed of ['view', 'ceilings', 'finishes', 'expansion', 'lot', 'character']) {
    assert.ok(!ids.has(removed), `${removed} should not be in the V2 taxonomy`)
  }
})

test('expansion is not an attribute, and the major-project answer establishes none', () => {
  assert.ok(!ATTRIBUTES.some((attribute) => attribute.id === 'expansion'))
  const further = QUESTIONS.find((q) => q.id === 'project')?.options.find((o) => o.id === 'further')
  assert.ok(further)
  assert.equal(
    further.attributes,
    undefined,
    'willingness to do structural work is not a desire for expansion potential',
  )
  assert.ok(further.stances?.includes('structuralWorkOkay'))
})

test('architectural character is an attribute and is bought, not created', () => {
  const character = ATTRIBUTES.find((attribute) => attribute.id === 'architecturalCharacter')
  assert.ok(character)
  assert.equal(character.changeability, 'protectAtPurchase')
})

test('personalization is a scale and never an attribute', () => {
  assert.ok(SCALE_IDS.includes('personalizationAppetite'))
  assert.ok(!ATTRIBUTES.some((attribute) => attribute.id.toLowerCase().includes('personal')))
})

test('the one-sided scales are gone', () => {
  assert.deepEqual([...SCALE_IDS].sort(), [
    'dayOneReadiness',
    'personalizationAppetite',
    'renovationTolerance',
  ])
})

test('every scale can move in both directions', () => {
  for (const scale of SCALE_IDS) {
    const deltas = QUESTIONS.flatMap((q) => q.options.map((o) => o.scales?.[scale] ?? 0))
    assert.ok(deltas.some((d) => d > 0), `${scale} can never go up`)
    assert.ok(deltas.some((d) => d < 0), `${scale} can never go down`)
  }
})

test('no option carries negative attribute importance', () => {
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      for (const weights of [option.attributes, option.attributesAtRankTwo]) {
        for (const [id, weight] of Object.entries(weights ?? {})) {
          assert.ok(weight > 0, `${question.id}.${option.id} gives ${id} a weight of ${weight}`)
        }
      }
    }
  }
})

test('a position against something is a stance, not a negative score', () => {
  const plain = QUESTIONS.find((q) => q.id === 'architecture')?.options.find((o) => o.id === 'plain')
  assert.ok(plain)
  assert.equal(plain.attributes, undefined)
  assert.deepEqual(plain.stances, ['wantsNeutral'])
})

test('every bundled attribute has qualifier options, and no unbundled one does', () => {
  for (const attribute of ATTRIBUTES) {
    const options = qualifiersFor(attribute.id)
    if (attribute.bundled) {
      assert.ok(options.length >= 3, `${attribute.id} is bundled but has ${options.length} qualifiers`)
    } else {
      assert.equal(options.length, 0, `${attribute.id} is not bundled but has qualifiers`)
    }
  }
  assert.deepEqual([...BUNDLED].sort(), ['parking', 'site', 'upkeep', 'utility'])
})

test('every qualifying option points at a real bundled attribute', () => {
  const bundled = new Set(BUNDLED)
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      if (!option.qualifies) continue
      assert.ok(bundled.has(option.qualifies), `${option.qualifies} is not bundled`)
      assert.ok(QUALIFIERS[option.qualifies], `${option.qualifies} has no qualifier list`)
    }
  }
})

test('the main-rooms option takes no qualifier', () => {
  const daily = QUESTIONS.find((question) => question.id === 'daily')
  const publicRooms = daily?.options.find((option) => option.id === 'public')
  assert.equal(publicRooms?.qualifies, undefined, 'cooking, eating and hosting are one concept')
})

test('the opener cannot establish a priority on its own', () => {
  const tuesday = QUESTIONS.find((question) => question.id === 'tuesday')!
  for (const option of tuesday.options) {
    for (const weight of Object.values(option.attributes ?? {})) {
      assert.ok(weight * tuesday.weight < PROTECT_AT, 'the context question reached protect')
    }
  }
})

test('both dealbreaker picks carry full strength', () => {
  const dealbreaker = QUESTIONS.find((question) => question.id === 'dealbreaker')!
  assert.equal(dealbreaker.choose, 2)
  assert.equal(dealbreaker.ordered, true)
  for (const option of dealbreaker.options) {
    assert.equal(
      option.attributesAtRankTwo,
      undefined,
      'a second dealbreaker is still a dealbreaker and must not be down-weighted',
    )
  }
})

test('the second daily friction is genuinely weaker', () => {
  const daily = QUESTIONS.find((question) => question.id === 'daily')!
  for (const option of daily.options) {
    if (!option.attributes) continue
    assert.ok(option.attributesAtRankTwo, `${option.id} has no rank-two weight`)
    for (const [id, weight] of Object.entries(option.attributes)) {
      assert.ok(option.attributesAtRankTwo![id] < weight, `${id} is not weaker at rank two`)
    }
  }
})
