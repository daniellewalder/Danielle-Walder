import type { StructuredBrief } from '../brief.ts'
import { compose, MAX_SHOWING_BUYER, type Composed, type SectionId } from './compose.ts'

/**
 * The two things a person reads.
 *
 * Both are serialized from one `Composed`, so the agent brief and the buyer
 * copy can never disagree about what this search is. The buyer copy is a
 * shorter selection in the first person; it is not a second interpretation and
 * it never contains a conclusion the agent brief does not.
 */

export interface RenderOptions {
  /**
   * The link back to the full result.
   *
   * Supplied by the caller, because the origin is a runtime fact. Nothing here
   * guesses a hostname.
   */
  resultUrl?: string
}

/** Sections the buyer copy carries, in order. Everything else is agent-only. */
const BUYER_SECTIONS: readonly SectionId[] = [
  'facts',
  'filter',
  'flex',
  'noLever',
  'leverUnknown',
  'showing',
  'unresolved',
]

const BUYER_HEADING: Readonly<Partial<Record<SectionId, string>>> = {
  facts: 'What I am looking for',
  filter: 'Has to have',
  flex: 'Where I have room',
  noLever: 'Where I do not have room',
  leverUnknown: 'Still working out',
  showing: 'Worth checking when we see something',
  unresolved: 'One thing I have not settled',
}

export function renderAgentBrief(brief: StructuredBrief, options: RenderOptions = {}): string {
  const composed = compose(brief)
  const out: string[] = []

  out.push('SEARCH SNAPSHOT')
  out.push(composed.snapshot.map((entry) => entry.agent).join(' '))

  for (const section of composed.sections) {
    if (section.id === 'facts') {
      out.push('', section.heading.toUpperCase())
      for (const entry of section.lines) out.push(entry.agent)
      continue
    }
    out.push('', section.heading.toUpperCase())
    for (const entry of section.lines) out.push(`- ${entry.agent}`)
  }

  if (options.resultUrl) out.push('', `Full result: ${options.resultUrl}`)
  return out.join('\n')
}

export function renderBuyerCopy(brief: StructuredBrief, options: RenderOptions = {}): string {
  const composed = compose(brief)
  const out: string[] = []

  out.push(composed.snapshot.map((entry) => entry.buyer).join(' '))

  for (const id of BUYER_SECTIONS) {
    const section = composed.sections.find((entry) => entry.id === id)
    if (!section) continue
    const lines = id === 'showing' ? section.lines.slice(0, MAX_SHOWING_BUYER) : section.lines
    out.push('', BUYER_HEADING[id] ?? section.heading)
    for (const entry of lines) {
      out.push(id === 'facts' ? entry.buyer : `- ${entry.buyer}`)
    }
  }

  if (options.resultUrl) out.push('', `My full result: ${options.resultUrl}`)
  return out.join('\n')
}

export { compose }
export type { Composed, SectionId }
