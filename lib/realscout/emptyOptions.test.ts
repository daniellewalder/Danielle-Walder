import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEmptyStateText } from './emptyOptions.ts'

/**
 * The DOM walk in this module is verified in a real browser against fixture
 * shadow roots — it cannot run under `node --test`, and jsdom is not a
 * dependency here. What IS worth pinning in the suite is the matcher, because
 * it is the part someone will reach for when the wording changes, and widening
 * it carelessly is how this starts hiding real content.
 */

test('matches the widget empty-state line and its wordings', () => {
  for (const text of [
    'No options',
    'no options',
    'NO OPTIONS',
    'No option',
    'No options.',
    '  No options  ',
    'No results',
    'No matches',
  ]) {
    assert.equal(isEmptyStateText(text), true, `should match: ${text}`)
  }
})

test('never matches prose that merely contains the words', () => {
  for (const text of [
    'There are no options left in this price range.',
    'No options for buyers under $1M',
    'no options?',
    'Options',
    '',
    '   ',
    null,
  ]) {
    assert.equal(isEmptyStateText(text), false, `should not match: ${text}`)
  }
})
