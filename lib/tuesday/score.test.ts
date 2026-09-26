import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATTRIBUTES, SCALE_IDS } from './model.ts'
import { QUESTIONS } from './questions.ts'
import { byState, nextQuestion, score, type Answers } from './score.ts'

/**
 * These tests are the product spec. Each persona is a person Danielle
 * described, and the assertions are the outcomes she said they must get —
 * especially the ones a scoring model gets backwards.
 */

const DECORATOR: Answers = {
  tuesday: 'quiet', dealbreaker: 'dark', daily: ['dark', 'public'],
  inherit: 'renovation', whitehouse: 'mine', kitchen: 'never', location: 'property',
}

const TURNKEY_OVER_LOT: Answers = {
  tuesday: 'errands', dealbreaker: 'layout', daily: ['public', 'separation'],
  inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'property',
}

const OUTDOOR_NO_BURDEN: Answers = {
  tuesday: 'quiet', dealbreaker: 'outside', daily: ['outdoor', 'upkeep'],
  inherit: 'lot', whitehouse: 'bones', kitchen: 'depends', location: 'few',
}

const CHARACTER_AND_LAYERS: Answers = {
  tuesday: 'room', dealbreaker: 'dark', daily: ['dark', 'public'],
  inherit: 'lot', whitehouse: 'personality', kitchen: 'depends', location: 'property',
}

const TIGHT_MAP: Answers = {
  tuesday: 'close', dealbreaker: 'far', daily: ['public', 'parking'],
  inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'fixed',
}

const stateOfAttr = (answers: Answers, id: string) =>
  score(answers).attributes.find((entry) => entry.attribute.id === id)?.state

// ---------------------------------------------------------------- invariants

test('no option anywhere carries negative importance', () => {
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      for (const [attributeId, weight] of Object.entries(option.attributes ?? {})) {
        assert.ok(weight > 0, `${question.id}/${option.id} penalises ${attributeId}`)
      }
    }
  }
})

test('losing a tradeoff never reduces direct evidence', () => {
  // The lot loses in this answer. It must keep whatever importance it had.
  const withLoss = score({ inherit: 'renovation' })
  const lot = withLoss.attributes.find((entry) => entry.attribute.id === 'lot')
  assert.ok(lot)
  assert.equal(lot.evidence.direct, 0, 'no penalty was applied')
  assert.equal(lot.evidence.tradeoffLosses, 1, 'but the comparison was recorded')
})

test('every scale normalises inside 0..1 for every persona', () => {
  for (const answers of [DECORATOR, TURNKEY_OVER_LOT, OUTDOOR_NO_BURDEN, CHARACTER_AND_LAYERS, TIGHT_MAP]) {
    const { scales } = score(answers)
    for (const id of SCALE_IDS) assert.ok(scales[id] >= 0 && scales[id] <= 1, `${id} out of range`)
  }
})

// ------------------------------------------------------------------ unknowns

test('unasked is never reported as flexible', () => {
  const result = score({ tuesday: 'quiet' })
  const named = new Set(result.attributes.map((entry) => entry.attribute.id))
  for (const attribute of ATTRIBUTES) {
    if (named.has(attribute.id)) continue
    assert.ok(
      result.unknowns.some((unknown) => unknown.id === attribute.id),
      `${attribute.id} should be unknown, not absent`,
    )
  }
  assert.ok(result.unknowns.length > 0)
  for (const entry of byState(result).flexibilityToTest) {
    assert.ok(entry.evidence.mentions > 0 || entry.evidence.tradeoffLosses > 0)
  }
})

test('an empty test claims nothing at all', () => {
  const result = score({})
  assert.equal(result.attributes.length, 0)
  assert.equal(result.unknowns.length, ATTRIBUTES.length)
})

// ------------------------------------------------------------------ personas

test('TURNKEY OVER LOT: the lot is not restored to a priority just for being permanent', () => {
  // The correction. Changeability belongs to the property; importance belongs
  // to the buyer. This buyer knowingly chose the finished house.
  assert.equal(stateOfAttr(TURNKEY_OVER_LOT, 'lot'), 'flexibilityToTest')

  const result = score(TURNKEY_OVER_LOT)
  const lot = result.attributes.find((entry) => entry.attribute.id === 'lot')
  // But the permanence of the trade is understood and said out loud.
  assert.equal(lot?.tradedAwayPermanently, true)
  assert.equal(result.findings.needsDayOne, true)
})

test('OUTDOOR WITHOUT BURDEN: usable outdoor life without a property to run', () => {
  const result = score(OUTDOOR_NO_BURDEN)
  assert.equal(stateOfAttr(OUTDOOR_NO_BURDEN, 'outdoor'), 'protect')
  assert.equal(stateOfAttr(OUTDOOR_NO_BURDEN, 'upkeep'), 'protect')
  assert.equal(result.findings.outdoorWithoutBurden, true)
  assert.ok(result.scales.operationalBurdenTolerance <= 0.38)
})

test('HIGH CHARACTER + HIGH PERSONALIZATION: the model never forces a choice', () => {
  const result = score({ ...CHARACTER_AND_LAYERS, clarify: 'cosmetic' })
  assert.ok(result.scales.architecturalRequirement >= 0.62, 'wants real bones')
  assert.ok(result.scales.personalizationAppetite >= 0.62, 'and wants to layer')
  assert.equal(result.findings.willLayer, true)
  // Both are true at once, and neither suppresses the other: the house has to
  // bring character, AND they will add their own layers on top of it.
  assert.equal(stateOfAttr(CHARACTER_AND_LAYERS, 'character'), 'protect')
})

test('DECORATOR: papers a house, will not gut a kitchen', () => {
  const result = score(DECORATOR)
  assert.ok(result.scales.personalizationAppetite >= 0.62)
  assert.ok(result.scales.renovationTolerance <= 0.38)
  // "I will never redo it" is a real criterion about a real project.
  assert.equal(stateOfAttr(DECORATOR, 'kitchen'), 'protect')
})

test('the map records constraint strength and nothing about the reason', () => {
  assert.equal(score(TIGHT_MAP).findings.map, 'fixed')
  assert.equal(score(OUTDOOR_NO_BURDEN).findings.map, 'fewAreas')
  assert.equal(score(DECORATOR).findings.map, 'propertyLed')
})

// ----------------------------------------------------------------- conflicts

test('a genuine contradiction asks exactly one clarification, then stops', () => {
  const conflicted: Answers = {
    tuesday: 'errands', dealbreaker: 'layout', daily: ['public'],
    inherit: 'lot', whitehouse: 'finished', kitchen: 'fixable', location: 'property',
  }
  const before = score(conflicted)
  assert.ok(before.findings.tensions.includes('readinessVersusRenovation'))
  assert.equal(before.needsClarification, true)
  assert.equal(nextQuestion(conflicted), 'clarify')

  const after = score({ ...conflicted, clarify: 'cosmetic' })
  assert.equal(after.needsClarification, false, 'one clarification is enough')
  assert.equal(nextQuestion({ ...conflicted, clarify: 'cosmetic' }), null)
})

test('declining a forced tradeoff is recorded as narrow criteria, not indecision', () => {
  const result = score({ inherit: 'both' })
  assert.ok(result.findings.tensions.includes('narrowCriteria'))
})

test('the clarification question is never shown without a conflict', () => {
  assert.equal(score(DECORATOR).needsClarification, false)
  assert.equal(nextQuestion(DECORATOR), null)
})

// -------------------------------------------------------------------- basics

test('multi-select respects its limit', () => {
  const result = score({ daily: ['dark', 'outdoor', 'public', 'separation'] })
  assert.equal(result.answered, 2, 'choose 2 means 2')
})

test('partial and malformed answers score without throwing', () => {
  assert.equal(score({}).answered, 0)
  assert.equal(score({ tuesday: 'not-an-option' }).answered, 0)
  assert.equal(score({ 'not-a-question': 'quiet' }).answered, 0)
  assert.doesNotThrow(() => score({ daily: [] }))
})

test('every option in the question set is reachable and scores', () => {
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      assert.equal(score({ [question.id]: option.id }).answered, 1, `${question.id}/${option.id}`)
    }
  }
})

test('the 7:14 opener is context, not a verdict', () => {
  // On its own it must not be able to protect anything.
  for (const option of QUESTIONS[0].options) {
    for (const entry of score({ tuesday: option.id }).attributes) {
      assert.notEqual(entry.state, 'protect', `${option.id} should not protect on its own`)
    }
  }
})

test('protecting a real-project attribute means it has to work on arrival', async () => {
  const { dayOneItems, personalLayers } = await import('./interpret.ts')
  const result = score(DECORATOR)
  const dayOne = dayOneItems(result).map((entry) => entry.attribute.id)

  // The decorator will paper a house and will never gut a kitchen. Both facts
  // have to survive into the same result without contradicting each other.
  assert.ok(dayOne.includes('kitchen'), 'the kitchen must already work')
  assert.ok(personalLayers(result).length > 0, 'and the layers are still theirs')

  // "Make it yours" is cosmetic layers only — never move-in condition, which
  // is exactly what this buyer was NOT flexible about at the project level.
  for (const layer of personalLayers(result)) {
    assert.ok(!/condition|kitchen/i.test(layer), `${layer} does not belong in make it yours`)
  }
})

test('a buyer open to real work is not handed a day-one requirements list', async () => {
  const { dayOneItems } = await import('./interpret.ts')
  const openToProject: Answers = {
    tuesday: 'room', dealbreaker: 'outgrow', daily: ['separation', 'stairs'],
    inherit: 'lot', whitehouse: 'personality', kitchen: 'fixable', location: 'strong',
  }
  const result = score(openToProject)
  assert.ok(result.scales.renovationTolerance >= 0.62)
  // They protected square footage and separation — both real projects to
  // change. For this buyer that means "space matters", not "it must already
  // be big". Listing them as day-one would contradict their own result.
  assert.equal(dayOneItems(result).length, 0)
  assert.ok(result.attributes.some((entry) => entry.attribute.id === 'size' && entry.state === 'protect'))
})
