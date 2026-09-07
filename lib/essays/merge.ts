import type { CuratedEssay } from '@/lib/content/essays'
import type { FeedEntry } from './substack'

/**
 * The pure part of the essay pipeline: feed entries plus Danielle's curated
 * deks in, display entries out.
 *
 * Extracted from ./index.ts so the behaviour that actually matters — a newly
 * published post becoming the lead without anybody editing the repo — can be
 * tested against fixtures instead of only against a live network call. This
 * module imports no runtime dependency of its own; the sanitiser is passed in.
 */

export interface EssayEntry {
  title: string
  /** Danielle's standfirst, when she has written one. Never from feed HTML. */
  dek: string | null
  /** On-site route, when the feed gave us the post. Null otherwise. */
  slug: string | null
  /** The original on Substack. Always the canonical source. */
  substackUrl: string | null
  /** Only ever a real date from the feed. Never invented. */
  publishedAt: string | null
  /** Sanitised post HTML, when the feed carried it. */
  contentHtml: string | null
  /** The cover image Danielle attached on Substack, when the feed carries one. */
  imageUrl: string | null
}

export interface EssayResult {
  lead: EssayEntry | null
  more: EssayEntry[]
  /**
   * 'feed' means the site is current. 'curated' means the feed failed and the
   * page is frozen on a hardcoded list — it looks fine and is NOT current.
   * Callers and tests use this to tell those two apart.
   */
  source: 'feed' | 'curated'
}

/** Loose title match, so punctuation drift in the feed does not break linking. */
export function normalise(title: string): string {
  return title
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Substack permalinks look like /p/the-cost-per-tuesday. */
export function slugFromUrl(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/p\/([^/]+)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * Merge a successful feed read with Danielle's curated deks.
 *
 * FEED ORDER IS PRESERVED, so whatever Substack lists first is the lead. A
 * curated dek is attached where one exists and its absence changes nothing
 * else: an essay she has not written a dek for still appears, still gets a
 * slug, and still becomes the lead if it is newest. That is the property that
 * makes "publishing to Substack is the only publishing action" true.
 */
export function mergeFeed(
  feed: FeedEntry[],
  curated: CuratedEssay[],
  /**
   * Turns raw feed HTML into what the page renders: de-duplicates the cover
   * image against the body, then sanitises. Injected rather than imported so
   * this module keeps no runtime dependency and stays directly testable.
   */
  prepareBody: (html: string, coverUrl: string | null) => string,
): EssayResult {
  const dekByTitle = new Map(curated.map((essay) => [normalise(essay.title), essay.dek]))

  const entries: EssayEntry[] = feed.map((item) => {
    const contentHtml = item.contentHtml ? prepareBody(item.contentHtml, item.imageUrl) : null

    return {
      title: item.title,
      dek: dekByTitle.get(normalise(item.title)) ?? null,
      // An on-site page exists only when there is real content behind it.
      slug: contentHtml ? slugFromUrl(item.url) : null,
      substackUrl: item.url,
      publishedAt: item.publishedAt,
      contentHtml,
      imageUrl: item.imageUrl,
    }
  })

  return { lead: entries[0] ?? null, more: entries.slice(1), source: 'feed' }
}

/**
 * The feed could not be read. Show Danielle's curated titles rather than an
 * empty page — but mark the result 'curated' so nothing mistakes this for a
 * current site.
 */
export function curatedFallback(curated: CuratedEssay[], substackUrl: string | null): EssayResult {
  const entries: EssayEntry[] = curated.map((essay) => ({
    title: essay.title,
    dek: essay.dek,
    slug: null,
    substackUrl,
    publishedAt: null,
    contentHtml: null,
    imageUrl: null,
  }))

  return { lead: entries[0] ?? null, more: entries.slice(1), source: 'curated' }
}

/** One essay by its on-site slug, or null when there is no such page. */
export function findBySlug(result: EssayResult, slug: string): EssayEntry | null {
  return [result.lead, ...result.more].find((entry) => entry?.slug === slug) ?? null
}
