import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BRIEF_SUBJECT, briefBody, briefMailto } from './brief.ts'
import { score, type Answers } from './score.ts'

const URL_FOR = (a: string) => `https://daniellewalder.com/tuesday-test/result?a=${a}`

const PERSONAS: Record<string, { answers: Answers; url: string }> = {
  decorator: {
    answers: { tuesday: 'quiet', dealbreaker: 'outside', daily: ['utility', 'parking'], inherit: 'lot', whitehouse: 'mine', kitchen: 'never', location: 'strong' },
    url: URL_FOR('decorator'),
  },
  turnkey: {
    answers: { tuesday: 'errands', dealbreaker: 'layout', daily: ['public', 'separation'], inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'fixed' },
    url: URL_FOR('turnkey'),
  },
  builder: {
    answers: { tuesday: 'room', dealbreaker: 'outgrow', daily: ['separation', 'stairs'], inherit: 'lot', whitehouse: 'personality', kitchen: 'fixable', location: 'property' },
    url: URL_FOR('builder'),
  },
}

test('the brief is personalised, not a template with the same body every time', () => {
  const bodies = Object.values(PERSONAS).map(({ answers, url }) => briefBody(score(answers), url))
  assert.equal(new Set(bodies).size, bodies.length, 'two personas produced the same brief')
})

test('every brief carries the sections Danielle asked for', () => {
  for (const [name, { answers, url }] of Object.entries(PERSONAS)) {
    const body = briefBody(score(answers), url)
    for (const heading of ['Protect', 'My map', "What I'll change", 'Not established yet']) {
      assert.ok(body.includes(heading), `${name} is missing "${heading}"`)
    }
    assert.ok(body.startsWith('Hi Danielle,'), `${name} does not open properly`)
    assert.ok(body.includes(`My full result: ${url}`), `${name} lost the shareable link`)
    assert.ok(body.trimEnd().endsWith('A few other things about my search:'), `${name} has no space to add to`)
  }
})

test('the brief says what this buyer actually protected', () => {
  const decorator = briefBody(score(PERSONAS.decorator.answers), PERSONAS.decorator.url)
  assert.ok(decorator.includes('• The lot itself'))
  assert.ok(decorator.includes("• Outdoor space you'd actually use"))
  assert.ok(decorator.includes('Cosmetic changes: Yes'))

  const turnkey = briefBody(score(PERSONAS.turnkey.answers), PERSONAS.turnkey.url)
  assert.ok(turnkey.includes('• Move-in condition'))
  assert.ok(turnkey.includes("One area. It does not move."), 'map finding missing')
  assert.ok(turnkey.includes('Must work on arrival'), 'day-one section missing for a turnkey buyer')

  // The builder takes on real work, so nothing is a day-one requirement and
  // that section must be absent rather than empty.
  const builder = briefBody(score(PERSONAS.builder.answers), PERSONAS.builder.url)
  assert.ok(!builder.includes('Must work on arrival'))
})

test('an empty section is omitted, never printed as a heading with nothing under it', () => {
  const body = briefBody(score({ location: 'few' }), 'https://example.com/x')
  assert.ok(!body.includes('Protect\n\n'), 'printed an empty Protect section')
  assert.ok(body.includes('My map'))
})

test('the mailto encodes the brief so newlines and punctuation survive', () => {
  const { answers, url } = PERSONAS.decorator
  const result = score(answers)
  const href = briefMailto(result, url, 'homes@daniellewalder.com')

  assert.ok(href.startsWith('mailto:homes@daniellewalder.com?'))
  const query = new URLSearchParams(href.slice(href.indexOf('?') + 1))
  assert.equal(query.get('subject'), BRIEF_SUBJECT)
  assert.equal(query.get('body'), briefBody(result, url))
  // "+" in a mailto body shows up literally in most composers.
  assert.ok(!href.includes('+'), 'spaces must be %20, not +')
})

test('no reader-facing em dash reaches the email', () => {
  for (const { answers, url } of Object.values(PERSONAS)) {
    assert.ok(!briefBody(score(answers), url).includes('—'))
  }
})

test('the mailto stays clear of the length a mail client will silently truncate', () => {
  // Windows caps mailto at roughly 2048 characters. A brief that goes past it
  // is cut off mid-sentence with no warning at all.
  const longUrl =
    'https://daniellewalder.com/tuesday-test/result?a=tuesday.errands_dealbreaker.layout_daily.public-separation_inherit.renovation_whitehouse.finished_kitchen.done_location.fixed'
  for (const [name, { answers }] of Object.entries(PERSONAS)) {
    const length = briefMailto(score(answers), longUrl).length
    assert.ok(length < 1900, `${name} brief is ${length} chars, too close to the ceiling`)
  }
})

test('a trimmed checklist says how much was trimmed rather than hiding it', () => {
  const body = briefBody(score(PERSONAS.turnkey.answers), 'https://example.com/x')
  const match = body.match(/\(plus (\d+) more the test did not cover\)/)
  assert.ok(match, 'no count of what was left out')
  assert.ok(Number(match[1]) > 0)
})
