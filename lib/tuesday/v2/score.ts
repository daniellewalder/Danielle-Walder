import {
  ATTRIBUTES,
  EMPTY_EVIDENCE,
  confidenceOf,
  isRepeated,
  stateOf,
  type Attribute,
  type AttributeState,
  type Confidence,
  type Evidence,
  type MapConstraint,
  type ScaleId,
  type SizeRoute,
  type StanceId,
  sizeRouteOf,
} from './model.ts'
import { QUESTIONS, questionById, type FollowUp } from './questions.ts'
import { picksFor, type V2Answers } from './answers.ts'

export type Scales = Record<ScaleId, number>

export interface ReadAttribute {
  attribute: Attribute
  evidence: Evidence
  state: AttributeState
  confidence: Confidence
  /** Two DIFFERENT questions touched it. Gates every recurrence phrase. */
  repeated: boolean
  /** The qualifier the buyer chose, when the attribute is bundled. */
  qualifier: string | null
}

export interface Result {
  version: 2
  scales: Scales
  attributes: readonly ReadAttribute[]
  unknowns: readonly Attribute[]
  stances: ReadonlySet<StanceId>
  map: MapConstraint | null
  /** Declined the forced choice. Narrow criteria, not indecision. */
  declinedTradeoff: boolean
  answered: number
  answeredQuestionIds: readonly string[]
  /** Which follow-up, if any, should be put on screen. At most one. */
  needs: FollowUp | null
  /**
   * HOW the protected size may be satisfied, once the follow-up settles it.
   *
   * Null means the question was never put, or never answered. It is never a
   * default: assuming `existingOnly` from silence would eliminate listings the
   * buyer never ruled out, and assuming `additionOkay` would keep candidates
   * they would reject on sight.
   */
  sizeRoute: SizeRoute | null
  /** The tradeoff exactly as presented, echoed so the brief never re-derives it. */
  tradeoff: { pair: readonly [string, string]; winner: string | null; family: string } | null
}

export const HIGH = 0.62
export const LOW = 0.38

// ---------------------------------------------------------------------------
// Scale normalisation
// ---------------------------------------------------------------------------

/**
 * The range achievable across the questions ACTUALLY ANSWERED.
 *
 * Normalising against the whole set dilutes every signal, so one emphatic
 * answer reads as the middle and the model concludes nothing.
 */
export function achievableRange(
  scale: ScaleId,
  answered: ReadonlySet<string>,
): { min: number; max: number } {
  let min = 0
  let max = 0
  for (const question of QUESTIONS) {
    if (!answered.has(question.id)) continue
    const deltas = question.options.map((option) => option.scales?.[scale] ?? 0)
    const limit = question.choose ?? 1
    const ascending = [...deltas].sort((a, b) => a - b)
    min += ascending.slice(0, limit).reduce((total, value) => total + Math.min(value, 0), 0)
    max += ascending.slice(-limit).reduce((total, value) => total + Math.max(value, 0), 0)
  }
  return { min, max }
}

function normalise(raw: number, scale: ScaleId, answered: ReadonlySet<string>): number {
  const { min, max } = achievableRange(scale, answered)
  if (max === min) return 0.5
  return Math.min(1, Math.max(0, (raw - min) / (max - min)))
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Which attribute a bundled option qualifies, for qualifier lookup. */
export function optionAttribute(questionId: string, optionId: string): string | undefined {
  return questionById(questionId)?.options.find((o) => o.id === optionId)?.qualifies
}

export function score(answers: V2Answers): Result {
  const rawScales: Scales = {
    personalizationAppetite: 0,
    renovationTolerance: 0,
    dayOneReadiness: 0,
  }
  const evidence = new Map<string, Evidence>()
  const stances = new Set<StanceId>()
  const answeredIds = new Set<string>()
  const qualifiers: Record<string, string> = {}
  let map: MapConstraint | null = null
  let answered = 0
  let declinedTradeoff = false

  const at = (id: string): Evidence => evidence.get(id) ?? { ...EMPTY_EVIDENCE }

  /** Direct importance, plus its provenance. Never called by the tradeoff. */
  const addDirect = (id: string, amount: number, questionId: string, rank: number | null) => {
    const current = at(id)
    evidence.set(id, {
      ...current,
      direct: current.direct + amount,
      directSources: current.directSources.includes(questionId)
        ? current.directSources
        : [...current.directSources, questionId],
      corroboration: current.corroboration.includes(questionId)
        ? current.corroboration
        : [...current.corroboration, questionId],
      // The first rank recorded wins. A thing named as the top dealbreaker does
      // not become second because a later question mentioned it again.
      statedRank: current.statedRank ?? rank,
    })
  }

  const applyOption = (questionId: string, optionId: string, rank: number | null) => {
    const question = questionById(questionId)
    const option = question?.options.find((candidate) => candidate.id === optionId)
    if (!question || !option) return
    answered += 1
    answeredIds.add(question.id)

    const weights = rank === 2 ? (option.attributesAtRankTwo ?? option.attributes) : option.attributes
    for (const [attributeId, weight] of Object.entries(weights ?? {})) {
      addDirect(attributeId, weight * question.weight, question.id, rank)
    }
    for (const [scaleId, delta] of Object.entries(option.scales ?? {})) {
      rawScales[scaleId as ScaleId] += delta ?? 0
    }
    for (const stance of option.stances ?? []) stances.add(stance)
    if (option.mapConstraint) map = option.mapConstraint
  }

  if (answers.tuesday) applyOption('tuesday', answers.tuesday, null)

  // Ordered multi-selects. Both questions record ONE provenance id however many
  // options were picked: two selections inside one question are one occasion on
  // which the buyer told us something, not two independent confirmations.
  for (const questionId of ['dealbreaker', 'daily'] as const) {
    picksFor(answers, questionId).slice(0, 2).forEach((pick, index) => {
      const rank = index + 1
      applyOption(questionId, pick.option, rank)
      const attribute = optionAttribute(questionId, pick.option)
      // A qualifier grants vocabulary. No weight, no source, no state change.
      if (attribute && pick.qualifier) qualifiers[attribute] = pick.qualifier
    })
  }

  if (answers.architecture) applyOption('architecture', answers.architecture, null)
  if (answers.personalization) applyOption('personalization', answers.personalization, null)
  if (answers.project) applyOption('project', answers.project, null)
  if (answers.location) applyOption('location', answers.location, null)
  if (answers.depends) applyOption('depends', answers.depends, null)
  if (answers.sizeRoute) applyOption('sizeRoute', answers.sizeRoute, null)

  /*
   * The tradeoff. Ordering and corroboration only.
   *
   * It adds no direct importance to either side, in either direction, and it
   * cannot move anything across the protect threshold. What it produces is a
   * record of which of two things survived one forced choice, plus one more
   * interaction for corroboration, and that record stays identifiable as a
   * tradeoff rather than passing as another declaration.
   */
  if (answers.tradeoff) {
    answered += 1
    answeredIds.add('tradeoff')
    const { pair, winner } = answers.tradeoff
    if (winner === null) {
      declinedTradeoff = true
      stances.add('narrowCriteria')
    } else {
      const loser = pair[0] === winner ? pair[1] : pair[0]
      for (const [id, outcome] of [
        [winner, 'won'],
        [loser, 'lost'],
      ] as const) {
        const current = at(id)
        evidence.set(id, {
          ...current,
          ordering: [...current.ordering, { against: id === winner ? loser : winner, outcome, question: 'tradeoff' }],
          corroboration: current.corroboration.includes('tradeoff')
            ? current.corroboration
            : [...current.corroboration, 'tradeoff'],
        })
      }
    }
  }

  const scales = Object.fromEntries(
    (Object.keys(rawScales) as ScaleId[]).map((id) => [id, normalise(rawScales[id], id, answeredIds)]),
  ) as Scales

  const read: ReadAttribute[] = []
  const unknowns: Attribute[] = []
  for (const attribute of ATTRIBUTES) {
    const own = evidence.get(attribute.id)
    if (!own) {
      unknowns.push(attribute)
      continue
    }
    read.push({
      attribute,
      evidence: own,
      state: stateOf(own),
      confidence: confidenceOf(own),
      repeated: isRepeated(own),
      qualifier: qualifiers[attribute.id] ?? null,
    })
  }
  read.sort(
    (a, b) =>
      b.evidence.direct - a.evidence.direct ||
      (a.evidence.statedRank ?? 9) - (b.evidence.statedRank ?? 9) ||
      a.attribute.id.localeCompare(b.attribute.id),
  )

  const protectedIds = new Set(
    read.filter((entry) => entry.state === 'protect').map((entry) => entry.attribute.id),
  )

  return {
    version: 2,
    scales,
    attributes: read,
    unknowns,
    stances,
    map,
    declinedTradeoff,
    answered,
    answeredQuestionIds: [...answeredIds],
    needs: nextFollowUp(answers, protectedIds, stances),
    sizeRoute: sizeRouteOf(stances),
    tradeoff: answers.tradeoff ?? null,
  }
}

/**
 * Whether the size route is a live question for this buyer.
 *
 * BOTH CONDITIONS, NOT EITHER. A high renovation tolerance on its own is not
 * enough: plenty of buyers will take on work without size being the thing at
 * stake, and asking them how they would reach a size they never protected is
 * the kind of question that makes an instrument feel like it is guessing.
 */
export function sizeRouteApplies(
  protectedIds: ReadonlySet<string>,
  stances: ReadonlySet<StanceId>,
): boolean {
  return protectedIds.has('size') && stances.has('structuralWorkOkay')
}

/**
 * Which follow-up to show. At most one, and "depends" takes precedence.
 *
 * A buyer who has already answered one is not asked the other: the point is to
 * resolve the single biggest uncertainty, not to interrogate.
 */
function nextFollowUp(
  answers: V2Answers,
  protectedIds: ReadonlySet<string>,
  stances: ReadonlySet<StanceId>,
): FollowUp | null {
  if (!answers.depends && answers.project === 'depends') return 'depends'
  if (!answers.sizeRoute && sizeRouteApplies(protectedIds, stances)) return 'sizeRoute'
  return null
}

export function byState(result: Result): Record<AttributeState, ReadAttribute[]> {
  const grouped: Record<AttributeState, ReadAttribute[]> = {
    protect: [],
    scrutinize: [],
    flexibilityToTest: [],
    unknown: [],
  }
  for (const entry of result.attributes) grouped[entry.state].push(entry)
  return grouped
}

/** A band, with `unset` when no answered question could have moved the scale. */
export type Band = 'yes' | 'conditional' | 'no' | 'unset'

export function bandOf(scale: ScaleId, result: Result): Band {
  const answered = new Set(result.answeredQuestionIds)
  const inPlay = QUESTIONS.some(
    (question) =>
      answered.has(question.id) && question.options.some((o) => (o.scales?.[scale] ?? 0) !== 0),
  )
  if (!inPlay) return 'unset'
  const value = result.scales[scale]
  const { min, max } = achievableRange(scale, answered)
  // A scale that could only ever move one way, and did not move, is not a
  // reading. Silence at the untouched end is not an emphatic answer.
  if (max === 0 && value >= 1) return 'unset'
  if (min === 0 && value <= 0) return 'unset'
  if (value >= HIGH) return 'yes'
  if (value <= LOW) return 'no'
  return 'conditional'
}
