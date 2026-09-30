import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from './fixtures.ts'
import { score } from './score.ts'
import { RULE_IDS, strategyFor, type AgentAction, type Strategy } from './strategy.ts'

const all = Object.entries(FIXTURES).map(([name, { answers }]) => ({
  name,
  strategy: strategyFor(score(answers)),
}))
const one = (name: keyof typeof FIXTURES) => strategyFor(score(FIXTURES[name].answers))
const ids = (actions: readonly AgentAction[]) => actions.map((action) => action.id)
const derivedActions = (s: Strategy): AgentAction[] => [
  ...s.derived.filterHard,
  ...s.derived.flexFirst,
  ...s.derived.doNotFlex,
  ...s.derived.secondLook,
  ...s.derived.showingTests,
  ...s.derived.doNotSubstitute,
]

// ---------------------------------------------------------------------------
// The three layers stay apart
// ---------------------------------------------------------------------------

test('layer C is empty, and nothing asserts a market fact', () => {
  const FORBIDDEN = /usually|typically|tend to|most (houses|homes|listings|buyers)|rare|common|market|priced|value/i
  for (const { name, strategy } of all) {
    assert.deepEqual(strategy.market, [], `${name} put something in the market layer`)
    for (const action of [...derivedActions(strategy), ...strategy.practicalProgram]) {
      for (const fact of action.because) {
        assert.ok(!FORBIDDEN.test(fact), `${name}: ${action.id} asserts a market fact: "${fact}"`)
      }
    }
  }
})

test('every derived action carries a full evidence trace', () => {
  for (const { name, strategy } of all) {
    for (const action of derivedActions(strategy)) {
      assert.ok(action.because.length > 0, `${name}: ${action.id} has no because`)
      assert.ok(action.sources.length > 0, `${name}: ${action.id} has no sources`)
      assert.ok(action.rules.length > 0, `${name}: ${action.id} names no rule`)
    }
  }
})

/*
 * The no-shit-sherlock line. A derived action must combine signals or draw a
 * consequence. Anything resting on one fact has to be on this list and be a
 * genuine strategy statement rather than the answer read back.
 */
const SINGLE_FACT_ALLOWED = new Set([
  'doNotFlex.geography', // "a fixed map is not the lever" is a strategy call
  'flex.geography', // choosing to spend the map is a decision, not a restatement
])

test('a derived action combines signals or is an approved single-fact strategy', () => {
  for (const { name, strategy } of all) {
    for (const action of derivedActions(strategy)) {
      if (action.because.length >= 2) continue
      assert.ok(
        SINGLE_FACT_ALLOWED.has(action.id),
        `${name}: ${action.id} rests on one fact and is not an approved strategy action`,
      )
    }
  }
})

test('the practical program is factual and never appears in derived strategy', () => {
  for (const { name, strategy } of all) {
    const derivedIds = new Set(ids(derivedActions(strategy)))
    for (const entry of strategy.practicalProgram) {
      assert.equal(entry.kind, 'practicalProgram')
      assert.ok(!derivedIds.has(entry.id), `${name}: ${entry.id} is in both layers`)
    }
  }
})

// ---------------------------------------------------------------------------
// Deduplication and internal consistency
// ---------------------------------------------------------------------------

test('no duplicate action ids within a slot', () => {
  for (const { name, strategy } of all) {
    for (const slot of ['filterHard', 'flexFirst', 'doNotFlex', 'secondLook', 'showingTests', 'doNotSubstitute'] as const) {
      const list = ids(strategy.derived[slot])
      assert.equal(new Set(list).size, list.length, `${name}: ${slot} repeats an action`)
    }
  }
})

test('no two actions of the same kind act on the same subject', () => {
  // Two ids for one instruction is the duplication this layer exists to
  // remove, and it survives id-based merging, so it is checked separately.
  for (const { name, strategy } of all) {
    for (const slot of ['filterHard', 'flexFirst', 'doNotFlex', 'secondLook', 'showingTests', 'doNotSubstitute'] as const) {
      const subjects = strategy.derived[slot].map((action) => `${action.subject}/${action.qualifier ?? ''}`)
      assert.equal(
        new Set(subjects).size,
        subjects.length,
        `${name}: ${slot} instructs twice on the same subject: ${subjects.join(', ')}`,
      )
    }
  }
})

test('a hard filter absorbs a do-not-flex on the same subject', () => {
  for (const { name, strategy } of all) {
    const filtered = new Set(strategy.derived.filterHard.map((action) => action.subject))
    for (const action of strategy.derived.doNotFlex) {
      assert.ok(!filtered.has(action.subject), `${name}: ${action.subject} is both filtered and do-not-flex`)
    }
  }
})

test('nothing is told to flex and not flex at the same time', () => {
  for (const { name, strategy } of all) {
    const flexing = new Set(strategy.derived.flexFirst.map((action) => action.subject))
    for (const action of strategy.derived.doNotFlex) {
      assert.ok(!flexing.has(action.subject), `${name}: ${action.subject} is both a lever and protected from being one`)
    }
    for (const action of strategy.derived.filterHard) {
      assert.ok(!flexing.has(action.subject), `${name}: ${action.subject} is both filtered and a lever`)
    }
  }
})

test('merging keeps both evidence trails', () => {
  // The spatial rules and the map rules both reach doNotFlex on a protected
  // spatial attribute; the surviving action must name both rules.
  const merged = one('turnkey')
  const layout = [...merged.derived.filterHard, ...merged.derived.doNotFlex].find(
    (action) => action.subject === 'layout',
  )
  assert.ok(layout)
  assert.ok(layout.sources.length >= 2, 'the merged action lost a source')
})

test('every rule is reachable from at least one fixture', () => {
  const fired = new Set(all.flatMap(({ strategy }) => strategy.firedRules))
  const dead = RULE_IDS.filter((id) => !fired.has(id))
  assert.deepEqual(dead, [], 'a rule that no fixture reaches is dead logic')
})

// ---------------------------------------------------------------------------
// The levers obey the evidence
// ---------------------------------------------------------------------------

test('a fixed map is never a lever', () => {
  for (const { name, strategy } of all) {
    if (strategy.buyerEvidence.map !== 'fixed') continue
    assert.ok(
      !strategy.derived.flexFirst.some((action) => action.subject === 'geography'),
      `${name}: a fixed map was offered as the lever`,
    )
    assert.ok(strategy.derived.doNotFlex.some((action) => action.subject === 'geography'))
  }
})

test('low renovation tolerance can never make condition the lever', () => {
  for (const { name, strategy } of all) {
    if (strategy.buyerEvidence.bands.renovation !== 'no') continue
    assert.ok(
      !strategy.derived.flexFirst.some((action) => action.subject === 'condition'),
      `${name}: condition was made the lever for a buyer who will not renovate`,
    )
  }
})

test('an unresolved project appetite vetoes condition as the lever', () => {
  const unresolved = one('projectUnresolved')
  assert.equal(unresolved.derived.unresolvedLever?.id, 'renovationAppetite')
  assert.ok(!unresolved.derived.flexFirst.some((action) => action.subject === 'condition'))
})

test('a lever is never invented just because the search needs one', () => {
  const stuck = one('turnkey') // fixed map, will not renovate
  for (const action of stuck.derived.flexFirst) {
    assert.ok(
      action.because.length >= 2,
      'a lever was produced without the combination that justifies it',
    )
  }
})

// ---------------------------------------------------------------------------
// Qualifier honesty
// ---------------------------------------------------------------------------

test('a qualifier-specific action never names a qualifier the buyer did not pick', () => {
  for (const { name, strategy } of all) {
    const chosen = new Set(
      [...derivedActions(strategy), ...strategy.practicalProgram]
        .map((action) => action.qualifier)
        .filter(Boolean),
    )
    const declared = new Set(
      strategy.buyerEvidence.protect.map((entry) => entry.qualifier).filter(Boolean),
    )
    for (const qualifier of chosen) {
      assert.ok(declared.has(qualifier as string), `${name}: invented the qualifier ${qualifier}`)
    }
  }
})

test('a pool is named only when the buyer said pool', () => {
  const pool = one('t3_outdoorPoolConcern')
  const planting = one('t4_outdoorPlantingConcern')
  const text = (s: Strategy) =>
    JSON.stringify([derivedActions(s), s.practicalProgram]).toLowerCase()

  assert.ok(text(pool).includes('pool'))
  assert.ok(!text(planting).includes('pool'), 'a planting answer produced a statement about pools')
  assert.ok(text(planting).includes('planting'))
})

// ---------------------------------------------------------------------------
// The targeted cases
// ---------------------------------------------------------------------------

test('t1 strong map, low renovation, cosmetic flexibility', () => {
  const s = one('t1_strongMapLowRenoCosmetic')
  assert.ok(s.derived.flexFirst.some((a) => a.subject === 'geography'))
  assert.ok(s.derived.doNotFlex.some((a) => a.subject === 'condition'))
  assert.ok(s.derived.secondLook.some((a) => a.id === 'secondLook.cosmeticallyPlain'))
})

test('t2 fixed map, high renovation: condition becomes the lever', () => {
  const s = one('t2_fixedMapHighReno')
  assert.ok(s.derived.flexFirst.some((a) => a.subject === 'condition'))
  assert.ok(s.derived.doNotFlex.some((a) => a.subject === 'geography'))
})

test('t5 and t6 carry their qualifiers into the practical program', () => {
  const ev = one('t5_evQualifier')
  assert.ok(ev.practicalProgram.some((a) => a.subject === 'parking' && a.qualifier === 'charging'))
  const pantry = one('t6_pantryQualifier')
  assert.ok(pantry.practicalProgram.some((a) => a.subject === 'utility' && a.qualifier === 'pantry'))
})

test('t7 character plus personalization filters on bones and rehabilitates plainness', () => {
  const s = one('t7_characterAndPersonalization')
  assert.ok(s.derived.filterHard.some((a) => a.id === 'reject.lacksArchitecturalCharacter'))
  assert.ok(s.derived.doNotSubstitute.some((a) => a.id === 'noSub.stagingForArchitecture'))
  assert.ok(s.derived.secondLook.some((a) => a.id === 'secondLook.architecturalButUnstyled'))
})

test('t8 size plus structural work raises the right unresolved lever', () => {
  const s = one('t8_sizeAndStructural')
  assert.equal(s.derived.unresolvedLever?.id, 'mustSpaceExistAlready')
  assert.ok(s.derived.secondLook.some((a) => a.id === 'secondLook.smallerWithPotential'))
  assert.ok(s.derived.showingTests.some((a) => a.id === 'inspect.expansionFeasibility'))
})

test('t9 and t10: Q8 changes ordering without changing either protect state', () => {
  const rankOneWins = one('t9_rankOneWinsQ8')
  const rankTwoWins = one('t10_rankTwoWinsQ8')

  for (const s of [rankOneWins, rankTwoWins]) {
    const held = new Set(s.buyerEvidence.protect.map((entry) => entry.id))
    // Both sides of the pair stay protected whichever way it went. `kitchen`
    // is also protected here, from the project answer, and is not part of it.
    assert.ok(held.has('light'), 'the loser lost its protect state')
    assert.ok(held.has('outdoor'), 'the loser lost its protect state')
  }

  assert.equal(rankOneWins.derived.expectedTradeoff?.a, 'light')
  assert.equal(rankOneWins.derived.expectedTradeoff?.b, 'outdoor')
  assert.equal(rankTwoWins.derived.expectedTradeoff?.a, 'outdoor')
  assert.equal(rankTwoWins.derived.expectedTradeoff?.b, 'light')

  // The stated rank is untouched by who won: order of naming and order of
  // survival are different facts.
  const ranks = (s: Strategy) =>
    Object.fromEntries(s.buyerEvidence.protect.map((entry) => [entry.id, entry.rank]))
  assert.deepEqual(ranks(rankOneWins), ranks(rankTwoWins))
  assert.equal(ranks(rankOneWins).light, 1)
  assert.equal(ranks(rankOneWins).outdoor, 2)
})

test('at most one expected tradeoff and one unresolved lever', () => {
  for (const { name, strategy } of all) {
    assert.ok(
      strategy.derived.expectedTradeoff === null || typeof strategy.derived.expectedTradeoff === 'object',
      name,
    )
    assert.ok(
      strategy.derived.unresolvedLever === null || typeof strategy.derived.unresolvedLever === 'object',
      name,
    )
  }
})

test('an expected tradeoff never claims a specific property contains the conflict', () => {
  for (const { name, strategy } of all) {
    const expected = strategy.derived.expectedTradeoff
    if (!expected) continue
    assert.notEqual(expected.a, expected.b, name)
    assert.ok(expected.because.length >= 2, `${name}: a tradeoff with one fact behind it`)
    assert.ok(!/house|listing|property with/i.test(expected.why), `${name}: predicts a specific house`)
  }
})

test('the unresolved lever never reopens something already settled', () => {
  for (const { name, strategy } of all) {
    const lever = strategy.derived.unresolvedLever
    if (!lever) continue
    if (strategy.buyerEvidence.map === 'fixed') {
      assert.ok(!/map|geograph/i.test(lever.id), `${name}: reopened a fixed map`)
    }
    const held = new Set(strategy.buyerEvidence.protect.map((entry) => entry.id))
    assert.ok(!held.has(lever.id), `${name}: reopened a direct dealbreaker`)
  }
})

test('a dealbreaker is never offered as the lever', () => {
  for (const { name, strategy } of all) {
    const dealbreakers = new Set(
      strategy.buyerEvidence.protect.filter((entry) => entry.rank !== null).map((entry) => entry.id),
    )
    for (const action of strategy.derived.flexFirst) {
      assert.ok(
        !dealbreakers.has(action.subject),
        `${name}: ${action.subject} is a dealbreaker and was offered as the give`,
      )
    }
  }
})

test('"no lever established" is a real answer and never sits beside a lever', () => {
  for (const { name, strategy } of all) {
    const levers = strategy.derived.flexFirst
    if (!levers.some((action) => action.id === 'flex.none')) continue
    assert.equal(levers.length, 1, `${name}: claimed no lever exists while offering one`)
  }
  // A fixed map with no renovation appetite genuinely has none.
  const stuck = one('turnkey')
  assert.deepEqual(
    stuck.derived.flexFirst.map((action) => action.subject),
    ['none'],
  )
})

test('a low-information buyer gets no filters and no invented levers', () => {
  const s = one('lowInformation')
  // The missing filter outranks the unresolved renovation band: a band with
  // nothing to apply it to changes no listing.
  assert.deepEqual(s.derived.filterHard, [])
  assert.deepEqual(s.derived.doNotSubstitute, [])
  assert.equal(s.derived.unresolvedLever?.id, 'firstFilter')
  assert.ok(s.derived.showingTests.length > 0, 'they should still be told what to do in person')
})
