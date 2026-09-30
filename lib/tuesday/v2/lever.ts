import type { Signals } from './strategy.ts'

/**
 * What can actually move, and when nothing can, why not.
 *
 * "No lever" is two completely different findings wearing one label:
 *
 *   THE BUYER CLOSED THEM      fixed map, will not renovate, and everything
 *                              else they protected is an outright dealbreaker.
 *                              That is a real result and useful information.
 *
 *   WE NEVER ESTABLISHED ONE   they have hard constraints but the instrument
 *                              never gathered anything softer, so we do not
 *                              know what could move. That is our gap, not
 *                              theirs, and it must not be reported as though
 *                              the buyer were inflexible.
 *
 * Collapsing those two into one empty list is how a measurement failure starts
 * sounding like a finding about a person.
 */

export type LeverState = 'identified' | 'closed' | 'notEstablished'

export type VetoReason =
  /** Named as a thing that kills the house. By definition not the give. */
  | 'isDealbreaker'
  /** A filter rule eliminates listings on it, so it cannot also be the give. */
  | 'hardFiltered'
  /** Checked per property rather than traded. */
  | 'operational'
  /** The buyer said the map does not move. */
  | 'fixedGeography'
  /** The map question is already answered by a property-led posture. */
  | 'geographyAlreadyOpen'
  /** Renovation appetite does not support treating condition as the give. */
  | 'lowRenovation'
  /** Appetite is unsettled, so calling condition a lever would be guesswork. */
  | 'unresolvedProject'
  /** Personalization appetite does not support giving on finish. */
  | 'noCosmeticAppetite'
  /**
   * The renovation question was never answered, so we have no reading at all.
   *
   * SEPARATE FROM `lowRenovation` ON PURPOSE. Silence is not a low appetite,
   * and this reason must never be counted as the buyer closing a route.
   */
  | 'renovationNotEstablished'
  /** The personalization question was never answered. Same rule applies. */
  | 'personalizationNotEstablished'
  /** Size is not protected, or structural work was never accepted. */
  | 'noStructuralRoute'

export type ClosedReason =
  /** Candidates existed and the buyer's own answers closed every one. */
  | 'closedByExplicitConstraints'
export type NotEstablishedReason =
  /** Hard constraints exist, but nothing softer was ever gathered. */
  | 'noSecondaryPreferenceEstablished'
  /** Almost nothing is established at all. */
  | 'insufficientEvidence'

export interface LeverCandidate {
  concept: string
  accepted: boolean
  vetoedBy?: VetoReason
}

export interface LeverDiagnosis {
  state: LeverState
  reason: ClosedReason | NotEstablishedReason | null
  candidates: readonly LeverCandidate[]
  /** Accepted concepts, best first. */
  eligible: readonly string[]
}

/**
 * Vetoes that represent a buyer decision rather than an absence of evidence.
 *
 * This list is the whole difference between `closed` and `notEstablished`, so
 * a reason only belongs here when the buyer actually said something. A reason
 * that can be reached by never answering a question must stay out of it: two
 * fixtures were being reported as buyers who had closed every route when they
 * had simply not been asked about renovation or personalization.
 */
const BUYER_CLOSED: readonly VetoReason[] = [
  'isDealbreaker',
  'hardFiltered',
  'fixedGeography',
  'lowRenovation',
]

/**
 * Vetoes that mean we never took a reading, not that the buyer took a position.
 *
 * Every one of these is our gap. None may contribute to `closed`, and the
 * brief has to be able to say which question would have settled it.
 */
const NOT_MEASURED: readonly VetoReason[] = [
  'renovationNotEstablished',
  'personalizationNotEstablished',
  'unresolvedProject',
]

const OPERATIONAL = ['circulation', 'utility', 'parking', 'upkeep']

/**
 * Every lever the evidence could support, with an accept or veto for each.
 *
 * This is the reference answer. The rule engine is checked against it, so a
 * missing rule shows up as a disagreement rather than as a silently empty list.
 */
export function diagnoseLever(s: Signals): LeverDiagnosis {
  const candidates: LeverCandidate[] = []
  const add = (concept: string, veto: VetoReason | null) =>
    candidates.push(veto ? { concept, accepted: false, vetoedBy: veto } : { concept, accepted: true })

  // --- geography ----------------------------------------------------------
  if (s.map === 'fixed') add('geography', 'fixedGeography')
  else if (s.map === 'propertyLed') add('geography', 'geographyAlreadyOpen')
  else if (s.map === 'strongPreference' || s.map === 'fewAreas') add('geography', null)

  // --- condition ----------------------------------------------------------
  if (s.projectUnresolved) add('condition', 'unresolvedProject')
  else if (s.reno === 'yes') add('condition', null)
  else if (s.reno === 'unset') add('condition', 'renovationNotEstablished')
  else add('condition', 'lowRenovation')

  /*
   * Cosmetic finish is its own lever and is NOT renovation tolerance.
   *
   * A buyer who will paper every room has told us that an unstyled house is
   * acceptable. That is something real which can give, and it implies nothing
   * whatever about their willingness to move a wall.
   */
  if (s.pers === 'yes') add('cosmeticFinish', null)
  else if (s.pers === 'unset') add('cosmeticFinish', 'personalizationNotEstablished')
  else add('cosmeticFinish', 'noCosmeticAppetite')

  /*
   * The route to the required size, not the size itself.
   *
   * Size stays protected. What is flexible is whether it already exists, and
   * only when the buyer accepted structural work.
   */
  if (s.protectedIds.has('size') && s.stances.has('structuralWorkOkay')) add('sizeRoute', null)
  else add('sizeRoute', 'noStructuralRoute')

  // --- the protected attributes themselves --------------------------------
  for (const id of [...s.protectedIds].sort()) {
    const entry = s.byId.get(id)
    if (!entry) continue
    if (OPERATIONAL.includes(id)) add(id, 'operational')
    else if (entry.evidence.directSources.includes('dealbreaker')) add(id, 'isDealbreaker')
    else if (s.hardFiltered.has(id)) add(id, 'hardFiltered')
    else add(id, null)
  }

  const eligible = candidates.filter((candidate) => candidate.accepted).map((c) => c.concept)
  if (eligible.length > 0) {
    return { state: 'identified', reason: null, candidates, eligible }
  }

  /*
   * Nothing is eligible. Which of the two findings is it?
   *
   * `closed` says the buyer's own answers shut every route. It therefore
   * requires that EVERY route was actually measured. One route left unmeasured
   * is enough to make the claim false: a buyer who named two dealbreakers and a
   * fixed map, and was never asked about renovation or personalization, has not
   * closed the search. We just stopped asking.
   *
   * That was the live defect. `closedByBuyer` used `some`, so a single earned
   * veto reported the whole search closed while two other routes sat
   * unmeasured, which is the exact conflation the three states exist to end.
   */
  const unmeasured = candidates.filter(
    (candidate) => candidate.vetoedBy && NOT_MEASURED.includes(candidate.vetoedBy),
  )
  const closedByBuyer = candidates.some(
    (candidate) => candidate.vetoedBy && BUYER_CLOSED.includes(candidate.vetoedBy),
  )
  const hasHardConstraints = [...s.protectedIds].some((id) => !OPERATIONAL.includes(id))

  if (closedByBuyer && hasHardConstraints && unmeasured.length === 0) {
    return { state: 'closed', reason: 'closedByExplicitConstraints', candidates, eligible }
  }
  return {
    state: 'notEstablished',
    reason: hasHardConstraints ? 'noSecondaryPreferenceEstablished' : 'insufficientEvidence',
    candidates,
    eligible,
  }
}

/** Which vetoes the brief may report as a gap in our own questioning. */
export function isMeasurementGap(reason: VetoReason): boolean {
  return NOT_MEASURED.includes(reason)
}
