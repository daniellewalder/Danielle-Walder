import { contactEmail } from '../config.ts'
import { mapSummary, projectSummary, resultHeadline } from './interpret.ts'
import { dayOneItems } from './interpret.ts'
import { byState, type Result } from './score.ts'

/**
 * The search brief, as an email the reader sends.
 *
 * There is no form backend, and inventing one is not an option. So the brief
 * is composed here and handed to whatever mail client the reader already has:
 * nothing is submitted, nothing is stored, and no confirmation is faked. The
 * reader presses send.
 *
 * This is the payoff of the whole test. What arrives in Danielle's inbox is
 * not "someone filled in a form" but a buyer who has already worked out what
 * they are protecting, said so in their own words, and left a space to add
 * what the test could not ask.
 */

export const BRIEF_SUBJECT = 'My Tuesday Test search brief'

const BULLET = '•'

/**
 * How many not-established items the email carries.
 *
 * Windows caps a mailto at roughly 2048 characters and truncates silently
 * past it, which would cut the brief off mid-sentence with no warning. A full
 * checklist ran a completed test to about 1950. Ten keeps real headroom, and
 * the count of what is left over is still stated so nothing is hidden.
 */
const MAX_UNKNOWNS = 10

function section(heading: string, lines: string[]): string[] {
  if (lines.length === 0) return []
  return [heading, ...lines, '']
}

/**
 * Plain text, because it is going into a mail composer. Kept pure so the exact
 * wording can be tested without a browser.
 */
export function briefBody(result: Result, resultUrl: string): string {
  const grouped = byState(result)
  const bullets = (items: { attribute: { label: string } }[]) =>
    items.map((entry) => `${BULLET} ${entry.attribute.label}`)

  const map = mapSummary(result)

  const lines = [
    'Hi Danielle,',
    '',
    `I took the Tuesday Test. Here's where I landed:`,
    '',
    resultHeadline(result),
    '',
    ...section('Protect', bullets(grouped.protect)),
    ...section('My map', map ? [map] : []),
    ...section(
      `What I'll change`,
      projectSummary(result).map((row) => `${row.label}: ${row.value}`),
    ),
    ...section('Look closely', bullets(grouped.scrutinize)),
    ...section('Must work on arrival', bullets([...dayOneItems(result)])),
    /*
     * Danielle asked to keep this: it is the next-conversation checklist, and
     * it is the difference between "we did not ask" and "they are flexible".
     *
     * Bulleted rather than comma-separated because several labels contain
     * commas of their own ("Laundry, storage and pantry"), which makes a
     * comma run unreadable. It costs almost nothing in length and it is
     * actually usable as a checklist.
     */
    ...section('Not established yet', [
      ...result.unknowns.slice(0, MAX_UNKNOWNS).map((attribute) => `${BULLET} ${attribute.label}`),
      ...(result.unknowns.length > MAX_UNKNOWNS
        ? [`(plus ${result.unknowns.length - MAX_UNKNOWNS} more the test did not cover)`]
        : []),
    ]),
    `My full result: ${resultUrl}`,
    '',
    'A few other things about my search:',
    '',
  ]

  return lines.join('\n')
}

/**
 * `mailto:` with the brief in the body.
 *
 * URLSearchParams encodes spaces as "+", which mail composers show literally,
 * so they are put back. Same rule as the showing inquiry's quick send.
 */
export function briefMailto(result: Result, resultUrl: string, to: string = contactEmail): string {
  const params = new URLSearchParams({
    subject: BRIEF_SUBJECT,
    body: briefBody(result, resultUrl),
  })
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`
}
