import { substackFeedUrl, substackUrl } from '@/lib/config'
import { curatedEssays, type CuratedEssay } from '@/lib/content/essays'
import { looksTruncated, sanitizeEssayHtml } from './sanitize'
import { fetchSubstackEntries } from './substack'

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
  /** Paid posts arrive truncated; the page says so rather than pretending. */
  truncated: boolean
  /** The cover image Danielle attached on Substack, when the feed carries one. */
  imageUrl: string | null
}

export interface EssayResult {
  lead: EssayEntry | null
  more: EssayEntry[]
  source: 'feed' | 'curated'
}

/** Loose title match, so punctuation drift in the feed does not break linking. */
function normalise(title: string): string {
  return title
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Substack permalinks look like /p/the-cost-per-tuesday. */
function slugFromUrl(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/p\/([^/]+)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * The single seam between the site and Overthinking Real Estate.
 *
 * THE FEED IS THE SOURCE OF TRUTH. Whatever Danielle publishes on Substack
 * appears here on the next revalidation, without anyone touching the repo —
 * that is the whole point, so this must never be driven by a hardcoded list.
 *
 * Her curated deks are merged in by title where she has written one. An essay
 * without a dek simply shows none; nothing is invented to fill the gap. The
 * curated list is used as the entire content only when the feed is
 * unreachable, so the page is never empty.
 *
 * Post HTML is sanitised before it can reach a page — see ./sanitize.ts.
 */
export async function getEssays(): Promise<EssayResult> {
  const feed = substackFeedUrl ? await fetchSubstackEntries(substackFeedUrl) : null
  const dekByTitle = new Map(curatedEssays.map((e) => [normalise(e.title), e.dek]))

  if (feed && feed.length > 0) {
    const entries: EssayEntry[] = feed.map((item) => {
      const contentHtml = item.contentHtml ? sanitizeEssayHtml(item.contentHtml) : null

      return {
        title: item.title,
        dek: dekByTitle.get(normalise(item.title)) ?? null,
        // An on-site page exists only when there is real content behind it.
        slug: contentHtml ? slugFromUrl(item.url) : null,
        substackUrl: item.url,
        publishedAt: item.publishedAt,
        contentHtml,
        truncated: item.contentHtml ? looksTruncated(item.contentHtml) : false,
        imageUrl: item.imageUrl,
      }
    })

    return { lead: entries[0] ?? null, more: entries.slice(1), source: 'feed' }
  }

  // Feed unreachable. Show Danielle's curated titles rather than an empty page.
  const fallback: EssayEntry[] = curatedEssays.map((essay) => ({
    title: essay.title,
    dek: essay.dek,
    slug: null,
    substackUrl,
    publishedAt: null,
    contentHtml: null,
    truncated: false,
    imageUrl: null,
  }))

  return { lead: fallback[0] ?? null, more: fallback.slice(1), source: 'curated' }
}

/** One essay by its on-site slug, or null when there is no such page. */
export async function getEssay(slug: string): Promise<EssayEntry | null> {
  const { lead, more } = await getEssays()
  return [lead, ...more].find((entry) => entry?.slug === slug) ?? null
}

/** Slugs that have real content behind them, for prerendering. */
export async function getEssaySlugs(): Promise<string[]> {
  const { lead, more } = await getEssays()
  return [lead, ...more].flatMap((entry) => (entry?.slug ? [entry.slug] : []))
}
