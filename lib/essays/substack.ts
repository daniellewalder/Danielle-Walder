import { XMLParser } from 'fast-xml-parser'

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
const REVALIDATE_SECONDS = 1800

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  // Substack wraps titles and descriptions in CDATA; keep them as plain text.
  cdataPropName: false,
  processEntities: true,
})

/**
 * Substack attaches the post's cover image as an enclosure. Only image types
 * are taken, and only over http(s) — never a data: or javascript: URL.
 */
function imageFromEnclosure(enclosure: unknown): string | null {
  const list = Array.isArray(enclosure) ? enclosure : enclosure ? [enclosure] : []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const type = record['@_type']
    const url = record['@_url']
    if (typeof type !== 'string' || !type.startsWith('image/')) continue
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) continue
    return url
  }

  return null
}

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

      return [
        {
          title,
          url,
          publishedAt: asText(item.pubDate),
          // Substack puts the full post here for free posts, truncated for paid.
          contentHtml: asText(item['content:encoded']),
          imageUrl: imageFromEnclosure(item.enclosure),
        },
      ]
    })

    return entries.length > 0 ? entries : null
  } catch (error) {
    console.warn('Substack feed unavailable — using fallback list.', error)
    return null
  }
}
