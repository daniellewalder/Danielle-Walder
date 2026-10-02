import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QUALIFIERS } from './model.ts'
import { score } from './score.ts'
import { strategyFor } from './strategy.ts'
import { assembleBrief } from './brief.ts'
import type { Pick, V2Answers } from './answers.ts'

/*
 * The site, in person.
 *
 * `site` is protect-at-purchase and had no showing test at all, which is odd
 * for the attribute that is close to the definition of something a photograph
 * cannot carry. What the evidence licenses is "look at this". Nothing more.
 */

const build = (qualifier?: string) => {
  const pick: Pick = qualifier ? { option: 'site', qualifier } : { option: 'site' }
  const answers: V2Answers = { version: 2, dealbreaker: [pick], project: 'never', location: 'few' }
  const result = score(answers)
  return assembleBrief(result, strategyFor(result))
}

const siteTests = (qualifier?: string) =>
  build(qualifier).showingTests.filter((entry) => entry.subject === 'site')

const EVERY_QUALIFIER = QUALIFIERS.site.map((entry) => entry.id)

test('a protected site always produces exactly one in-person check', () => {
  for (const qualifier of [...EVERY_QUALIFIER, undefined]) {
    const found = siteTests(qualifier)
    assert.equal(found.length, 1, `site:${qualifier ?? 'none'} produced ${found.length} findings`)
    assert.equal(found[0].id, 'inspect.siteFit')
  }
})

test('the check carries the qualifier the buyer chose, and only that one', () => {
  for (const qualifier of EVERY_QUALIFIER) {
    const [found] = siteTests(qualifier)
    assert.equal(found.qualifier, qualifier)
    for (const other of EVERY_QUALIFIER) {
      if (other === qualifier) continue
      assert.ok(
        !JSON.stringify(found).includes(other),
        `site:${qualifier} mentioned the unrelated qualifier ${other}`,
      )
    }
  }
})

test('each qualifier narrows what to look at', () => {
  const focus: Readonly<Record<string, RegExp>> = {
    land: /slope.*shape.*usable/,
    sits: /sits on the property/,
    neighbours: /neighbouring structures/,
    access: /arrival.*driveway/,
    whole: /as one thing/,
  }
  for (const [qualifier, pattern] of Object.entries(focus)) {
    const [found] = siteTests(qualifier)
    assert.ok(
      found.trace.because?.some((fact) => pattern.test(fact)),
      `site:${qualifier} does not say what to inspect: ${found.trace.because?.join(' / ')}`,
    )
  }
})

test('the bundled whole-thing answer stays one finding, never four', () => {
  const found = siteTests('whole')
  assert.equal(found.length, 1)
  // And it must not name the four specifics, which would turn one answer into
  // four separate concerns the buyer never raised separately.
  const text = JSON.stringify(found)
  for (const specific of ['land', 'sits', 'neighbours', 'access']) {
    assert.ok(!text.includes(specific), `the whole-site answer was expanded into ${specific}`)
  }
})

test('with no qualifier it is overall site fit', () => {
  const [found] = siteTests()
  assert.equal(found.qualifier, undefined)
  assert.ok(found.trace.because?.some((fact) => /overall site fit/.test(fact)))
  assert.ok(found.trace.because?.includes('no qualifier given'))
})

test('nothing about the site is ever asserted as a problem', () => {
  /*
   * The evidence licenses "this needs evaluating in person". It does not
   * license a claim that the slope is bad, the neighbours are too close, the
   * driveway is difficult or the orientation is wrong. We have no property
   * data, and a guess here would be a statement about a house nobody has seen.
   */
  const FINDINGS =
    /\b(bad|poor|steep|difficult|awkward|too close|wrong|unusable|concerning|compromised|challenging|tricky|limited)\b/i
  const DISCLAIMER = 'this needs evaluating in person, and nothing here says a problem exists'
  for (const qualifier of [...EVERY_QUALIFIER, undefined]) {
    // Every string the brief produced, minus the disclaimer, which is the one
    // place the word "problem" is allowed precisely because it denies one.
    const produced = strings(build(qualifier)).filter((value) => value !== DISCLAIMER)
    for (const value of produced) {
      const hit = value.match(FINDINGS)
      assert.equal(hit, null, `site:${qualifier ?? 'none'} asserted "${hit?.[0]}" in "${value}"`)
      assert.ok(!/\bproblem\b/.test(value), `site:${qualifier ?? 'none'} named a problem: "${value}"`)
    }
  }
})

/** Every string value anywhere in the brief. Field names excluded. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

test('the check says outright that it implies no problem', () => {
  for (const qualifier of [...EVERY_QUALIFIER, undefined]) {
    const [found] = siteTests(qualifier)
    assert.ok(
      found.trace.because?.some((fact) => /nothing here says a problem exists/.test(fact)),
      `site:${qualifier ?? 'none'} does not disclaim a finding`,
    )
  }
})

test('the check is evidence-led: the buyer named the site themselves', () => {
  for (const qualifier of [...EVERY_QUALIFIER, undefined]) {
    const [found] = siteTests(qualifier)
    assert.equal(found.origin, 'buyerEvidence')
    assert.ok(found.trace.sources?.includes('dealbreaker'))
  }
})

test('an unprotected site produces no check at all', () => {
  const result = score({ version: 2, dealbreaker: [{ option: 'dark' }], project: 'never', location: 'few' })
  const brief = assembleBrief(result, strategyFor(result))
  assert.deepEqual(brief.showingTests.filter((entry) => entry.subject === 'site'), [])
})

test('the site has a home in the concept index on every qualifier', () => {
  for (const qualifier of [...EVERY_QUALIFIER, undefined]) {
    const brief = build(qualifier)
    assert.ok(brief.conceptIndex.site?.home, `site:${qualifier ?? 'none'} has no factual home`)
  }
})
