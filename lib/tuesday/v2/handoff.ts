/**
 * The optional handoff: search facts supplied after the result.
 *
 * NONE OF THIS IS EVIDENCE. It never reaches the scorer, never changes a band,
 * never moves an attribute state and never appears in the shareable result. It
 * is operational information Danielle needs to run a search, collected once the
 * buyer has already decided to send her something.
 *
 * RECORD THE CONSTRAINT, NEVER THE REASON. That rule already governs the map
 * note and it governs every field here. A bedroom count is a property
 * specification; who sleeps in them is not asked. A district boundary is a
 * geographic constraint the buyer supplied; school quality is not rated, ranked
 * or inferred, and nothing about schools is ever surfaced that the buyer did
 * not type. A step-free requirement is a property filter; the reason is not
 * asked. Destinations are recorded as written, with no categories, because a
 * category list would collect things like places of worship.
 *
 * ABSENCE MEANS NOTHING. A blank field is not evidence of flexibility, and it
 * is never a contradiction.
 */

export type TimingPosture = 'casual' | 'thisYear' | 'active' | 'specific'
export type Requirement = 'required' | 'preferred' | 'noPreference'
export type PoolPreference = 'required' | 'no' | 'noPreference'
export type StairsPreference = 'stepFreeNeeded' | 'preferMinimal' | 'noPreference'

export interface Handoff {
  price?: {
    targetMin?: number
    targetMax?: number
    hardCeiling?: number
  }
  timing?: {
    posture?: TimingPosture
    /** Free text, recorded as written. */
    note?: string
  }
  geography?: {
    /** Buyer-entered. Never matched, ranked or scored. */
    considering?: readonly string[]
    ruledOut?: readonly string[]
    note?: string
  }
  /**
   * A specific school, district or boundary the buyer asked to respect.
   *
   * Free text only. No picker, no ratings, no quality data, and nothing about
   * schools is ever produced that the buyer did not type.
   */
  schoolBoundary?: string
  /** Places they want reasonable access to. Free text, no categories. */
  destinations?: readonly string[]
  propertyBasics?: {
    types?: readonly string[]
    minBeds?: number
    minBaths?: number
    minSqft?: number
  }
  hardFilters?: {
    parking?: Requirement
    stairs?: StairsPreference
    pool?: PoolPreference
    ev?: Requirement
    other?: readonly string[]
  }
  buyerNote?: string
}

export const EMPTY_HANDOFF: Handoff = {}

/** True when the buyer supplied nothing. Used to omit the section entirely. */
export function isEmptyHandoff(handoff: Handoff | undefined): boolean {
  if (!handoff) return true
  return Object.values(handoff).every((value) =>
    value === undefined ||
    (typeof value === 'object' && value !== null && Object.values(value).every((v) => v === undefined)),
  )
}
