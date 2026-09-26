import { QUESTIONS } from './questions.ts'
import type { Answers } from './score.ts'

/**
 * Answers ↔ URL.
 *
 * The result lives in its own address rather than in memory. That buys four
 * things with no backend: it survives a refresh and the back button, it can be
 * shared, it can be sent to Danielle as a link, and the brief can go by email
 * without a form pretending to be a lead capture.
 *
 * Every separator is an RFC 3986 unreserved character, so the whole string
 * passes through a URL untouched and stays readable in an address bar.
 *
 * Unknown question ids, unknown option ids and over-long multi-selects are
 * DROPPED rather than throwing: a link that outlives a question-set edit
 * should degrade to a partial result, never to an error page.
 */

const PAIR = '.'
const SEPARATOR = '_'
const MULTI = '-'

export function encodeAnswers(answers: Answers): string {
  return QUESTIONS.filter((question) => {
    const raw = answers[question.id]
    return Array.isArray(raw) ? raw.length > 0 : Boolean(raw)
  })
    .map((question) => {
      const raw = answers[question.id]
      const picks = (Array.isArray(raw) ? raw : [raw]) as string[]
      return `${question.id}${PAIR}${picks.slice(0, question.choose ?? 1).join(MULTI)}`
    })
    .join(SEPARATOR)
}

export function decodeAnswers(encoded: string | null | undefined): Answers {
  if (!encoded) return {}

  const answers: Record<string, string | string[]> = {}
  for (const chunk of encoded.split(SEPARATOR)) {
    const index = chunk.indexOf(PAIR)
    if (index <= 0) continue

    const question = QUESTIONS.find((candidate) => candidate.id === chunk.slice(0, index))
    if (!question) continue

    const limit = question.choose ?? 1
    const picks = chunk
      .slice(index + 1)
      .split(MULTI)
      .filter((pick) => question.options.some((option) => option.id === pick))
      .slice(0, limit)

    if (picks.length === 0) continue
    answers[question.id] = limit === 1 ? picks[0] : picks
  }
  return answers
}
