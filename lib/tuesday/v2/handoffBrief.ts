import { contactEmail } from '../../config.ts'
import type { StructuredBrief } from './brief.ts'
import type { Handoff } from './handoff.ts'
import { compose, type Composed, type SectionId } from './render/index.ts'

/**
 * The compact brief, as one source for the clipboard and for the email.
 *
 * ONE SERIALIZER, TWO DESTINATIONS. The clipboard and the mail composer are
 * two renderings of the same blocks. They can differ in framing and in what a
 * mailto's length ceiling forces out, and they can never differ about what
 * this search is, because neither of them decides anything.
 *
 * NOT A THIRD INTERPRETATION. Every sentence comes from the frozen renderer's
 * `compose`, in its buyer register. This file chooses which of those sections
 * travel and in what order; it writes no finding of its own.
 */

export const BRIEF_SUBJECT = 'My Tuesday Test search brief'

/**
 * How much of a mailto is safe.
 *
 * Windows caps a mailto at roughly 2048 characters and truncates silently past
 * it, which would cut a brief off mid-sentence with no warning. The ceiling is
 * measured on the ENCODED url, because that is the thing with the limit: a
 * body of plain prose roughly doubles once spaces and newlines are escaped.
 */
export const MAILTO_LIMIT = 1900

/**
 * What travels, most useful first.
 *
 * This is also the drop order, read backwards: when the url will not fit, the
 * least load-bearing block goes first. The buyer's own words are dropped
 * before the brief is, because a brief with a hole in it is worse than one
 * without the postscript, but they are dropped before nothing else.
 */
const ORDER: readonly SectionId[] = [
  'facts',
  'filter',
  'flex',
  'noLever',
  'leverUnknown',
  'secondLook',
  'showing',
  'unresolved',
  'clarify',
]

const MAX_SHOWING = 4
const MIN_SHOWING = 2

/** What each block is called in something a person reads. */
const HEADING: Partial<Record<SectionId, string>> = {
  facts: 'The search details I gave:',
  filter: 'Has to have:',
  flex: 'Where I can move:',
  noLever: 'Where I cannot move:',
  leverUnknown: 'Still working out:',
  secondLook: 'Worth a second look:',
  showing: 'Worth checking when we see something:',
  unresolved: 'Still to settle:',
  clarify: 'One thing to clarify:',
}

export interface BriefBlock {
  heading: string | null
  lines: readonly string[]
}

export interface BriefOptions {
  resultUrl?: string
  /** How many showing checks to carry. Reduced only to fit a mailto. */
  showingLimit?: number
  /** False drops the buyer's own closing note. Only to fit a mailto. */
  includeNote?: boolean
  /** Sections to leave out. Only to fit a mailto. */
  omit?: readonly SectionId[]
}

/**
 * The buyer's own closing words, pulled out of the facts block.
 *
 * `compose` files it under the search details as another Note line, which is
 * right for a reference list and wrong for something a person reads: it should
 * land at the end, in their voice, not between the bathroom count and the
 * parking.
 */
const noteLine = (handoff: Handoff | null) =>
  handoff?.buyerNote ? `Note: ${handoff.buyerNote}` : null

export function briefBlocks(
  brief: StructuredBrief,
  options: BriefOptions = {},
): BriefBlock[] {
  const composed: Composed = compose(brief)
  const omit = new Set(options.omit ?? [])
  const blocks: BriefBlock[] = []

  blocks.push({ heading: null, lines: composed.snapshot.map((line) => line.buyer) })

  const closing = noteLine(brief.searchFacts)
  for (const id of ORDER) {
    if (omit.has(id)) continue
    const section = composed.sections.find((entry) => entry.id === id)
    if (!section) continue

    let lines = section.lines.map((line) => line.buyer)
    if (id === 'facts' && closing) lines = lines.filter((line) => line !== closing)
    if (id === 'showing') lines = lines.slice(0, options.showingLimit ?? MAX_SHOWING)
    // A second look is one instruction, not a catalogue.
    if (id === 'secondLook') lines = lines.slice(0, 1)
    if (id === 'unresolved') lines = lines.slice(0, 1)
    if (lines.length === 0) continue

    blocks.push({ heading: HEADING[id] ?? null, lines })
  }

  if (options.resultUrl) {
    blocks.push({ heading: 'My full result:', lines: [options.resultUrl] })
  }
  if (closing && options.includeNote !== false) {
    blocks.push({ heading: 'A few other things:', lines: [brief.searchFacts!.buyerNote!] })
  }
  return blocks
}

/** Plain text, because it is going to a clipboard or a mail composer. */
export function asText(blocks: readonly BriefBlock[]): string {
  return blocks
    .map((block) => (block.heading ? [block.heading, ...block.lines] : block.lines).join('\n'))
    .join('\n\n')
}

/** What the clipboard gets. */
export function clipboardBrief(brief: StructuredBrief, resultUrl?: string): string {
  return asText(briefBlocks(brief, { resultUrl }))
}

const GREETING = [
  'Hi Danielle,',
  '',
  'I took the Tuesday Test. Here is the search brief it gave me:',
  '',
]

export function emailBody(brief: StructuredBrief, options: BriefOptions = {}): string {
  return [...GREETING, asText(briefBlocks(brief, options))].join('\n')
}

export function mailtoHref(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  // URLSearchParams encodes a space as `+`, which a mail composer shows
  // literally in the body.
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`
}

export type MailtoResult =
  | { kind: 'ready'; href: string; body: string; trimmed: readonly SectionId[]; keptNote: boolean }
  /** Nothing safe could be built. The caller copies instead and says so. */
  | { kind: 'tooLong'; body: string }

/**
 * A mailto that will survive the trip, or an honest refusal.
 *
 * Trimming walks the drop order and never silently removes a block: what came
 * out is reported, so the page can tell the buyer their note went to the
 * clipboard instead of quietly vanishing between here and Danielle's inbox.
 */
export function buildMailto(
  brief: StructuredBrief,
  resultUrl: string,
  to: string = contactEmail,
): MailtoResult {
  /*
   * The drop order, least load-bearing first.
   *
   * The buyer's own words go before any of the brief does, because the brief
   * is the part that cannot be reconstructed from the link. Then the open
   * question, then the second look, then the showing checks thinned and
   * finally dropped, and the discrepancy last of all because it is a live
   * conflict rather than an observation.
   *
   * The result link is never dropped. It is the one line that can rebuild
   * everything else, so trading it away to keep a sentence would be the wrong
   * way round.
   */
  const attempts: BriefOptions[] = [
    { resultUrl },
    { resultUrl, includeNote: false },
    { resultUrl, includeNote: false, omit: ['unresolved'] },
    { resultUrl, includeNote: false, omit: ['unresolved', 'secondLook'] },
    { resultUrl, includeNote: false, omit: ['unresolved', 'secondLook'], showingLimit: MIN_SHOWING },
    { resultUrl, includeNote: false, omit: ['unresolved', 'secondLook'], showingLimit: 0 },
    { resultUrl, includeNote: false, omit: ['unresolved', 'secondLook', 'clarify'], showingLimit: 0 },
  ]

  for (const options of attempts) {
    const body = emailBody(brief, options)
    const href = mailtoHref(to, BRIEF_SUBJECT, body)
    if (href.length <= MAILTO_LIMIT) {
      return {
        kind: 'ready',
        href,
        body,
        trimmed: options.omit ?? [],
        keptNote: options.includeNote !== false,
      }
    }
  }
  // Even the shortest safe version will not fit, so nothing is opened and the
  // full brief goes to the clipboard instead.
  return { kind: 'tooLong', body: emailBody(brief, { resultUrl }) }
}
