import { phraseFor, type Bucket } from './model.ts'
import { byBucket, type Result, type ScoredAttribute } from './score.ts'

/**
 * The spoken half of the result.
 *
 * COPY STATUS: a draft in Danielle's register, awaiting her line edit. The
 * selection logic is product; the sentences are hers to rewrite.
 *
 * Two rules govern everything here:
 *
 * 1. NO ARCHETYPES. It never says "you're a Venice person" or "the
 *    Architectural Romantic". It reports what this buyer demonstrated and what
 *    follows from it, which is a search brief, not a horoscope.
 *
 * 2. NO MORALISING. Wanting a finished house is not worse than wanting a
 *    project; a tight map is not worse than a wide one. Every branch below has
 *    to read as useful whichever way it lands, so none of them is written as a
 *    consolation.
 *
 * Sentences are chosen by COMBINATION, not one per answer — that is the
 * difference between judgement and a receipt. Two or three land, drawn from
 * different facets, and they are composed in a fixed order so the paragraph
 * reads as one thought.
 */

/** Joins labels the way a person would: a, b and c. */
function list(entries: readonly ScoredAttribute[], limit = 3): string {
  const labels = entries.slice(0, limit).map((entry) => phraseFor(entry.attribute))
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/** What the buyer is protecting, said back as a search instruction. */
function protectLine(grouped: Record<Bucket, ScoredAttribute[]>): string | null {
  const protect = grouped.protect
  if (protect.length === 0) return null
  return `You were consistent about ${list(protect)}. I'd stay strict there and let the rest of the search bend around it.`
}

/**
 * The project sentence. This is the one that has to be exactly right, because
 * it is where a lazy version tells someone that paint is cheap.
 */
function projectLine(result: Result, grouped: Record<Bucket, ScoredAttribute[]>): string | null {
  switch (result.findings.project) {
    case 'decorateNotRenovate':
      return 'You are happy to give a house its personality — paper, paint, lighting, the things you can change on a weekend — and you have no interest in a build. Those are different appetites and it is worth keeping them apart: a blank room is an opportunity for you, a gut job is not.'
    case 'noProject':
      return 'You do not want your house to become your second job. That is a real search criterion, not fussiness. Condition and existing character should be filters, not things we assume you will fix later.'
    case 'bigWorkNotDetails':
      return 'You will take on real work, but you do not want to spend a year choosing finishes. Worth looking at houses where the big moves are already made well, or where the work is structural enough to hand to someone.'
    case 'makeItYours':
      return 'You are up for the work, cosmetic and structural, which genuinely widens what we can look at. It also means the lot and the location need to be right, because those are the parts your appetite cannot fix.'
    case 'selective':
      return grouped.makeItYours.length > 0
        ? 'You are somewhere in the middle on how much you want to change, which usually means it depends on the house. Worth deciding that one property at a time rather than in the abstract.'
        : null
  }
}

/** Only ever says the map is tight when the buyer said so. Never widens it for them. */
function mapLine(result: Result): string | null {
  switch (result.findings.map) {
    case 'tight':
      return 'Your location constraint is real. I would not widen the map just to manufacture more inventory — we get flexible somewhere else instead.'
    case 'open':
      return 'You are describing a way of living rather than a postcode, which means more of Los Angeles is open to you than you might think. That is the part I can help with.'
    case 'balanced':
      return null
  }
}

/** The blank-slate axis, only when the buyer leaned. */
function characterLine(result: Result): string | null {
  switch (result.findings.character) {
    case 'fromHouse':
      return 'You want the house to arrive with some character of its own rather than be a shell you fill in.'
    case 'fromYou':
      return null // already carried by the project line for this buyer
    case 'either':
      return null
  }
}

/**
 * Two to three sentences, composed in a fixed order so the paragraph reads as
 * one thought rather than a stack of findings.
 */
export function interpret(result: Result): string[] {
  if (result.answered === 0) return []

  const grouped = byBucket(result)
  const lines = [
    protectLine(grouped),
    projectLine(result, grouped),
    characterLine(result),
    mapLine(result),
  ].filter((line): line is string => line !== null)

  // Three is the ceiling. A fourth stops being judgement and starts being a
  // summary of everything they clicked.
  return lines.slice(0, 3)
}

/**
 * The one line at the top of the result. A finding, not an archetype: it says
 * what this buyer demonstrated, never what type of person they are.
 */
export function resultHeadline(result: Result): string {
  if (result.findings.project === 'noProject') return 'You do not want a project.'
  if (result.findings.project === 'decorateNotRenovate')
    return 'You will add the character. You will not do the build.'
  if (result.findings.project === 'bigWorkNotDetails') return 'You will do the work that matters.'
  if (result.findings.project === 'makeItYours') return 'You are willing to make it yours.'
  if (result.findings.map === 'tight') return 'Your map is tight, and that is fine.'
  return 'Here is what your search should protect.'
}

export function bucketHeading(bucket: Bucket): string {
  switch (bucket) {
    case 'protect':
      return 'Protect these'
    case 'getPicky':
      return 'Get picky here'
    case 'makeItYours':
      return 'Make it yours'
    case 'room':
      return 'You have room here'
  }
}

export const BUCKET_NOTES: Record<Bucket, string> = {
  protect: 'You showed this matters. Losing it is the thing you would notice.',
  getPicky:
    'Difficult, expensive or unrealistic to manufacture later — worth being stricter about than you might instinctively be.',
  makeItYours: 'Easy to change, and you seem to want to be the one who changes it.',
  room: 'Genuinely flexible. This is where a search has somewhere to give.',
}
