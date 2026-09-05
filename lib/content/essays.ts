/**
 * The curated Overthinking Real Estate list.
 *
 * Titles and deks are Danielle's, taken verbatim from her editorial design.
 * Nothing here is written or embellished by anyone else, and no publish dates,
 * images, categories, or reading times are invented — a date only ever appears
 * when the live Substack feed supplies one.
 *
 * This list drives the editorial presentation on /read and the homepage. When
 * the publication feed is connected, entries are matched to it by title so each
 * one gains its real permalink and date; anything unmatched still links to the
 * publication rather than to nowhere.
 */
export interface CuratedEssay {
  title: string
  /** Standfirst / dek. Danielle's words. */
  dek: string
}

export const leadEssay: CuratedEssay = {
  title: 'The Cost Per Tuesday',
  dek: 'Why a home should work after the fantasy wears off.',
}

export const moreEssays: CuratedEssay[] = [
  {
    title: 'The Biggest Purchase of Your Life Runs on Reply-All',
    dek: 'Why real-estate transactions still rely on fragmented email, document copies, and weak information architecture.',
  },
  {
    title: "But Then I'd Be Living in Texas",
    dek: 'Why LA housing prices buy location, relationships, weather, work, routine, and place—not only square footage.',
  },
  {
    title: 'Every Agent You Follow Is the Top Agent in LA',
    dek: 'Rankings, awards, reviews, PR, and technically true facts can create a much bigger impression than they prove.',
  },
  {
    title: 'Social Improviser, Not a Professional Bullshitter',
    dek: 'AI jargon, prompting, SEO, discoverability, and why being easy to find is not the same as being good.',
  },
]

export const curatedEssays: CuratedEssay[] = [leadEssay, ...moreEssays]
