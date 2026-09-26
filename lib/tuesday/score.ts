import {
  ATTRIBUTES,
  DIMENSION_IDS,
  type Attribute,
  type Bucket,
  type DimensionId,
  type Importance,
  importanceOf,
} from './model.ts'
import { QUESTIONS } from './questions.ts'

/** questionId → chosen optionId. Partial while the test is in progress. */
export type Answers = Readonly<Record<string, string>>

export type Dimensions = Record<DimensionId, number>

export interface ScoredAttribute {
  attribute: Attribute
  points: number
  importance: Importance
  bucket: Bucket
}

export type MapFinding = 'tight' | 'balanced' | 'open'
export type CharacterFinding = 'fromHouse' | 'fromYou' | 'either'
export type ProjectFinding =
  /** Structural appetite and cosmetic appetite both high. */
  | 'makeItYours'
  /** Will paper, paint and relight a whole house; will not touch a kitchen. */
  | 'decorateNotRenovate'
  /** Will do the big work; does not want to choose cushions for a year. */
  | 'bigWorkNotDetails'
  /** Wants it done. A legitimate, common, and often expensive requirement. */
  | 'noProject'
  /** Genuinely in between — says so rather than inventing a lean. */
  | 'selective'

export interface Findings {
  map: MapFinding
  project: ProjectFinding
  character: CharacterFinding
}

export interface Result {
  dimensions: Dimensions
  attributes: readonly ScoredAttribute[]
  findings: Findings
  /** How many questions were answered, for a partial result. */
  answered: number
}

/** Normalised dimension cut-points. Deliberately not 0.5 — a lean is not a lean. */
export const HIGH = 0.62
export const LOW = 0.38

/**
 * The achievable range per dimension, derived from the question set rather
 * than hard-coded, so editing a weight cannot silently skew normalisation.
 */
function achievableRange(dimension: DimensionId): { min: number; max: number } {
  let min = 0
  let max = 0
  for (const question of QUESTIONS) {
    const deltas = question.options.map((option) => option.dimensions?.[dimension] ?? 0)
    min += Math.min(...deltas, 0)
    max += Math.max(...deltas, 0)
  }
  return { min, max }
}

function normalise(raw: number, dimension: DimensionId): number {
  const { min, max } = achievableRange(dimension)
  if (max === min) return 0.5
  const scaled = (raw - min) / (max - min)
  return Math.min(1, Math.max(0, scaled))
}

/**
 * Where an attribute lands.
 *
 * The easy-to-change branch comes FIRST and is the reason this function
 * exists. "Matters a lot, easy to change" is not flexibility — it resolves on
 * whether this person actually wants to be the one doing the changing. If they
 * do, it is an opportunity. If they do not, it stays a real search criterion
 * and belongs in PROTECT, however cheap the paint is.
 */
export function bucketFor(
  attribute: Attribute,
  importance: Importance,
  dimensions: Dimensions,
): Bucket {
  const willDoItThemselves =
    dimensions.personalizationAppetite >= HIGH && dimensions.turnkeyNeed < HIGH

  if (attribute.changeability === 'easy' && willDoItThemselves) return 'makeItYours'
  if (importance === 'high') return 'protect'
  if (importance === 'medium' && attribute.changeability !== 'easy') return 'getPicky'

  /*
   * A hard-to-change attribute never lands in "you have room here", even when
   * the buyer actively traded it away. Someone who picks the beautiful
   * renovation on the compromised lot has told us the lot matters less to
   * them — but the lot is the one thing no amount of later money fixes, so
   * "you have room here" would be bad advice dressed as reassurance. It goes
   * to GET PICKY instead, which says exactly that: stricter than your instinct.
   *
   * This is not the site imposing a theory on an unmentioned category — these
   * attributes only appear at all because an answer referenced them.
   */
  if (attribute.changeability === 'hard') return 'getPicky'

  return 'room'
}

function findProject(dimensions: Dimensions): ProjectFinding {
  const renovation = dimensions.renovationTolerance
  const personalization = dimensions.personalizationAppetite
  const turnkey = dimensions.turnkeyNeed

  if (renovation <= LOW && personalization <= LOW) return 'noProject'
  if (turnkey >= HIGH && renovation <= LOW) return 'noProject'
  if (renovation <= LOW && personalization >= HIGH) return 'decorateNotRenovate'
  if (renovation >= HIGH && personalization <= LOW) return 'bigWorkNotDetails'
  if (renovation >= HIGH && personalization >= HIGH) return 'makeItYours'
  return 'selective'
}

export function score(answers: Answers): Result {
  const rawDimensions = Object.fromEntries(
    DIMENSION_IDS.map((id) => [id, 0]),
  ) as Record<DimensionId, number>
  const points = new Map<string, number>()
  const touched = new Set<string>()
  let answered = 0

  for (const question of QUESTIONS) {
    const chosen = answers[question.id]
    if (!chosen) continue
    const option = question.options.find((candidate) => candidate.id === chosen)
    if (!option) continue

    answered += 1

    for (const [attributeId, delta] of Object.entries(option.attributes ?? {})) {
      points.set(attributeId, (points.get(attributeId) ?? 0) + delta)
      touched.add(attributeId)
    }
    for (const [dimensionId, delta] of Object.entries(option.dimensions ?? {})) {
      rawDimensions[dimensionId as DimensionId] += delta
    }
  }

  const dimensions = Object.fromEntries(
    DIMENSION_IDS.map((id) => [id, normalise(rawDimensions[id], id)]),
  ) as Dimensions

  // Only ever speak about attributes the buyer actually signalled. Lecturing
  // someone about a category they never raised is imposing a theory on them.
  const attributes = ATTRIBUTES.filter((attribute) => touched.has(attribute.id))
    .map((attribute) => {
      const attributePoints = points.get(attribute.id) ?? 0
      const importance = importanceOf(attributePoints)
      return {
        attribute,
        points: attributePoints,
        importance,
        bucket: bucketFor(attribute, importance, dimensions),
      }
    })
    .sort((a, b) => b.points - a.points)

  const geographic = dimensions.geographicRigidity
  const characterFromHouse = dimensions.characterFromHouse

  return {
    dimensions,
    attributes,
    answered,
    findings: {
      map: geographic >= HIGH ? 'tight' : geographic <= LOW ? 'open' : 'balanced',
      project: findProject(dimensions),
      character:
        characterFromHouse >= HIGH
          ? 'fromHouse'
          : characterFromHouse <= LOW
            ? 'fromYou'
            : 'either',
    },
  }
}

/** Grouped for rendering, in the order the result reads. */
export function byBucket(result: Result): Record<Bucket, ScoredAttribute[]> {
  const grouped: Record<Bucket, ScoredAttribute[]> = {
    protect: [],
    getPicky: [],
    makeItYours: [],
    room: [],
  }
  for (const scored of result.attributes) grouped[scored.bucket].push(scored)
  return grouped
}
