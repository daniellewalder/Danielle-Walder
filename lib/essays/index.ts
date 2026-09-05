import { substackFeedUrl, substackUrl } from '@/lib/config'
import { fetchSubstackEntries } from './substack'

export interface EssayEntry {
  title: string
  /** Real permalink, or the publication homepage, or null when neither exists. */
  url: string | null
  /** Only ever a real date from the feed. Never invented. */
  publishedAt: string | null
}

export interface EssayResult {
  entries: EssayEntry[]
  source: 'feed' | 'fallback'
}

/**
 * Verified essay titles from the approved design. These are real pieces; what
 * we do not have without the feed is their permalinks, so in fallback mode a
 * title links to the publication homepage if we know it, and otherwise renders
 * as plain text. Never a broken link, never an invented URL.
 */
const fallbackTitles = [
  'The Cost Per Tuesday',
  'Everybody Says They Want a Deal.',
  'Who Actually Has Access to Your Transaction?',
  'Is the Kitchen Actually Outdated, or Are You Just Tired of Looking at It?',
] as const

/**
 * The single seam between the site and Overthinking Real Estate.
 *
 * Essays live on Substack and stay there — this reads the public feed, it does
 * not migrate the writing into the repo.
 */
export async function getEssays(limit?: number): Promise<EssayResult> {
  const entries = substackFeedUrl ? await fetchSubstackEntries(substackFeedUrl) : null

  if (entries) {
    return {
      entries: typeof limit === 'number' ? entries.slice(0, limit) : entries,
      source: 'feed',
    }
  }

  const fallback: EssayEntry[] = fallbackTitles.map((title) => ({
    title,
    url: substackUrl,
    publishedAt: null,
  }))

  return {
    entries: typeof limit === 'number' ? fallback.slice(0, limit) : fallback,
    source: 'fallback',
  }
}
