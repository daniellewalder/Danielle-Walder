import assert from 'node:assert/strict'
import { test } from 'node:test'
import { independentSources, isRepeated } from './model.ts'
import { score, type Answers } from './score.ts'
import { interpret, synthesis } from './interpret.ts'
import { interpretation, signalsOf, theRead } from './read.ts'

/*
 * PROVENANCE.
 *
 * One answer can legitimately reach four places in the result: the attribute
 * is protected, it has to work on arrival, it becomes a practical flag, and it
 * earns a check at the showing. That is four USES of one thing the buyer told
 * us, and an earlier version read it back as four confirmations, so someone
 * who mentioned storage once was told they kept coming back to it.
 *
 * These tests exist so that cannot return. Derived output is never evidence.
 */

/** The result from the screenshot: nothing here was said twice. */
const DECORATOR: Answers = {
  tuesday: 'quiet',
  dealbreaker: 'outside',
  daily: ['utility', 'parking'],
  inherit: 'renovation',
  whitehouse: 'mine',
  kitchen: 'never',
  location: 'strong',
}

/** Outdoor space is named as the dealbreaker AND again as a daily friction. */
const REPEATED_OUTDOOR: Answers = {
  tuesday: 'quiet',
  dealbreaker: 'outside',
  daily: ['outdoor', 'utility'],
  inherit: 'renovation',
  whitehouse: 'bones',
  kitchen: 'depends',
  location: 'few',
}

const RECURRENCE = /kept coming back|came back to|showed up repeatedly|were consistent|again and again/i

const find = (answers: Answers, id: string) =>
  score(answers).attributes.find((entry) => entry.attribute.id === id)

test('one answer feeding several result states is still one source', () => {
  // `inherit: renovation` states that condition matters AND wins the lot in
  // the same breath. That is one question, and one interaction.
  const condition = find(DECORATOR, 'condition')
  assert.ok(condition)
  assert.deepEqual([...condition.evidence.sources], ['inherit'])
  assert.deepEqual([...condition.evidence.tradeoffSources], ['inherit'])
  assert.equal(independentSources(condition.evidence), 1)
  assert.equal(condition.repeated, false)

  // And it genuinely does reach several parts of the result, which is the
  // whole point: reuse downstream must not look like emphasis upstream.
  const result = score(DECORATOR)
  const { brief, checks } = interpretation(result)
  assert.ok(brief.priorities.includes('Move-in condition'))
  assert.ok(brief.mustWorkNote)
  assert.ok(checks.length > 0)
  assert.equal(find(DECORATOR, 'condition')?.evidence.sources.length, 1)
})

test('two picks inside one multi-select are one interaction, not two', () => {
  // `daily` is choose-two. Both picks land on the same question id.
  const utility = find(DECORATOR, 'utility')
  const parking = find(DECORATOR, 'parking')
  assert.deepEqual([...(utility?.evidence.sources ?? [])], ['daily'])
  assert.deepEqual([...(parking?.evidence.sources ?? [])], ['daily'])
  assert.equal(utility?.repeated, false)
  assert.equal(parking?.repeated, false)
})

test('a recurrence phrase requires two distinct question ids', () => {
  const nothingRepeated = score(DECORATOR)
  assert.ok(
    !nothingRepeated.attributes.some((entry) => entry.repeated),
    'this fixture is meant to have nothing repeated',
  )

  const prose = [
    ...synthesis(nothingRepeated),
    ...interpret(nothingRepeated),
    ...(theRead(nothingRepeated)?.paragraphs ?? []),
    theRead(nothingRepeated)?.headline ?? '',
  ].join(' ')
  assert.ok(!RECURRENCE.test(prose), `claimed recurrence with no repeated evidence: ${prose}`)

  const repeated = score(REPEATED_OUTDOOR)
  const outdoor = repeated.attributes.find((entry) => entry.attribute.id === 'outdoor')
  assert.equal(independentSources(outdoor!.evidence), 2)
  assert.ok(RECURRENCE.test(synthesis(repeated).join(' ')), 'refused to say it when it was true')
})

test('no persona claims recurrence without an attribute to back it', () => {
  const PERSONAS: Answers[] = [
    DECORATOR,
    REPEATED_OUTDOOR,
    { tuesday: 'close', dealbreaker: 'outgrow', daily: ['public', 'separation'], inherit: 'both', whitehouse: 'personality', kitchen: 'depends', location: 'fixed' },
    { tuesday: 'room', dealbreaker: 'outgrow', daily: ['separation', 'stairs'], inherit: 'lot', whitehouse: 'personality', kitchen: 'fixable', location: 'property' },
    { tuesday: 'errands', dealbreaker: 'layout', daily: ['public', 'separation'], inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'fixed' },
    { tuesday: 'quiet', dealbreaker: 'dark', daily: ['outdoor', 'public'], inherit: 'lot', whitehouse: 'personality', kitchen: 'never', location: 'fixed' },
    { tuesday: 'errands', dealbreaker: 'none', daily: ['unsure'], inherit: 'both', whitehouse: 'bones', kitchen: 'depends', location: 'strong' },
  ]

  for (const answers of PERSONAS) {
    const result = score(answers)
    const prose = [
      ...synthesis(result),
      ...interpret(result),
      ...(theRead(result)?.paragraphs ?? []),
    ].join(' ')
    if (!RECURRENCE.test(prose)) continue
    assert.ok(
      result.attributes.some((entry) => entry.repeated),
      `claimed recurrence with nothing repeated: ${prose}`,
    )
  }
})

test('reuse downstream cannot raise confidence', () => {
  // condition is stated AND wins a tradeoff, both from `inherit`. Under the
  // old count that was two signals and read as moderate.
  const condition = find(DECORATOR, 'condition')
  assert.equal(condition?.confidence, 'weak')

  // Two different questions genuinely is moderate.
  const outdoor = find(REPEATED_OUTDOOR, 'outdoor')
  assert.equal(outdoor?.confidence, 'moderate')

  // Three different questions is strong. Nothing else can get there.
  const threeWays = score({ tuesday: 'quiet', dealbreaker: 'privacy', daily: ['dark', 'outdoor'], location: 'few' })
  const privacy = threeWays.attributes.find((entry) => entry.attribute.id === 'privacy')
  assert.equal(independentSources(privacy!.evidence), 2)
  assert.equal(privacy?.confidence, 'moderate')
})

test('the opening line prefers a repeated theme over a one-off practical flag', () => {
  const lines = synthesis(score(REPEATED_OUTDOOR))
  const opening = lines[0]
  assert.match(opening, RECURRENCE)
  assert.match(opening, /outdoor space/i)
  // Laundry came from the same single answer and must not be promoted beside it.
  assert.ok(!/laundry/i.test(opening), `a one-off bundled flag opened the result: ${opening}`)
})

test('a bundled label never implies three needs were separately established', () => {
  const utility = find(DECORATOR, 'utility')
  assert.equal(utility?.attribute.bundled, true)
  assert.equal(independentSources(utility!.evidence), 1)

  const prose = [...synthesis(score(DECORATOR)), ...interpret(score(DECORATOR))].join(' ')
  const mentions = prose.match(/laundry, storage and pantry/gi) ?? []
  assert.ok(mentions.length <= 1, 'the bundle is repeated as though it were several findings')
})

test('the screenshot result no longer overclaims', () => {
  const result = score(DECORATOR)
  const lines = synthesis(result)
  const joined = lines.join(' ')

  assert.ok(!RECURRENCE.test(joined), joined)
  // The strongest single priority is still named, with the neutral verb.
  assert.match(joined, /outdoor space you'd actually use matters too/i)
  assert.match(joined, /your map has some room/i)
  // And the one-off storage answer is nowhere near the opening.
  assert.ok(!/laundry/i.test(joined))
})

test('isRepeated is the single gate, and it counts questions', () => {
  assert.equal(isRepeated({ direct: 9, tradeoffWins: 4, tradeoffLosses: 0, mentions: 9, sources: ['daily'], tradeoffSources: ['daily'] }), false)
  assert.equal(isRepeated({ direct: 1, tradeoffWins: 0, tradeoffLosses: 0, mentions: 1, sources: ['daily', 'tuesday'], tradeoffSources: [] }), true)
  assert.equal(isRepeated({ direct: 0, tradeoffWins: 1, tradeoffLosses: 0, mentions: 0, sources: ['inherit'], tradeoffSources: ['dealbreaker'] }), true)
})

test('reject faster still fires on a single emphatic answer', () => {
  // Counting confidence by question made one dealbreaker read as "weak". That
  // must not switch off the section that tells someone what to skip.
  const result = score(REPEATED_OUTDOOR)
  const reject = interpretation(result).changes.find((change) => change.heading === 'Reject faster')
  assert.ok(reject, 'a protected site attribute produced no reject-faster')

  const oneAnswer = score({ dealbreaker: 'dark', location: 'few' })
  assert.equal(signalsOf(oneAnswer).site.length, 1)
  assert.ok(interpretation(oneAnswer).changes.some((change) => change.heading === 'Reject faster'))
})
