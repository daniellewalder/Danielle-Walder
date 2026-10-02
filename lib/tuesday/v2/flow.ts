import { QUALIFIERS, type StanceId } from './model.ts'
import { QUESTIONS, questionById } from './questions.ts'
import { score, sizeRouteApplies, type Result } from './score.ts'
import { optionAttribute } from './score.ts'
import {
  candidatesFrom, mapIsCandidate, selectPair, FALLBACKS,
  type Preconditions, type SelectedPair,
} from './tradeoff.ts'
import { picksFor, type Pick, type V2Answers } from './answers.ts'

/**
 * The flow controller.
 *
 * THE ENGINE DECIDES, THE UI RENDERS. Question eligibility, conditional
 * eligibility and the adaptive pair all live in the frozen model; this is the
 * thinnest possible adapter that lets a component ask "what next" without
 * re-deciding any of it. Nothing here scores, weighs or interprets anything.
 *
 * It exists because a React component that works out for itself whether the
 * size-route follow-up applies is a second copy of the rules, and the two
 * copies will disagree the first time one of them is edited.
 */

/** The seven core questions, in the order they are asked. */
export const CORE: readonly string[] = [
  'tuesday',
  'dealbreaker',
  'daily',
  'architecture',
  'personalization',
  'project',
  'location',
]

/** The two bundled questions, whose picks may need a "which part" tap. */
const BUNDLED = ['dealbreaker', 'daily'] as const
export type BundledQuestion = (typeof BUNDLED)[number]

export type Step =
  | { kind: 'question'; id: string }
  /** One screen for every bundled pick in that question that needs a part. */
  | { kind: 'qualifier'; question: BundledQuestion }
  | { kind: 'tradeoff' }

/** A bundled pick waiting on its "which part" answer. */
export interface QualifierNeed {
  option: string
  /** The attribute the qualifier belongs to. */
  attribute: string
  /** The option's own label, so the screen can name what it is asking about. */
  label: string
  choices: readonly { id: string; label: string }[]
  chosen: string | null
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export function qualifierNeeds(
  answers: V2Answers,
  question: BundledQuestion,
): QualifierNeed[] {
  const needs: QualifierNeed[] = []
  for (const pick of picksFor(answers, question).slice(0, 2)) {
    const option = questionById(question)?.options.find((entry) => entry.id === pick.option)
    if (!option?.qualifies) continue
    needs.push({
      option: option.id,
      attribute: option.qualifies,
      label: option.label,
      choices: (QUALIFIERS[option.qualifies] ?? []).map((entry) => ({ id: entry.id, label: entry.label })),
      chosen: pick.qualifier ?? null,
    })
  }
  return needs
}

const answered = (answers: V2Answers, id: string): boolean => {
  if (id === 'dealbreaker' || id === 'daily') return picksFor(answers, id).length > 0
  return Boolean((answers as unknown as Record<string, unknown>)[id])
}

/**
 * Every step this buyer will actually see, given what they have said so far.
 *
 * It can grow: choosing a bundled option adds a "which part" screen, and
 * answering the project question can add a follow-up. That is exactly why the
 * progress treatment shows a position and no denominator.
 */
export function stepsFor(answers: V2Answers): Step[] {
  const steps: Step[] = []
  for (const id of CORE) {
    steps.push({ kind: 'question', id })
    for (const bundled of BUNDLED) {
      if (id === bundled && qualifierNeeds(answers, bundled).length > 0) {
        steps.push({ kind: 'qualifier', question: bundled })
      }
    }
  }

  // Nothing past the core is decidable until the core is answered, and the
  // adaptive pair needs the evidence that produces it.
  if (!CORE.every((id) => answered(answers, id))) return steps
  steps.push({ kind: 'tradeoff' })

  const result = score(answers)
  if (answers.project === 'depends') steps.push({ kind: 'question', id: 'depends' })
  if (sizeRouteApplies(protectedIn(result), result.stances)) {
    steps.push({ kind: 'question', id: 'sizeRoute' })
  }
  return steps
}

const protectedIn = (result: Result): ReadonlySet<string> =>
  new Set(result.attributes.filter((entry) => entry.state === 'protect').map((entry) => entry.attribute.id))

const satisfied = (answers: V2Answers, step: Step): boolean => {
  if (step.kind === 'question') return answered(answers, step.id)
  if (step.kind === 'tradeoff') return Boolean(answers.tradeoff)
  return qualifierNeeds(answers, step.question).every((need) => need.chosen !== null)
}

/** The first step still waiting on an answer. Null means the test is done. */
export function nextStep(answers: V2Answers): Step | null {
  return stepsFor(answers).find((step) => !satisfied(answers, step)) ?? null
}

export function isComplete(answers: V2Answers): boolean {
  return nextStep(answers) === null
}

/** Where a step sits in the path, for an honest position readout. */
export function positionOf(answers: V2Answers, step: Step): number {
  const index = stepsFor(answers).findIndex((entry) => stepKey(entry) === stepKey(step))
  return index === -1 ? 0 : index
}

/**
 * The screen before this one on the current path.
 *
 * Back moves through the PATH, not through history. A history entry carries
 * the payload as it was when that screen was last touched, so stepping back
 * through history silently discards everything answered since. Going back to
 * change one answer should leave the rest alone and let reconciliation decide
 * what actually went stale.
 */
export function previousStep(answers: V2Answers, step: Step): Step | null {
  const steps = stepsFor(answers)
  const index = steps.findIndex((entry) => stepKey(entry) === stepKey(step))
  return index > 0 ? steps[index - 1] : null
}

export function stepKey(step: Step): string {
  if (step.kind === 'question') return step.id
  if (step.kind === 'tradeoff') return 'tradeoff'
  return `part-${step.question}`
}

export function stepFromKey(key: string | null | undefined): Step | null {
  if (!key) return null
  if (key === 'tradeoff') return { kind: 'tradeoff' }
  for (const bundled of BUNDLED) if (key === `part-${bundled}`) return { kind: 'qualifier', question: bundled }
  return questionById(key) ? { kind: 'question', id: key } : null
}

// ---------------------------------------------------------------------------
// The adaptive pair
// ---------------------------------------------------------------------------

function preconditionsFor(result: Result): Preconditions {
  return {
    map: result.map,
    projectIsMajor: result.stances.has('structuralWorkOkay'),
    wantsNeutral: result.stances.has('wantsNeutral'),
    qualified: new Set(
      result.attributes.filter((entry) => entry.qualifier).map((entry) => entry.attribute.id),
    ),
  }
}

const evidenceOf = (result: Result) =>
  new Map(result.attributes.map((entry) => [entry.attribute.id, entry.evidence]))

/** What the engine would ask, from the current evidence. */
export function selectTradeoff(answers: V2Answers): SelectedPair {
  const result = score(answers)
  return selectPair(candidatesFrom(evidenceOf(result), result.map), preconditionsFor(result))
}

/**
 * Whether a pair the buyer has already been shown still stands.
 *
 * NOT "is it the pair we would pick now". Going back and changing something
 * the pair does not depend on must leave the question they already answered
 * alone; giving them a different forced choice because a screen remounted
 * would be rewriting a decision they made.
 *
 * The check runs the frozen selector over a candidate set containing only the
 * two recorded concepts, so eligibility, the allowed-pair matrix and the
 * preconditions are all still the model's own and not restated here.
 */
export function tradeoffStillValid(
  answers: V2Answers,
  pair: readonly [string, string],
): boolean {
  const result = score(answers)
  const pre = preconditionsFor(result)
  const candidates = candidatesFrom(evidenceOf(result), result.map)
  const sorted = [...pair].sort()

  const full = selectPair(candidates, pre)
  if (full.family.startsWith('fallback')) {
    // A fallback is only ever presented when nothing else qualifies, so it
    // stands exactly as long as it is still what the engine would reach for.
    const fallback = [...(mapIsCandidate(pre.map) ? FALLBACKS.movable : FALLBACKS.fixed).pair].sort()
    return sorted[0] === fallback[0] && sorted[1] === fallback[1]
  }

  const subset = candidates.filter((candidate) => sorted.includes(candidate.concept))
  if (subset.length !== 2) return false
  const selected = selectPair(subset, pre)
  if (selected.family.startsWith('fallback')) return false
  return selected.pair[0] === sorted[0] && selected.pair[1] === sorted[1]
}

/**
 * The pair to put on screen: the one they already saw when it still stands,
 * otherwise the one the current evidence produces.
 */
export function tradeoffFor(answers: V2Answers): SelectedPair {
  const recorded = answers.tradeoff
  if (recorded && tradeoffStillValid(answers, recorded.pair)) {
    return { pair: recorded.pair, family: recorded.family }
  }
  return selectTradeoff(answers)
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

/**
 * Drop every answer the current evidence can no longer reach.
 *
 * Called after any change to an earlier answer. Four things can go stale:
 *
 *   a qualifier that does not belong to the option carrying it
 *   the "depends on what" follow-up, once the project answer is not `depends`
 *   the size-route follow-up, once size or structural work no longer qualify
 *   the forced choice, once its pair no longer stands
 *
 * Nothing is ever replaced with a default. A stale answer is removed, and the
 * buyer is asked again if the question is still reachable.
 */
export function reconcile(answers: V2Answers): V2Answers {
  const cleaned: V2Answers = { ...answers }

  for (const question of BUNDLED) {
    const picks = picksFor(answers, question)
    if (picks.length === 0) continue
    const fixed: Pick[] = picks.map((pick) => {
      const option = questionById(question)?.options.find((entry) => entry.id === pick.option)
      const allowed = option?.qualifies ? (QUALIFIERS[option.qualifies] ?? []) : []
      const keep = pick.qualifier && allowed.some((entry) => entry.id === pick.qualifier)
      return keep ? pick : { option: pick.option }
    })
    cleaned[question] = fixed
  }

  if (cleaned.project !== 'depends') delete cleaned.depends

  const result = score(cleaned)
  if (!sizeRouteApplies(protectedIn(result), result.stances)) delete cleaned.sizeRoute

  if (cleaned.tradeoff && !tradeoffStillValid(cleaned, cleaned.tradeoff.pair)) delete cleaned.tradeoff

  return cleaned
}

/**
 * Record an answer to one step, then reconcile.
 *
 * The single place the UI mutates answers, so no component can set a field
 * without the downstream cleanup running.
 */
export function answerQuestion(answers: V2Answers, id: string, value: string): V2Answers {
  // An option that does not belong to the question is ignored rather than
  // written through. A bad value here would sit in the answers looking
  // answered while the engine reads it as nothing.
  const question = questionById(id)
  if (!question?.options.some((option) => option.id === value)) return answers
  return reconcile({ ...answers, [id]: value } as V2Answers)
}

/**
 * Toggle one option in an ordered multi-select.
 *
 * First tap is rank one, second is rank two, tapping a chosen option removes
 * it, and a third tap is ignored rather than silently evicting rank one. An
 * exclusive option clears the rest, and choosing anything else clears it.
 */
export function togglePick(
  answers: V2Answers,
  question: BundledQuestion,
  option: string,
  exclusive: string,
): V2Answers {
  const picks = picksFor(answers, question)
  const already = picks.some((pick) => pick.option === option)
  let next: Pick[]

  if (already) next = picks.filter((pick) => pick.option !== option)
  else if (option === exclusive) next = [{ option }]
  else {
    const without = picks.filter((pick) => pick.option !== exclusive)
    next = without.length >= 2 ? without : [...without, { option }]
  }
  return reconcile({ ...answers, [question]: next } as V2Answers)
}

export function setQualifier(
  answers: V2Answers,
  question: BundledQuestion,
  option: string,
  qualifier: string,
): V2Answers {
  const picks = picksFor(answers, question).map((pick) =>
    pick.option === option ? { option, qualifier } : pick,
  )
  return reconcile({ ...answers, [question]: picks } as V2Answers)
}

export function setTradeoff(
  answers: V2Answers,
  pair: readonly [string, string],
  winner: string | null,
  family: string,
): V2Answers {
  return reconcile({ ...answers, tradeoff: { pair, winner, family } })
}

/** Which option in a bundled question clears the others. */
export const EXCLUSIVE: Readonly<Record<BundledQuestion, string>> = {
  dealbreaker: 'none',
  daily: 'unsure',
}

export { QUESTIONS, questionById, optionAttribute, type StanceId }
