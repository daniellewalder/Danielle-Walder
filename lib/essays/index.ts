import { substackFeedUrl, substackUrl } from '@/lib/config'
import { curatedEssays, type CuratedEssay } from '@/lib/content/essays'
import { fetchSubstackEntries } from './substack'

export interface EssayEntry {
  title: string
  /** Danielle's standfirst. Curated, never taken from feed HTML. */
  dek: string
  /** Real permalink, or the publication homepage, or null when neither exists. */
  url: string | null
  /** Only ever a real date from the feed. Never invented. */
  publishedAt: string | null
}

export interface EssayResult {
  lead: EssayEntry | null
  more: EssayEntry[]
  /** 'feed' once at least one entry matched a live feed item. */
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

/**
 * The single seam between the site and Overthinking Real Estate.
 *
 * Essays live on Substack and stay there — this reads the public feed, it does
 * not migrate the writing into the repo. Presentation comes from Danielle's
 * curated list; the feed only ever supplies real permalinks and real dates.
 * Feed descriptions are deliberately never rendered: they are arbitrary HTML.
 */
export async function getEssays(): Promise<EssayResult> {
  const feed = substackFeedUrl ? await fetchSubstackEntries(substackFeedUrl) : null
  const byTitle = new Map((feed ?? []).map((item) => [normalise(item.title), item]))
  let matched = false

  const toEntry = (essay: CuratedEssay): EssayEntry => {
    const match = byTitle.get(normalise(essay.title))
    if (match) matched = true

    return {
      title: essay.title,
      dek: essay.dek,
      url: match?.url ?? substackUrl,
      publishedAt: match?.publishedAt ?? null,
    }
  }

  const entries = curatedEssays.map(toEntry)

  return {
    lead: entries[0] ?? null,
    more: entries.slice(1),
    source: matched ? 'feed' : 'curated',
  }
}
