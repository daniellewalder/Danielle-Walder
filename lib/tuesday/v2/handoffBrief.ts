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
 * The reading order. NOT the drop order: see `DROPPABLE` below.
 *
 * WHAT DANIELLE CAN ACT ON, IN THE ORDER SHE CAN ACT ON IT. The brief used to
 * carry four generated sections and leave the rest on the page, so an email
 * well inside its budget arrived without the buyer's exclusions, their
 * operational requirements or the forced choice the test had just resolved.
 * The budget decides what travels now, not this list: everything here is
 * included while it fits, least useful given up first.
 */
const ORDER: readonly SectionId[] = [
  'facts',
  'filter',
  'flex',
  'noLever',
  'leverUnknown',
  'tradeoff',
  'program',
  'skip',
  'showing',
  'noSubstitute',
  'unresolved',
  'secondLook',
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
  tradeoff: 'The one to watch:',
  program: 'Practical list:',
  skip: 'Probably not worth the time:',
  secondLook: 'Worth a second look:',
  showing: 'Worth checking when we see something:',
  noSubstitute: 'Not the same thing:',
  unresolved: 'Still to settle:',
  clarify: 'One thing to clarify:',
}

export interface BriefBlock {
  heading: string | null
  lines: readonly string[]
}

/**
 * WHAT MAY NEVER BE DROPPED TO FIT A MAILTO.
 *
 * The result link reconstructs everything the quiz derived. It reconstructs
 * none of what the buyer typed: not the budget, not the boundary they asked
 * for, not the destinations, not the note they sat and wrote. So compaction
 * takes the derived analysis and leaves the buyer's own inputs alone, and a
 * discrepancy counts as theirs because it only exists when their search facts
 * disagree with their answers.
 *
 * Someone who carefully fills in "anything else Danielle should know" and then
 * finds it missing from the draft has been failed by this code, and saying so
 * in a notice underneath does not fix it.
 */
const PROTECTED: readonly SectionId[] = ['facts', 'clarify']

/** Derived analysis, in the order it is given up. Least useful first. */
const DROPPABLE: readonly SectionId[] = [
  'secondLook',
  'unresolved',
  'noSubstitute',
  'showing',
  'skip',
  'program',
  'tradeoff',
  'flex',
  'noLever',
  'leverUnknown',
  'filter',
]

export interface BriefOptions {
  resultUrl?: string
  /** How many showing checks to carry. Reduced only to fit a mailto. */
  showingLimit?: number
  /** Derived sections to leave out. Only to fit a mailto, never buyer input. */
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
    // One false equivalence is a warning. Three is a lecture.
    if (id === 'noSubstitute') lines = lines.slice(0, 1)
    if (lines.length === 0) continue

    blocks.push({ heading: HEADING[id] ?? null, lines })
  }

  if (options.resultUrl) {
    blocks.push({ heading: 'My full result:', lines: [options.resultUrl] })
  }
  // The buyer's own closing words. Never conditional: there is no length that
  // makes it acceptable to drop what someone wrote for Danielle to read.
  if (closing) {
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
  | { kind: 'ready'; href: string; body: string; trimmed: readonly SectionId[] }
  /**
   * The buyer's own inputs will not fit a safe mailto, so no draft is opened.
   * The caller copies the whole brief and says that is what happened.
   */
  | { kind: 'tooLong'; body: string }

/**
 * A mailto that will survive the trip, or an honest refusal.
 *
 * Compaction gives up derived analysis and nothing else. When even the minimum
 * (the greeting, every search fact they entered, their note, a clarification
 * if there is one, the snapshot and the link) will not fit, no draft opens:
 * a partial draft would quietly lose something they typed, and the link cannot
 * put it back.
 */
export function buildMailto(
  brief: StructuredBrief,
  resultUrl: string,
  to: string = contactEmail,
): MailtoResult {
  const attempts: BriefOptions[] = [{ resultUrl }]
  // Each step gives up one more piece of the generated analysis, in order.
  const omit: SectionId[] = []
  for (const section of DROPPABLE) {
    if (section === 'showing') {
      attempts.push({ resultUrl, omit: [...omit], showingLimit: MIN_SHOWING })
      attempts.push({ resultUrl, omit: [...omit], showingLimit: 0 })
      continue
    }
    omit.push(section)
    attempts.push({ resultUrl, omit: [...omit], showingLimit: 0 })
  }

  for (const options of attempts) {
    const body = emailBody(brief, options)
    const href = mailtoHref(to, BRIEF_SUBJECT, body)
    if (href.length <= MAILTO_LIMIT) {
      return { kind: 'ready', href, body, trimmed: options.omit ?? [] }
    }
  }
  // Not even the minimum fits, so nothing is opened and the whole brief goes
  // to the clipboard with its buyer-entered content intact.
  return { kind: 'tooLong', body: emailBody(brief, { resultUrl }) }
}
