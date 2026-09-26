import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decodeAnswers, encodeAnswers } from './encode.ts'
import { QUESTIONS } from './questions.ts'
import { score } from './score.ts'

const FULL = {
  tuesday: 'quiet',
  dealbreaker: 'dark',
  inherit: 'depends',
  whitehouse: 'mine',
  kitchen: 'never',
  location: 'life',
}

test('a full set round-trips exactly', () => {
  assert.deepEqual(decodeAnswers(encodeAnswers(FULL)), FULL)
})

test('a partial set round-trips exactly', () => {
  const partial = { tuesday: 'quiet', location: 'neighborhood' }
  assert.deepEqual(decodeAnswers(encodeAnswers(partial)), partial)
})

test('the encoding survives a URL untouched', () => {
  const encoded = encodeAnswers(FULL)
  assert.equal(encodeURIComponent(encoded), encoded, 'must need no escaping')
  const url = new URL(`https://example.com/tuesday-test/result?a=${encoded}`)
  assert.deepEqual(decodeAnswers(url.searchParams.get('a')), FULL)
})

test('a stale or hostile link degrades to a partial result rather than an error', () => {
  for (const hostile of [
    '',
    null,
    undefined,
    'garbage',
    'tuesday.not-an-option',
    'not-a-question.quiet',
    'tuesday.quiet_____',
    '.._..',
    'tuesday.quiet_dealbreaker.dark_removed-question.gone',
  ]) {
    const answers = decodeAnswers(hostile)
    assert.doesNotThrow(() => score(answers))
    for (const [questionId, optionId] of Object.entries(answers)) {
      const question = QUESTIONS.find((candidate) => candidate.id === questionId)
      assert.ok(question, `decoded an unknown question: ${questionId}`)
      assert.ok(question.options.some((option) => option.id === optionId))
    }
  }
  // The one above that has real answers keeps them and drops only the stale pair.
  assert.deepEqual(decodeAnswers('tuesday.quiet_dealbreaker.dark_removed-question.gone'), {
    tuesday: 'quiet',
    dealbreaker: 'dark',
  })
})

test('encoding is stable, so the same answers always produce the same link', () => {
  const reordered = { location: 'life', tuesday: 'quiet', dealbreaker: 'dark' }
  const inOrder = { tuesday: 'quiet', dealbreaker: 'dark', location: 'life' }
  assert.equal(encodeAnswers(reordered), encodeAnswers(inOrder))
})
