import assert from 'node:assert/strict'
import { test } from 'node:test'
import { curatedFallback, findBySlug, mergeFeed, slugFromUrl } from './merge.ts'
import type { FeedEntry } from './substack.ts'

/**
 * The regression these tests exist for: Danielle publishes an essay on
 * Substack, nobody edits the repo, and the essay is on the site. That promise
 * broke once; it should not be able to break silently again.
 */

const sanitize = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')

const entry = (slug: string, title: string, over: Partial<FeedEntry> = {}): FeedEntry => ({
  title,
  url: `https://daniellewalder.substack.com/p/${slug}`,
  publishedAt: 'Mon, 01 Sep 2026 12:00:00 GMT',
  contentHtml: `<p>${title}</p>`,
  imageUrl: null,
  ...over,
})

/** Danielle has written a dek for A only. C is brand new and has none. */
const curated = [{ title: 'Essay A', dek: 'The dek for A.' }]

const FEED_BEFORE = [entry('essay-a', 'Essay A'), entry('essay-b', 'Essay B')]
const FEED_AFTER = [entry('essay-c', 'Essay C'), ...FEED_BEFORE]

// ------------------------------------------- the publish-a-new-essay case

test('before publishing, A leads', () => {
  const result = mergeFeed(FEED_BEFORE, curated, sanitize)
  assert.equal(result.lead?.title, 'Essay A')
  assert.equal(result.source, 'feed')
})

test('a newly published essay becomes the lead with no repo change', () => {
  const result = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.equal(result.lead?.title, 'Essay C')
})

test('the new essay gets a slug derived from its Substack permalink', () => {
  const result = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.equal(result.lead?.slug, 'essay-c')
  assert.equal(result.lead?.substackUrl, 'https://daniellewalder.substack.com/p/essay-c')
})

test('the new slug resolves to an on-site essay', () => {
  const found = findBySlug(mergeFeed(FEED_AFTER, curated, sanitize), 'essay-c')
  assert.equal(found?.title, 'Essay C')
  assert.ok(found?.contentHtml)
})

test('older essays remain available after the new one arrives', () => {
  const result = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.deepEqual(result.more.map((e) => e.title), ['Essay A', 'Essay B'])
  assert.equal(findBySlug(result, 'essay-a')?.title, 'Essay A')
  assert.equal(findBySlug(result, 'essay-b')?.title, 'Essay B')
})

test('a missing curated dek NEVER keeps an essay off the site', () => {
  const result = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.equal(result.lead?.title, 'Essay C')
  assert.equal(result.lead?.dek, null, 'C has no dek')
  assert.equal(result.more[0]?.dek, 'The dek for A.', 'A keeps hers')
})

test('curated deks merge by loose title match', () => {
  const drifted = [entry('essay-a', 'Essay A.')]
  assert.equal(mergeFeed(drifted, curated, sanitize).lead?.dek, 'The dek for A.')
})

// ---------------------------------------------------------- edge cases

test('an essay with no image still appears', () => {
  const result = mergeFeed([entry('essay-c', 'Essay C', { imageUrl: null })], [], sanitize)
  assert.equal(result.lead?.title, 'Essay C')
  assert.equal(result.lead?.imageUrl, null)
})

test('an essay with no content gets no on-site slug but still lists', () => {
  const result = mergeFeed([entry('essay-c', 'Essay C', { contentHtml: null })], [], sanitize)
  assert.equal(result.lead?.title, 'Essay C')
  assert.equal(result.lead?.slug, null, 'no on-site page without content')
  assert.equal(result.lead?.substackUrl, 'https://daniellewalder.substack.com/p/essay-c')
})

test('post HTML is sanitised before it can reach a page', () => {
  const nasty = entry('x', 'X', { contentHtml: '<p>ok</p><script>alert(1)</script>' })
  assert.equal(mergeFeed([nasty], [], sanitize).lead?.contentHtml, '<p>ok</p>')
})

test('a malformed permalink yields no slug rather than a broken route', () => {
  assert.equal(slugFromUrl('not a url'), null)
  assert.equal(slugFromUrl('https://daniellewalder.substack.com/about'), null)
  const bad = mergeFeed([entry('x', 'X', { url: 'not a url' })], [], sanitize)
  assert.equal(bad.lead?.slug, null)
})

test('a missing publish date is null, never invented', () => {
  const result = mergeFeed([entry('x', 'X', { publishedAt: null })], [], sanitize)
  assert.equal(result.lead?.publishedAt, null)
})

// ------------------------------------------------- failure and recovery

test('feed failure falls back to curated AND says so', () => {
  const result = curatedFallback(curated, 'https://daniellewalder.substack.com')
  assert.equal(result.source, 'curated', 'must be distinguishable from success')
  assert.equal(result.lead?.title, 'Essay A')
  assert.equal(result.lead?.slug, null, 'fallback entries have no on-site page')
})

test('the fallback cannot masquerade as a current feed read', () => {
  const stale = curatedFallback(curated, null)
  const live = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.notEqual(stale.source, live.source)
  assert.equal(stale.lead?.title, 'Essay A', 'fallback does not know about C')
  assert.equal(live.lead?.title, 'Essay C')
})

test('the feed resuming after a failure restores the newest essay', () => {
  assert.equal(curatedFallback(curated, null).source, 'curated')
  const resumed = mergeFeed(FEED_AFTER, curated, sanitize)
  assert.equal(resumed.source, 'feed')
  assert.equal(resumed.lead?.title, 'Essay C')
  assert.equal(findBySlug(resumed, 'essay-c')?.title, 'Essay C')
})

test('an empty curated list does not break a live feed', () => {
  const result = mergeFeed(FEED_AFTER, [], sanitize)
  assert.equal(result.lead?.title, 'Essay C')
  assert.equal(result.more.length, 2)
})
