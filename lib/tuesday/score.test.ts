import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DIMENSION_IDS } from './model.ts'
import { QUESTIONS } from './questions.ts'
import { byBucket, score, type Answers } from './score.ts'

/**
 * These tests are the product spec. Each persona is one of the people Danielle
 * described, and the assertions are the outcomes she said they must get —
 * particularly the ones a naive model gets backwards.
 */

/** The person who will paper and relight a house but never touch a kitchen. */
const DECORATOR: Answers = {
  tuesday: 'quiet',
  dealbreaker: 'dark',
  inherit: 'depends',
  whitehouse: 'mine',
  kitchen: 'never',
  location: 'life',
}

/** The person who wants it finished. A legitimate, expensive requirement. */
const TURNKEY: Answers = {
  tuesday: 'errands',
  dealbreaker: 'layout',
  inherit: 'renovation',
  whitehouse: 'finished',
  kitchen: 'done',
  location: 'life',
}

/** The person who buys the lot and lives with the house for now. */
const LOT_BUYER: Answers = {
  tuesday: 'room',
  dealbreaker: 'outside',
  inherit: 'lot',
  whitehouse: 'bones',
  kitchen: 'fixable',
  location: 'life',
}

/** The person whose life genuinely pins the map. */
const TIGHT_MAP: Answers = {
  tuesday: 'close',
  dealbreaker: 'far',
  inherit: 'renovation',
  whitehouse: 'finished',
  kitchen: 'done',
  location: 'neighborhood',
}

const bucketOf = (answers: Answers, attributeId: string) =>
  score(answers).attributes.find((entry) => entry.attribute.id === attributeId)?.bucket

test('every dimension normalises inside 0..1 for every persona', () => {
  for (const answers of [DECORATOR, TURNKEY, LOT_BUYER, TIGHT_MAP]) {
    const { dimensions } = score(answers)
    for (const id of DIMENSION_IDS) {
      assert.ok(dimensions[id] >= 0 && dimensions[id] <= 1, `${id} out of range`)
    }
  }
})

test('the decorator keeps a high personalization appetite and a low renovation tolerance', () => {
  const { dimensions, findings } = score(DECORATOR)
  assert.ok(dimensions.personalizationAppetite > 0.6, 'should want to add character')
  assert.ok(dimensions.renovationTolerance < 0.4, 'should not want structural work')
  // The combination Danielle named explicitly. It must not collapse into one
  // "likes renovation" score in either direction.
  assert.equal(findings.project, 'decorateNotRenovate')
})

test('"I will never redo it" puts the kitchen in PROTECT, not in room', () => {
  // The whole point. A buyer who knows they will not do the work has a real
  // search criterion, not a flexibility.
  assert.equal(bucketOf(DECORATOR, 'kitchen'), 'protect')
  assert.equal(bucketOf(TURNKEY, 'kitchen'), 'protect')
})

test('the decorator still gets finishes as an opportunity, not a demand', () => {
  assert.equal(bucketOf(DECORATOR, 'character'), 'makeItYours')
})

test('the turnkey buyer is never told to take on a project', () => {
  const { findings } = score(TURNKEY)
  assert.equal(findings.project, 'noProject')
  assert.equal(bucketOf(TURNKEY, 'condition'), 'protect')
  const grouped = byBucket(score(TURNKEY))
  assert.equal(grouped.makeItYours.length, 0, 'nothing should be framed as a project')
})

test('the lot buyer protects the lot and is genuinely flexible on the kitchen', () => {
  assert.equal(bucketOf(LOT_BUYER, 'lot'), 'protect')
  assert.equal(bucketOf(LOT_BUYER, 'kitchen'), 'room')
  assert.ok(score(LOT_BUYER).dimensions.renovationTolerance > 0.6)
})

test('a real geographic constraint is reported as tight, and a loose one is not', () => {
  assert.equal(score(TIGHT_MAP).findings.map, 'tight')
  assert.equal(score(DECORATOR).findings.map, 'open')
})

test('the result only speaks about attributes the buyer actually signalled', () => {
  const { attributes } = score({ location: 'life' })
  assert.equal(attributes.length, 0, 'one location answer implies nothing about the house')
})

test('partial and malformed answers score without throwing', () => {
  assert.equal(score({}).answered, 0)
  assert.equal(score({ tuesday: 'quiet' }).answered, 1)
  assert.equal(score({ tuesday: 'not-an-option' }).answered, 0)
  assert.equal(score({ 'not-a-question': 'quiet' }).answered, 0)
})

test('every option in the question set is reachable and scores', () => {
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      const result = score({ [question.id]: option.id })
      assert.equal(result.answered, 1, `${question.id}/${option.id} did not register`)
    }
  }
})

test('no attribute is referenced by an option unless it exists in the registry', () => {
  const ids = new Set(score({}).attributes.map((entry) => entry.attribute.id))
  assert.equal(ids.size, 0)
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      for (const attributeId of Object.keys(option.attributes ?? {})) {
        const result = score({ [question.id]: option.id })
        assert.ok(
          result.attributes.some((entry) => entry.attribute.id === attributeId),
          `${question.id}/${option.id} references unknown attribute ${attributeId}`,
        )
      }
    }
  }
})

test('a hard-to-change attribute the buyer traded away is never called "room"', () => {
  // The turnkey buyer chose the beautiful renovation on the compromised lot,
  // which scores the lot NEGATIVELY. "You have room here" would be bad advice:
  // the lot is the one thing money cannot fix later.
  assert.equal(bucketOf(TURNKEY, 'lot'), 'getPicky')

  const grouped = byBucket(score(TURNKEY))
  for (const entry of grouped.room) {
    assert.notEqual(
      entry.attribute.changeability,
      'hard',
      `${entry.attribute.id} is hard to change and must not be in room`,
    )
  }
})

test('nothing hard to change lands in room for any persona', () => {
  for (const answers of [DECORATOR, TURNKEY, LOT_BUYER, TIGHT_MAP]) {
    for (const entry of byBucket(score(answers)).room) {
      assert.notEqual(entry.attribute.changeability, 'hard')
    }
  }
})
