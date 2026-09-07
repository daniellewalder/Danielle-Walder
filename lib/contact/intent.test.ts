import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseArea, parseIntent, showingHref } from './intent.ts'

/**
 * Query params reach this page from links anyone can edit, so the parsing
 * rules are tested directly rather than only through the page.
 */

test('intent=showing switches the page', () => {
  assert.equal(parseIntent('showing'), 'showing')
  assert.equal(parseIntent('SHOWING'), 'showing')
  assert.equal(parseIntent('  showing '), 'showing')
})

test('every other intent falls back to general', () => {
  for (const value of [undefined, '', 'general', 'sh0wing', 'showings', 'buy', '../../etc/passwd']) {
    assert.equal(parseIntent(value), 'general', `${String(value)} should fall back`)
  }
})

test('a repeated intent param takes the first value', () => {
  assert.equal(parseIntent(['showing', 'general']), 'showing')
  assert.equal(parseIntent(['nonsense', 'showing']), 'general')
})

test('a plain area is title-cased for display', () => {
  assert.equal(parseArea('calabasas'), 'Calabasas')
  assert.equal(parseArea('west hollywood'), 'West Hollywood')
  assert.equal(parseArea('los-feliz'), 'Los Feliz')
})

test('markup and script payloads are dropped entirely, not escaped through', () => {
  for (const value of [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '"><b>x',
    '{{constructor}}',
    'calabasas?x=1',
    'a/b',
  ]) {
    assert.equal(parseArea(value), null, `${value} should be rejected`)
  }
})

test('an over-long or empty area is dropped', () => {
  assert.equal(parseArea('a'.repeat(41)), null)
  assert.equal(parseArea('   '), null)
  assert.equal(parseArea(undefined), null)
  assert.equal(parseArea('123'), null)
})

test('accented place names survive', () => {
  assert.equal(parseArea('cañada'), 'Cañada')
})

test('showingHref builds the canonical link', () => {
  assert.equal(showingHref(), '/contact?intent=showing')
  assert.equal(showingHref('Calabasas'), '/contact?intent=showing&area=Calabasas')
  assert.equal(showingHref('West Hollywood'), '/contact?intent=showing&area=West+Hollywood')
  assert.equal(showingHref('   '), '/contact?intent=showing')
})
