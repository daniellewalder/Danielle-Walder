import { substackFeedUrl, substackUrl } from '@/lib/config'
import { curatedEssays } from '@/lib/content/essays'
import { curatedFallback, findBySlug, mergeFeed } from './merge'
import { sanitizeEssayHtml } from './sanitize'
import { fetchSubstackEntries } from './substack'

export type { EssayEntry, EssayResult } from './merge'

/**
 * The single seam between the site and Overthinking Real Estate.
 *
 * THE FEED IS THE SOURCE OF TRUTH. Whatever Danielle publishes on Substack
 * appears here on the next revalidation, without anyone touching the repo —
 * that is the whole point, so this must never be driven by a hardcoded list.
 *
 * Her curated deks are merged in by title where she has written one. An essay
 * without a dek simply shows none; nothing is invented to fill the gap, and
 * the missing dek never keeps the essay off the site.
 *
 * The merge itself lives in ./merge.ts and is tested there. Post HTML is
 * sanitised before it can reach a page — see ./sanitize.ts.
 */
export async function getEssays() {
  const feed = substackFeedUrl ? await fetchSubstackEntries(substackFeedUrl) : null

  if (feed && feed.length > 0) {
    return mergeFeed(feed, curatedEssays, sanitizeEssayHtml)
  }

  /*
   * FEED FAILED. This is the state that must never be mistaken for success:
   * the page still renders, but it is frozen on a hardcoded list and a newly
   * published essay will NOT be on it.
   *
   * The visitor sees a normal page. The server log says plainly what happened,
   * so a stale site is diagnosable instead of looking healthy.
   */
  console.error(
    `[essays] SUBSTACK FEED UNAVAILABLE — serving the curated fallback list. ` +
      `The site is NOT current: essays published since the last successful ` +
      `fetch will be missing. Feed URL: ${substackFeedUrl ?? '(none configured)'}`,
  )

  return curatedFallback(curatedEssays, substackUrl)
}

/** One essay by its on-site slug, or null when there is no such page. */
export async function getEssay(slug: string) {
  return findBySlug(await getEssays(), slug)
}

/**
 * Slugs that have real content behind them, for prerendering.
 *
 * This is a build-time snapshot and is expected to be incomplete: an essay
 * published after the deploy is not in it. That is fine — `dynamicParams` is
 * on, so a new slug renders on demand. Never pad this list.
 */
export async function getEssaySlugs(): Promise<string[]> {
  const { lead, more } = await getEssays()
  return [lead, ...more].flatMap((entry) => (entry?.slug ? [entry.slug] : []))
}
