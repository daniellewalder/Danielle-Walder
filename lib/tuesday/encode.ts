import { QUESTIONS } from './questions.ts'
import type { Answers } from './score.ts'

/**
 * Answers ↔ URL.
 *
 * The result lives in its own address rather than in memory. That buys four
 * things at once with no backend: it survives a refresh and the back button,
 * it can be shared, it can be sent to Danielle as a link, and the brief can go
 * by email without a form pretending to be a lead capture.
 *
 * The encoding is positional and deliberately legible — `q=a3b1c2` style would
 * be shorter but unreadable, and this one can be eyeballed in a URL bar when
 * something looks wrong. Unknown question or option ids are DROPPED rather
 * than throwing: a link outliving a question-set edit should degrade to a
 * partial result, never to an error page.
 */

const PAIR = '.'
const SEPARATOR = '_'

export function encodeAnswers(answers: Answers): string {
  return QUESTIONS.filter((question) => answers[question.id])
    .map((question) => `${question.id}${PAIR}${answers[question.id]}`)
    .join(SEPARATOR)
}

export function decodeAnswers(encoded: string | null | undefined): Answers {
  if (!encoded) return {}

  const answers: Record<string, string> = {}
  for (const chunk of encoded.split(SEPARATOR)) {
    const index = chunk.indexOf(PAIR)
    if (index <= 0) continue

    const questionId = chunk.slice(0, index)
    const optionId = chunk.slice(index + 1)

    const question = QUESTIONS.find((candidate) => candidate.id === questionId)
    if (!question) continue
    if (!question.options.some((option) => option.id === optionId)) continue

    answers[questionId] = optionId
  }
  return answers
}
