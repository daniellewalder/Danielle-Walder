import {
  ATTRIBUTES,
  EMPTY_EVIDENCE,
  PROTECT_AT,
  SCALE_IDS,
  confidenceOf,
  type Attribute,
  type AttributeState,
  type Confidence,
  type Evidence,
  type MapConstraint,
  type ScaleId,
} from './model.ts'
import { QUESTIONS, questionById } from './questions.ts'

/** questionId → chosen optionId(s). Partial while the test is in progress. */
export type Answers = Readonly<Record<string, string | readonly string[]>>

export type Scales = Record<ScaleId, number>

export interface ReadAttribute {
  attribute: Attribute
  evidence: Evidence
  state: AttributeState
  confidence: Confidence
  /**
   * True when this is something the buyer knowingly traded away AND it cannot
   * be fixed later. Drives the "you would be living with it" caveat rather
   * than promoting it back to a priority.
   */
  tradedAwayPermanently: boolean
}

export type Tension =
  /** Wants it finished and also volunteers for construction. */
  | 'readinessVersusRenovation'
  /** Declined to resolve a forced tradeoff. Narrow criteria, not indecision. */
  | 'narrowCriteria'

export interface Findings {
  map: MapConstraint | null
  /** High personalization, and not blocked by wanting it finished. */
  willLayer: boolean
  /** Major condition and function genuinely need to work on arrival. */
  needsDayOne: boolean
  /** Wants outdoor life, does not want grounds to run. */
  outdoorWithoutBurden: boolean
  tensions: readonly Tension[]
}

export interface Result {
  scales: Scales
  /** Everything with evidence, strongest first. */
  attributes: readonly ReadAttribute[]
  /** Everything the test never established. Belongs in the brief, not a verdict. */
  unknowns: readonly Attribute[]
  findings: Findings
  answered: number
  /** True when the clarification question should be asked. */
  needsClarification: boolean
}

export const HIGH = 0.62
export const LOW = 0.38

function chosenIds(answers: Answers, questionId: string): string[] {
  const raw = answers[questionId]
  if (!raw) return []
  return (Array.isArray(raw) ? raw : [raw]) as string[]
}

/**
 * The range achievable across the questions ACTUALLY ANSWERED.
 *
 * Normalising against every question in the set diluted every signal: four
 * questions can move `dayOneReadiness`, so one emphatic answer read as 0.43
 * and the model concluded nothing. A scale should describe the evidence in
 * front of it, not be punished for questions nobody reached.
 */
function achievableRange(scale: ScaleId, answeredIds: ReadonlySet<string>): { min: number; max: number } {
  let min = 0
  let max = 0
  for (const question of QUESTIONS) {
    if (!answeredIds.has(question.id)) continue
    const deltas = question.options.map((option) => option.scales?.[scale] ?? 0)
    const limit = question.choose ?? 1
    // A multi-select can stack several options, so its range is the best and
    // worst `choose` of them rather than a single pick.
    const ascending = [...deltas].sort((a, b) => a - b)
    min += ascending.slice(0, limit).reduce((total, value) => total + Math.min(value, 0), 0)
    max += ascending
      .slice(-limit)
      .reduce((total, value) => total + Math.max(value, 0), 0)
  }
  return { min, max }
}

function normalise(raw: number, scale: ScaleId, answeredIds: ReadonlySet<string>): number {
  const { min, max } = achievableRange(scale, answeredIds)
  if (max === min) return 0.5
  return Math.min(1, Math.max(0, (raw - min) / (max - min)))
}

/**
 * The state of one attribute, from its evidence.
 *
 * CHANGEABILITY DOES NOT APPEAR IN THE PROMOTION PATH. It can move something
 * from "flexibility to test" into "scrutinize" ONLY when there is already
 * direct evidence the buyer cares — it never invents importance for a thing
 * they knowingly deprioritised. A lot they traded away stays traded away; what
 * changes is how the interpretation talks about it.
 */
export function stateOf(attribute: Attribute, evidence: Evidence): AttributeState {
  if (evidence.direct >= PROTECT_AT) return 'protect'

  if (evidence.direct > 0) {
    const expensiveOrUncertain =
      attribute.changeability === 'protectAtPurchase' ||
      attribute.changeability === 'realProject' ||
      attribute.changeability === 'verifyPerProperty'
    return expensiveOrUncertain ? 'scrutinize' : 'flexibilityToTest'
  }

  // A tradeoff win with no direct statement still means it came out on top of
  // something live. A loss means there is somewhere to compare real houses.
  if (evidence.tradeoffWins > 0) return 'scrutinize'
  if (evidence.tradeoffLosses > 0 || evidence.mentions > 0) return 'flexibilityToTest'

  return 'unknown'
}

export function score(answers: Answers): Result {
  const rawScales = Object.fromEntries(SCALE_IDS.map((id) => [id, 0])) as Scales
  const evidence = new Map<string, Evidence>()
  const tensions = new Set<Tension>()
  const answeredIds = new Set<string>()
  const stances = new Set<string>()
  let map: MapConstraint | null = null
  let answered = 0

  const evidenceFor = (id: string): Evidence =>
    evidence.get(id) ?? { ...EMPTY_EVIDENCE }

  for (const question of QUESTIONS) {
    const picks = chosenIds(answers, question.id)
    const limit = question.choose ?? 1

    for (const pick of picks.slice(0, limit)) {
      const option = question.options.find((candidate) => candidate.id === pick)
      if (!option) continue
      answered += 1
      answeredIds.add(question.id)
      for (const signal of option.signals ?? []) stances.add(signal)

      for (const [attributeId, weight] of Object.entries(option.attributes ?? {})) {
        const current = evidenceFor(attributeId)
        evidence.set(attributeId, {
          ...current,
          direct: current.direct + weight * question.weight,
          mentions: current.mentions + 1,
        })
      }

      if (option.beats) {
        for (const winner of option.beats.winners) {
          const current = evidenceFor(winner)
          evidence.set(winner, { ...current, tradeoffWins: current.tradeoffWins + 1 })
        }
        for (const loser of option.beats.losers) {
          // No penalty. Ever. One comparison does not unmake a preference.
          const current = evidenceFor(loser)
          evidence.set(loser, { ...current, tradeoffLosses: current.tradeoffLosses + 1 })
        }
      }

      for (const [scaleId, delta] of Object.entries(option.scales ?? {})) {
        rawScales[scaleId as ScaleId] += delta ?? 0
      }

      if (option.mapConstraint) map = option.mapConstraint
      if (option.unresolved) tensions.add('narrowCriteria')
    }
  }

  const scales = Object.fromEntries(
    SCALE_IDS.map((id) => [id, normalise(rawScales[id], id, answeredIds)]),
  ) as Scales

  // A contradiction is information. It is not averaged away, and it is worth
  // exactly one follow-up question. Read from the stances the buyer actually
  // took — "I want it finished" AND "I'd gladly redo the kitchen" — rather
  // than from a blended scale, which hid the conflict it was meant to detect.
  if (stances.has('wantsFinished') && stances.has('willBuild')) {
    tensions.add('readinessVersusRenovation')
  }

  const read: ReadAttribute[] = []
  const unknowns: Attribute[] = []

  for (const attribute of ATTRIBUTES) {
    const own = evidence.get(attribute.id)
    if (!own) {
      unknowns.push(attribute)
      continue
    }
    const state = stateOf(attribute, own)
    read.push({
      attribute,
      evidence: own,
      state,
      confidence: confidenceOf(own),
      tradedAwayPermanently:
        state === 'flexibilityToTest' &&
        own.tradeoffLosses > 0 &&
        attribute.changeability === 'protectAtPurchase',
    })
  }

  read.sort((a, b) => b.evidence.direct - a.evidence.direct || b.evidence.tradeoffWins - a.evidence.tradeoffWins)

  const protectedIds = new Set(
    read.filter((entry) => entry.state === 'protect').map((entry) => entry.attribute.id),
  )

  return {
    scales,
    attributes: read,
    unknowns,
    answered,
    needsClarification: tensions.has('readinessVersusRenovation') && !answers.clarify,
    findings: {
      map,
      willLayer: scales.personalizationAppetite >= HIGH && scales.dayOneReadiness < HIGH,
      needsDayOne: scales.dayOneReadiness >= HIGH,
      // Wanting a patio is not wanting acreage.
      outdoorWithoutBurden:
        protectedIds.has('outdoor') && scales.operationalBurdenTolerance <= LOW,
      tensions: [...tensions],
    },
  }
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

/** The next question to put on screen, or null when the test is finished. */
export function nextQuestion(answers: Answers): string | null {
  for (const question of QUESTIONS) {
    if (question.showWhen === 'conflict') continue
    if (chosenIds(answers, question.id).length === 0) return question.id
  }
  return score(answers).needsClarification ? 'clarify' : null
}

export { questionById }
