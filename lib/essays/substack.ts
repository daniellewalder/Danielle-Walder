import { XMLParser } from 'fast-xml-parser'
import { pickEssayImage } from './images'

export interface FeedEntry {
  title: string
  url: string
  publishedAt: string | null
  /** Raw post HTML from content:encoded. NEVER render without sanitising. */
  contentHtml: string | null
  /** The post's cover image, from the feed's enclosure. */
  imageUrl: string | null
}

const TIMEOUT_MS = 5000

/**
 * How long a fetched feed stays cached: five minutes.
 *
 * This was 1800 (30 minutes), which is what made a newly published essay take
 * far too long to appear. Note that Next serves ISR pages stale-while-
 * revalidate, so the window is the earliest a refresh can START, not when a
 * visitor sees it — the first request after the window still gets the old page
 * and only triggers regeneration. Five minutes keeps the real-world delay
 * inside the 5-10 minute target without hammering Substack: one fetch per five
 * minutes per page, however many visitors arrive.
 */
const REVALIDATE_SECONDS = 300

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  // Substack wraps titles and descriptions in CDATA; keep them as plain text.
  cdataPropName: false,
  processEntities: true,
})

function asText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number') return String(value)
  // A tag carrying attributes parses to an object with the text under '#text'.
  if (value && typeof value === 'object' && '#text' in value) {
    return asText((value as Record<string, unknown>)['#text'])
  }
  return null
}

/**
 * Fetch and parse a Substack RSS feed.
 *
 * Returns `null` on any failure — network, timeout, malformed XML, empty feed.
 * Callers fall back to the verified list. Failures are logged server-side and
 * never surfaced to a visitor.
 */
export async function fetchSubstackEntries(feedUrl: string): Promise<FeedEntry[] | null> {
  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml',
        // Substack rejects some bare server-side requests; identify ourselves.
        'user-agent': 'daniellewalder.com feed reader',
      },
    })

    if (!response.ok) {
      console.warn(`Substack feed responded ${response.status} — using fallback list.`)
      return null
    }

    const parsed = parser.parse(await response.text())
    const channel = parsed?.rss?.channel
    const rawItems = channel?.item
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : []

    const entries = items.flatMap((item: Record<string, unknown>) => {
      const title = asText(item.title)
      const url = asText(item.link)
      if (!title || !url) return []

      // Substack puts the full post here for free posts, truncated for paid.
      const contentHtml = asText(item['content:encoded'])

      return [
        {
          title,
          url,
          publishedAt: asText(item.pubDate),
          contentHtml,
          /*
           * Enclosure first, then this item's other declared artwork, then the
           * first meaningful image in its own body. Every source is inside THIS
           * item, so artwork cannot bleed between essays. See ./images.ts.
           */
          imageUrl: pickEssayImage(item, contentHtml),
        },
      ]
    })

    return entries.length > 0 ? entries : null
  } catch (error) {
    console.warn('Substack feed unavailable — using fallback list.', error)
    return null
  }
}
