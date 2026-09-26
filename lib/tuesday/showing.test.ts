import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_CHECKS, showingChecks } from './showing.ts'
import { score, type Answers } from './score.ts'

const DECORATOR: Answers = {
  tuesday: 'quiet', dealbreaker: 'dark', daily: ['dark', 'public'],
  inherit: 'renovation', whitehouse: 'mine', kitchen: 'never', location: 'property',
}

const OUTDOOR_NO_BURDEN: Answers = {
  tuesday: 'quiet', dealbreaker: 'outside', daily: ['outdoor', 'upkeep'],
  inherit: 'lot', whitehouse: 'bones', kitchen: 'depends', location: 'few',
}

test('every check is earned by a finding, never generic', () => {
  const result = score(OUTDOOR_NO_BURDEN)
  const checks = showingChecks(result)
  assert.ok(checks.length > 0)
  assert.ok(checks.length <= MAX_CHECKS, 'a checklist you cannot hold in your head is a document')

  // This buyer wants outdoor space and does not want grounds to run. Both
  // should be represented; nothing about a kitchen should be, since they said
  // nothing about one.
  assert.ok(checks.some((check) => /sit|exists/.test(check)), 'outdoor check missing')
  assert.ok(checks.some((check) => /keep it looking/.test(check)), 'upkeep check missing')
  assert.ok(!checks.some((check) => /kitchen/.test(check)), 'invented a kitchen finding')
})

test('the decorator is asked the kitchen question, because they raised it', () => {
  const checks = showingChecks(score(DECORATOR))
  assert.ok(checks.some((check) => /never redo this kitchen/.test(check)))
})

test('an empty test produces no checks at all', () => {
  assert.deepEqual(showingChecks(score({})), [])
})

test('checks are unique and ordered by evidence', () => {
  const result = score(DECORATOR)
  const checks = showingChecks(result)
  assert.equal(new Set(checks).size, checks.length, 'duplicates')

  const protectedIds = result.attributes.filter((e) => e.state === 'protect').map((e) => e.attribute.id)
  assert.ok(protectedIds.length > 0)
})
