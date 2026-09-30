/**
 * What the buyer actually answered.
 *
 * THIS IS A RECORD, NOT A RECIPE. It stores what was asked and what was
 * chosen, never instructions to rebuild the quiz later. The tradeoff is the
 * reason: question eight is selected at run time from earlier answers, so
 * storing only "they chose light" would mean a future change to the selection
 * algorithm silently rewrites what an old result said. The pair that was
 * actually put on screen is persisted with the answer.
 *
 * The same principle governs ordered picks, qualifiers and the conditional
 * follow-up. Everything the result depends on is written down.
 */

export const INSTRUMENT_VERSION = 2

/** One ordered selection, with the qualifier if the option needed one. */
export interface Pick {
  option: string
  /** Present only when the chosen option is bundled. */
  qualifier?: string
}

/**
 * The tradeoff, exactly as it was presented.
 *
 * `winner` is null when the buyer declined to choose, which is a real answer
 * and establishes no ordering at all.
 */
export interface TradeoffAnswer {
  /** The two concepts put on screen, in the order they were shown. */
  pair: readonly [string, string]
  winner: string | null
  /** Which rule family produced this pair, recorded so it is never re-derived. */
  family: string
}

export interface V2Answers {
  version: typeof INSTRUMENT_VERSION
  tuesday?: string
  /** Up to two, in the order chosen. Both are full dealbreakers. */
  dealbreaker?: readonly Pick[]
  /** Up to two, in the order chosen. First is stronger than second. */
  daily?: readonly Pick[]
  architecture?: string
  personalization?: string
  project?: string
  location?: string
  tradeoff?: TradeoffAnswer
  /** The "depends on what" follow-up. */
  depends?: string
  /** The contradiction follow-up. */
  clarify?: string
}

export const EMPTY: V2Answers = { version: INSTRUMENT_VERSION }

/** The questions that carry an ordered multi-select. */
export const ORDERED_QUESTIONS: readonly (keyof V2Answers)[] = ['dealbreaker', 'daily']

export function picksFor(answers: V2Answers, question: 'dealbreaker' | 'daily'): readonly Pick[] {
  return answers[question] ?? []
}

/** Every qualifier the buyer supplied, keyed by the attribute it belongs to. */
export function qualifiersIn(
  answers: V2Answers,
  optionToAttribute: (question: string, option: string) => string | undefined,
): Readonly<Record<string, string>> {
  const found: Record<string, string> = {}
  for (const question of ['dealbreaker', 'daily'] as const) {
    for (const pick of picksFor(answers, question)) {
      if (!pick.qualifier) continue
      const attribute = optionToAttribute(question, pick.option)
      if (attribute) found[attribute] = pick.qualifier
    }
  }
  return found
}

/** How many questions produced an answer. Used for "is this worth reading yet". */
export function answeredCount(answers: V2Answers): number {
  let total = 0
  if (answers.tuesday) total += 1
  total += picksFor(answers, 'dealbreaker').length
  total += picksFor(answers, 'daily').length
  if (answers.architecture) total += 1
  if (answers.personalization) total += 1
  if (answers.project) total += 1
  if (answers.location) total += 1
  if (answers.tradeoff) total += 1
  if (answers.depends) total += 1
  if (answers.clarify) total += 1
  return total
}
