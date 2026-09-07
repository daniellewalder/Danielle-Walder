import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildMailto, buildSms, fillTemplate, normalizePhone } from './quickSend.ts'

/**
 * A pasted listing URL routinely contains &, ?, # and spaces, every one of
 * which truncates or corrupts a mailto/sms body if it is not encoded. These
 * tests exist so that never silently regresses.
 */

const LISTING = 'https://www.zillow.com/homedetails/123-Main-St/12345_zpid/?t=for_sale&x=1#photos'

test('the listing is substituted into a template', () => {
  assert.equal(fillTemplate('See: {listing}', 'abc'), 'See: abc')
  assert.equal(fillTemplate('See: {listing}', '  abc  '), 'See: abc')
})

test('mailto encodes a listing URL with query string and fragment', () => {
  const href = buildMailto('homes@example.com', 'House I want to see', fillTemplate('{listing}', LISTING))
  assert.ok(href.startsWith('mailto:homes@example.com?'))
  // The raw & and # must not survive — they would truncate the body.
  const body = href.split('body=')[1]
  assert.ok(!body.includes('&'), 'ampersand must be encoded')
  assert.ok(!body.includes('#'), 'fragment marker must be encoded')
  assert.equal(decodeURIComponent(body), LISTING)
})

test('mailto keeps newlines and real spaces, not plus signs', () => {
  const href = buildMailto('a@b.co', 'Subject here', 'Hi Danielle,\n\nI’d like to see this house:\n\nX\n\nThanks!')
  assert.ok(!href.includes('+'), 'spaces must be %20, not +')
  assert.ok(href.includes('%0A'), 'newlines must survive as %0A')
  const [, query] = href.split('?')
  const params = new URLSearchParams(query)
  assert.equal(params.get('subject'), 'Subject here')
  assert.ok(params.get('body')?.startsWith('Hi Danielle,\n\n'))
})

test('an address with spaces round-trips', () => {
  const href = buildMailto('a@b.co', 's', '123 Main St, Calabasas, CA 91302')
  assert.equal(new URLSearchParams(href.split('?')[1]).get('body'), '123 Main St, Calabasas, CA 91302')
})

test('phone numbers normalise to digits, keeping a leading +', () => {
  assert.equal(normalizePhone('(310) 555-0142'), '3105550142')
  assert.equal(normalizePhone('+1 310 555 0142'), '+13105550142')
  assert.equal(normalizePhone('  310.555.0142  '), '3105550142')
  assert.equal(normalizePhone('not a phone'), null)
  assert.equal(normalizePhone(''), null)
})

test('sms uses the cross-platform ?&body= form and encodes the listing', () => {
  const href = buildSms('(310) 555-0142', fillTemplate('Hi — this house: {listing}', LISTING))
  assert.ok(href.startsWith('sms:3105550142?&body='))
  const body = href.slice('sms:3105550142?&body='.length)
  assert.ok(!body.includes('&'), 'ampersand must be encoded')
  assert.equal(decodeURIComponent(body), `Hi — this house: ${LISTING}`)
})

test('sms returns nothing for an unusable phone value', () => {
  assert.equal(buildSms('n/a', 'x'), '')
})

test('markup in a pasted value is encoded, never emitted raw', () => {
  const href = buildMailto('a@b.co', 's', fillTemplate('{listing}', '<script>alert(1)</script>'))
  assert.ok(!href.includes('<script>'))
  assert.equal(new URLSearchParams(href.split('?')[1]).get('body'), '<script>alert(1)</script>')
})
