import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decodeAnswers, encodeAnswers } from './encode.ts'
import { QUESTIONS } from './questions.ts'
import { score, type Answers } from './score.ts'

const FULL: Answers = {
  tuesday: 'quiet',
  dealbreaker: 'dark',
  daily: ['dark', 'public'],
  inherit: 'renovation',
  whitehouse: 'mine',
  kitchen: 'never',
  location: 'property',
}

test('a full set, multi-select included, round-trips exactly', () => {
  assert.deepEqual(decodeAnswers(encodeAnswers(FULL)), FULL)
})

test('a partial set round-trips exactly', () => {
  const partial: Answers = { tuesday: 'quiet', location: 'fixed' }
  assert.deepEqual(decodeAnswers(encodeAnswers(partial)), partial)
})

test('the encoding survives a URL untouched', () => {
  const encoded = encodeAnswers(FULL)
  assert.equal(encodeURIComponent(encoded), encoded, 'must need no escaping')
  const url = new URL(`https://example.com/tuesday-test/result?a=${encoded}`)
  assert.deepEqual(decodeAnswers(url.searchParams.get('a')), FULL)
})

test('a multi-select cannot be stuffed past its limit through the URL', () => {
  const decoded = decodeAnswers('daily.dark-outdoor-public-separation-stairs')
  assert.deepEqual(decoded.daily, ['dark', 'outdoor'])
  assert.equal(score(decoded).answered, 2)
})

test('a stale or hostile link degrades to a partial result rather than an error', () => {
  for (const hostile of [
    '', null, undefined, 'garbage', 'tuesday.not-an-option', 'not-a-question.quiet',
    'tuesday.quiet_____', '.._..', 'daily.-', 'daily.nope-alsonope',
    'tuesday.quiet_dealbreaker.dark_removed-question.gone',
  ]) {
    const answers = decodeAnswers(hostile)
    assert.doesNotThrow(() => score(answers))
    for (const [questionId, value] of Object.entries(answers)) {
      const question = QUESTIONS.find((candidate) => candidate.id === questionId)
      assert.ok(question, `decoded an unknown question: ${questionId}`)
      for (const pick of Array.isArray(value) ? value : [value]) {
        assert.ok(question.options.some((option) => option.id === pick))
      }
    }
  }
  assert.deepEqual(decodeAnswers('tuesday.quiet_dealbreaker.dark_removed-question.gone'), {
    tuesday: 'quiet',
    dealbreaker: 'dark',
  })
})

test('encoding is stable, so the same answers always produce the same link', () => {
  assert.equal(
    encodeAnswers({ location: 'fixed', tuesday: 'quiet' }),
    encodeAnswers({ tuesday: 'quiet', location: 'fixed' }),
  )
})
