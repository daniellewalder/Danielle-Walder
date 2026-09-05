import { substackFeedUrl, substackUrl } from '@/lib/config'
import { curatedEssays, type CuratedEssay } from '@/lib/content/essays'
import { looksTruncated, sanitizeEssayHtml } from './sanitize'
import { fetchSubstackEntries } from './substack'

export interface EssayEntry {
  title: string
  /** Danielle's standfirst. Curated, never taken from feed HTML. */
  dek: string
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
 * Essays are written on Substack. This reads the public feed and renders them
 * here as well, with the original always credited and linked, and the canonical
 * tag pointing back to Substack. Post HTML is sanitised before it is ever put
 * on a page — see ./sanitize.ts. Deks stay Danielle's; feed descriptions are
 * never used.
 */
export async function getEssays(): Promise<EssayResult> {
  const feed = substackFeedUrl ? await fetchSubstackEntries(substackFeedUrl) : null
  const byTitle = new Map((feed ?? []).map((item) => [normalise(item.title), item]))
  let matched = false

  const toEntry = (essay: CuratedEssay): EssayEntry => {
    const match = byTitle.get(normalise(essay.title))
    if (match) matched = true

    const contentHtml = match?.contentHtml ? sanitizeEssayHtml(match.contentHtml) : null

    return {
      title: essay.title,
      dek: essay.dek,
      // An on-site page exists only when there is real content to put on it.
      slug: contentHtml && match ? slugFromUrl(match.url) : null,
      substackUrl: match?.url ?? substackUrl,
      publishedAt: match?.publishedAt ?? null,
      contentHtml,
      truncated: match?.contentHtml ? looksTruncated(match.contentHtml) : false,
    }
  }

  const entries = curatedEssays.map(toEntry)

  return {
    lead: entries[0] ?? null,
    more: entries.slice(1),
    source: matched ? 'feed' : 'curated',
  }
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
