import { PROTECT_AT, type Evidence, type MapConstraint } from './model.ts'

/**
 * Question eight: the adaptive tradeoff.
 *
 * THE MATRIX ENCODES COHERENCE, NOT MARKET BEHAVIOUR. It answers one question
 * only: can a person meaningfully be asked to choose between these two things
 * without a house in front of them? It says nothing about how properties or
 * prices actually trade, because we have no source for that.
 *
 * WHAT AN ANSWER DOES. It creates a relative-ordering record and one more
 * corroborating interaction. It does not add direct importance to the winner,
 * does not reduce the loser, and cannot move either side across the protect
 * threshold. A buyer forced to rank two non-negotiables has withdrawn neither.
 */

/** The map is a candidate, not an attribute. It is the nineteenth concept. */
export const MAP = 'MAP'

/**
 * Clusters are organizational. They label the matrix and pick the rule family.
 * They do NOT gate eligibility; the matrix below does that, pair by pair.
 */
export const CLUSTERS: Readonly<Record<string, readonly string[]>> = {
  setting: ['light', 'privacy', 'outdoor', 'street'],
  site: ['site'],
  place: ['proximity', 'convenience', MAP],
  interior: ['size', 'separation', 'publicRooms', 'layout'],
  finish: ['condition', 'kitchen'],
  character: ['architecturalCharacter'],
  burden: ['upkeep'],
  access: ['parking', 'circulation'],
  excluded: ['utility'],
}

/**
 * The allowed-pair matrix, written out in full and symmetric.
 *
 * Shorthand was tried and rejected. An "everything except X" row for
 * `condition`, `kitchen` and `architecturalCharacter` silently claimed twelve
 * pairs that the restricted rows deny, because nothing may be weighed against
 * `utility` and `upkeep`, `parking` and `circulation` each trade on one narrow
 * axis. A symmetry test catches that the moment it reappears.
 */
export const ALLOWED: Readonly<Record<string, readonly string[]>> = {
  light: ['privacy', 'outdoor', 'street', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  privacy: ['light', 'outdoor', 'street', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  outdoor: ['light', 'privacy', 'street', 'size', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter', 'upkeep'],
  street: ['light', 'privacy', 'outdoor', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  site: ['size', 'separation', 'publicRooms', 'layout', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter', 'upkeep', 'circulation'],
  proximity: ['light', 'privacy', 'outdoor', 'street', 'site', 'size', 'separation', 'publicRooms', 'layout', 'condition', 'kitchen', 'architecturalCharacter', 'parking'],
  convenience: ['light', 'privacy', 'outdoor', 'street', 'site', 'size', 'separation', 'publicRooms', 'layout', 'condition', 'kitchen', 'architecturalCharacter', 'parking'],
  [MAP]: ['light', 'privacy', 'outdoor', 'street', 'site', 'size', 'separation', 'publicRooms', 'layout', 'condition', 'kitchen', 'architecturalCharacter', 'parking'],
  size: ['layout', 'separation', 'publicRooms', 'outdoor', 'site', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter', 'upkeep', 'parking', 'circulation'],
  separation: ['size', 'publicRooms', 'site', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  publicRooms: ['size', 'separation', 'site', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  layout: ['size', 'site', 'proximity', 'convenience', MAP, 'condition', 'kitchen', 'architecturalCharacter'],
  condition: ['light', 'privacy', 'outdoor', 'street', 'site', 'proximity', 'convenience', MAP, 'size', 'separation', 'publicRooms', 'layout', 'architecturalCharacter'],
  kitchen: ['light', 'privacy', 'outdoor', 'street', 'site', 'proximity', 'convenience', MAP, 'size', 'separation', 'publicRooms', 'layout', 'architecturalCharacter'],
  architecturalCharacter: ['light', 'privacy', 'outdoor', 'street', 'site', 'proximity', 'convenience', MAP, 'size', 'separation', 'publicRooms', 'layout', 'condition', 'kitchen'],
  upkeep: ['site', 'outdoor', 'size'],
  parking: ['size', 'proximity', 'convenience', MAP],
  circulation: ['site', 'size'],
  // Storage and laundry are per-property checks, not requirements you weigh
  // against light or location. "Storage or natural light" is not answerable.
  utility: [],
}

/** Why each excluded pairing is excluded. Documentation the tests read. */
export const EXCLUSIONS: readonly { pair: readonly [string, string]; reason: string }[] = [
  { pair: ['site', 'light'], reason: 'the site qualifier already asks how the house sits and what is next to it' },
  { pair: ['site', 'privacy'], reason: 'same question twice, via the site qualifier' },
  { pair: ['site', 'outdoor'], reason: 'outdoor space lives on the site: containment' },
  { pair: ['site', 'street'], reason: 'the street is part of what the site sits in' },
  { pair: ['layout', 'separation'], reason: 'separation is a property of the layout: containment' },
  { pair: ['layout', 'publicRooms'], reason: 'public-room function is a property of the layout: containment' },
  { pair: ['condition', 'kitchen'], reason: 'the kitchen is part of the condition: containment' },
  { pair: ['upkeep', 'light'], reason: 'upkeep trades only against property scale' },
  { pair: ['parking', 'light'], reason: 'parking trades only against footprint and area' },
  { pair: ['circulation', 'light'], reason: 'circulation trades only against the site and footprint' },
]

/** Rule families, most specific first. The first match classifies a pair. */
export const FAMILY_ORDER: readonly string[] = [
  'finish',
  'character',
  'burden',
  'access',
  'siteVsHouse',
  'propertyVsPlace',
  'interior',
  'setting',
]

function clusterOf(concept: string): string {
  for (const [name, members] of Object.entries(CLUSTERS)) {
    if (members.includes(concept)) return name
  }
  return 'unknown'
}

export function familyOf(a: string, b: string): string {
  const clusters = [clusterOf(a), clusterOf(b)]
  const has = (name: string) => clusters.includes(name)
  if (has('finish')) return 'finish'
  if (has('character')) return 'character'
  if (has('burden')) return 'burden'
  if (has('access')) return 'access'
  if (has('site')) return 'siteVsHouse'
  if (has('place')) return 'propertyVsPlace'
  if (clusters[0] === 'interior' && clusters[1] === 'interior') return 'interior'
  return 'setting'
}

export function isAllowedPair(a: string, b: string): boolean {
  if (a === b) return false
  return (ALLOWED[a] ?? []).includes(b)
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export interface Candidate {
  concept: string
  /** Direct importance. MAP has none and uses the floor. */
  direct: number
  sources: number
  statedRank: number | null
}

export interface Preconditions {
  map: MapConstraint | null
  /** True when the buyer has already said condition does not filter. */
  projectIsMajor: boolean
  /** True when they said plain is actively preferred. */
  wantsNeutral: boolean
  /** Attribute ids that carry a qualifier. */
  qualified: ReadonlySet<string>
}

/**
 * The map may only be offered when the buyer said it moves.
 *
 * `fixed` is never asked to move: that would be putting words in their mouth.
 * `propertyLed` already answered the question, so asking again is noise.
 */
export function mapIsCandidate(map: MapConstraint | null): boolean {
  return map === 'strongPreference' || map === 'fewAreas'
}

function passesPreconditions(a: string, b: string, pre: Preconditions): boolean {
  const family = familyOf(a, b)
  const involves = (concept: string) => a === concept || b === concept

  if (involves(MAP) && !mapIsCandidate(pre.map)) return false
  // A buyer open to major work has already said condition does not filter.
  if (family === 'finish' && pre.projectIsMajor) return false
  // They said plain is preferred, so weighing character against anything is moot.
  if (family === 'character' && pre.wantsNeutral) return false
  // A bundled concept may only be weighed when we know which part they meant.
  if (family === 'burden' && !pre.qualified.has('upkeep')) return false
  if (involves('parking') && !pre.qualified.has('parking')) return false
  return true
}

export interface SelectedPair {
  pair: readonly [string, string]
  family: string
}

/** The two fallbacks, chosen by map posture so the fixed-map rule always holds. */
export const FALLBACKS: Readonly<Record<'movable' | 'fixed', SelectedPair>> = {
  movable: { pair: [MAP, 'condition'], family: 'fallbackPlace' },
  fixed: { pair: ['site', 'condition'], family: 'fallbackSite' },
}

/**
 * Choose the pair.
 *
 * Ranked by JOINT STRENGTH, the lower of the two sides, so two strong things
 * are paired rather than a strong thing against a medium one. Ties break on
 * corroboration, then on stated rank, then on a stable order so the same
 * answers always produce the same question.
 */
export function selectPair(
  candidates: readonly Candidate[],
  pre: Preconditions,
): SelectedPair {
  const eligible = candidates.filter((c) => c.concept === MAP || c.direct >= PROTECT_AT)
  const pairs: { pair: [string, string]; family: string; joint: number; sources: number; rank: number }[] = []

  for (let i = 0; i < eligible.length; i += 1) {
    for (let j = i + 1; j < eligible.length; j += 1) {
      const [a, b] = [eligible[i], eligible[j]]
      if (!isAllowedPair(a.concept, b.concept)) continue
      if (!passesPreconditions(a.concept, b.concept, pre)) continue
      pairs.push({
        // Canonical order. The pair a buyer is shown must not depend on the
        // order candidates happened to arrive in, or the same answers would
        // produce a different question on a different day.
        pair: [a.concept, b.concept].sort() as [string, string],
        family: familyOf(a.concept, b.concept),
        // The map carries no direct evidence, so it takes the floor rather
        // than dragging every pair it appears in to the bottom.
        joint: Math.min(a.concept === MAP ? PROTECT_AT : a.direct, b.concept === MAP ? PROTECT_AT : b.direct),
        sources: a.sources + b.sources,
        rank: (a.statedRank ?? 9) + (b.statedRank ?? 9),
      })
    }
  }

  if (pairs.length === 0) {
    return mapIsCandidate(pre.map) ? FALLBACKS.movable : FALLBACKS.fixed
  }

  pairs.sort(
    (x, y) =>
      y.joint - x.joint ||
      y.sources - x.sources ||
      x.rank - y.rank ||
      x.pair.join().localeCompare(y.pair.join()),
  )
  return { pair: pairs[0].pair, family: pairs[0].family }
}

/** Candidates, from scored evidence. Exported so tests can drive it directly. */
export function candidatesFrom(
  evidence: ReadonlyMap<string, Evidence>,
  map: MapConstraint | null,
): Candidate[] {
  const list: Candidate[] = []
  for (const [concept, own] of evidence) {
    list.push({
      concept,
      direct: own.direct,
      sources: new Set(own.corroboration).size,
      statedRank: own.statedRank,
    })
  }
  if (mapIsCandidate(map)) {
    list.push({ concept: MAP, direct: PROTECT_AT, sources: 1, statedRank: null })
  }
  return list
}
