/**
 * The Tuesday Test, V2 — domain model.
 *
 * V1 lives one directory up and is left alone. It still serves every result
 * link ever shared, and nothing here may reinterpret a V1 answer.
 *
 * Three separations are load-bearing and are represented as three different
 * things in the data, not as three readings of one number:
 *
 *   DIRECT IMPORTANCE   how much the buyer said this matters
 *   CORROBORATION       how many separate questions touched it
 *   RELATIVE ORDERING   which of two things survived a forced choice
 *
 * A tradeoff answer produces the third and contributes to the second. It never
 * produces the first. Winning a forced choice is not a declaration that
 * something is a dealbreaker, and losing one is not a statement that it stopped
 * mattering.
 */

// ---------------------------------------------------------------------------
// Attributes
// ---------------------------------------------------------------------------

/** How hard a thing is to change once you own it. */
export type Changeability =
  /** Usually impossible or uncertain to correct. The site and everything on it. */
  | 'protectAtPurchase'
  /** Possible, but real money, time, approvals and disruption. */
  | 'realProject'
  /** Too dependent on the actual site, structure or rules to classify in the abstract. */
  | 'verifyPerProperty'

export interface Attribute {
  id: string
  label: string
  /** The same thing said mid-sentence. Defaults to the lowercased label. */
  phrase?: string
  changeability: Changeability
  /** A daily tax rather than a headline feature. Surfaced in the brief. */
  operational?: boolean
  /**
   * The label names several things that arrive on one click, so the result may
   * not expand it without a qualifier. `site` is bundled by definition: slope,
   * shape and how the house sits are not the same finding.
   */
  bundled?: boolean
}

/**
 * The registry. Eighteen, and every one is reachable from at least one answer.
 *
 * Deliberately absent: `view`, `ceilings` and `finishes` had no source and
 * padded every result's "not established" list. `expansion` is absent because
 * willingness to do structural work is not a desire for expansion potential;
 * that combination is inferred, never scored. `lot` is replaced by `site`,
 * which is a sharper concept and is asked directly.
 */
export const ATTRIBUTES: readonly Attribute[] = [
  // --- protect at purchase: the site and everything about where it is -------
  { id: 'light', label: 'Natural light', changeability: 'protectAtPurchase' },
  { id: 'privacy', label: 'Privacy', changeability: 'protectAtPurchase' },
  {
    id: 'outdoor',
    label: "Outdoor space you'd actually use",
    phrase: "outdoor space you'd actually use",
    changeability: 'protectAtPurchase',
  },
  { id: 'street', label: 'The street and the noise', phrase: 'the street', changeability: 'protectAtPurchase' },
  {
    id: 'site',
    label: 'The land, and how the house sits on it',
    phrase: 'the site itself',
    changeability: 'protectAtPurchase',
    bundled: true,
  },
  {
    id: 'proximity',
    label: 'Being close to the people you see constantly',
    phrase: 'staying close to your people',
    changeability: 'protectAtPurchase',
  },
  {
    id: 'convenience',
    label: 'Getting daily life done easily',
    phrase: 'everyday convenience',
    changeability: 'protectAtPurchase',
  },
  {
    id: 'architecturalCharacter',
    label: 'The architecture itself',
    phrase: 'the architecture itself',
    changeability: 'protectAtPurchase',
  },

  // --- real project: money, permits, disruption -----------------------------
  { id: 'layout', label: 'The layout', changeability: 'realProject' },
  { id: 'size', label: 'Enough square footage', phrase: 'having enough space', changeability: 'realProject' },
  {
    id: 'separation',
    label: 'Somewhere to close a door',
    phrase: 'somewhere to close a door',
    changeability: 'realProject',
  },
  {
    id: 'publicRooms',
    label: 'Living space that works for how you cook and host',
    phrase: 'living space that works for how you cook and host',
    changeability: 'realProject',
  },
  { id: 'kitchen', label: "A kitchen you don't have to redo", phrase: 'the kitchen', changeability: 'realProject' },
  { id: 'condition', label: 'Move-in condition', changeability: 'realProject' },

  // --- verify per property: the honest "it depends on the house" -----------
  {
    id: 'circulation',
    label: 'Stairs and how you move through it',
    phrase: 'stairs and circulation',
    changeability: 'verifyPerProperty',
    operational: true,
  },
  {
    id: 'utility',
    label: 'Where everyday life goes',
    phrase: 'where everyday life goes',
    changeability: 'verifyPerProperty',
    operational: true,
    bundled: true,
  },
  {
    id: 'parking',
    label: 'Cars, arriving, getting in and out',
    phrase: 'cars and getting in and out',
    changeability: 'verifyPerProperty',
    operational: true,
    bundled: true,
  },
  {
    id: 'upkeep',
    label: 'How much there is to look after',
    phrase: 'how much there is to look after',
    changeability: 'verifyPerProperty',
    operational: true,
    bundled: true,
  },
]

export type AttributeId = (typeof ATTRIBUTES)[number]['id']

export function attributeById(id: string): Attribute | undefined {
  return ATTRIBUTES.find((attribute) => attribute.id === id)
}

export function phraseFor(attribute: Attribute): string {
  return attribute.phrase ?? attribute.label.toLowerCase()
}

/** Attributes whose label may only be expanded when a qualifier was chosen. */
export const BUNDLED: readonly string[] = ATTRIBUTES.filter((a) => a.bundled).map((a) => a.id)

// ---------------------------------------------------------------------------
// Qualifiers
// ---------------------------------------------------------------------------

/**
 * A qualifier records WHICH part of a bundled answer the buyer meant.
 *
 * It carries no weight and creates no provenance source. Its entire job is to
 * grant the result permission to use a more precise word: a brief may mention
 * a pool only when `upkeep` carries the `pool` qualifier, and may never infer
 * one from the category alone.
 */
export interface Qualifier {
  id: string
  label: string
  /** True for the answer that genuinely means the whole bundle. */
  all?: boolean
}

export const QUALIFIERS: Readonly<Record<string, readonly Qualifier[]>> = {
  site: [
    { id: 'land', label: 'The land itself: slope, shape, how much is usable flat' },
    { id: 'sits', label: 'How the house sits on it: position, level, orientation' },
    { id: 'neighbours', label: "What's built right next to it" },
    { id: 'access', label: 'Getting in and out' },
    { id: 'whole', label: 'Honestly, the whole thing', all: true },
  ],
  utility: [
    { id: 'laundry', label: 'Laundry' },
    { id: 'storage', label: 'Storage' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'all', label: 'Honestly, all of it', all: true },
  ],
  parking: [
    { id: 'offstreet', label: 'Off-street parking' },
    { id: 'garage', label: 'A garage' },
    { id: 'access', label: 'The driveway and getting in and out' },
    { id: 'charging', label: 'EV charging' },
  ],
  upkeep: [
    { id: 'pool', label: 'A pool' },
    { id: 'planting', label: 'Planting and landscape' },
    { id: 'amount', label: 'How much property there is' },
    { id: 'general', label: 'General maintenance' },
  ],
}

export function qualifiersFor(attributeId: string): readonly Qualifier[] {
  return QUALIFIERS[attributeId] ?? []
}

// ---------------------------------------------------------------------------
// Scales and stances
// ---------------------------------------------------------------------------

/**
 * Three, all two-sided.
 *
 * V1 carried five. `architecturalRequirement` duplicated an attribute and
 * `operationalBurdenTolerance` duplicated `upkeep` being protected; both were
 * one-sided, so a buyer who simply never raised the subject read as emphatic
 * at the untouched end. Removing them removes that failure mode at the root.
 */
export type ScaleId = 'personalizationAppetite' | 'renovationTolerance' | 'dayOneReadiness'

export const SCALE_IDS: readonly ScaleId[] = [
  'personalizationAppetite',
  'renovationTolerance',
  'dayOneReadiness',
]

/**
 * Named positions the buyer took. Stances carry no importance and no score.
 *
 * `wantsNeutral` exists so "I'd rather it be plain" can be recorded without a
 * negative attribute weight, and `structuralWorkOkay` exists so willingness to
 * move walls can be recorded without pretending the buyer wants to.
 */
export type StanceId =
  | 'wantsFinished'
  | 'willBuild'
  | 'structuralWorkOkay'
  | 'wantsNeutral'
  | 'budgetLed'
  | 'timeLed'
  | 'scaleLimited'
  | 'propertyGated'
  | 'narrowCriteria'

/** Four levels, strongest first. Never derived from the buyer's reasons. */
export type MapConstraint = 'fixed' | 'strongPreference' | 'fewAreas' | 'propertyLed'

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

/** One record of a forced choice. Ordering only, never importance. */
export interface OrderRecord {
  /** The other side of the pair. */
  against: string
  outcome: 'won' | 'lost'
  /** Always 'tradeoff' today, but recorded so the source is never guessed. */
  question: string
}

/**
 * What we observed about one attribute.
 *
 * The three concepts are kept apart on purpose. `direct` answers "how much do
 * they care", `corroboration` answers "how consistently did they say so", and
 * `ordering` answers "what survived when they had to choose". Collapsing any
 * two of them is how a single answer starts sounding like a pattern.
 */
export interface Evidence {
  /** Absolute importance. Only Q1 to Q6 and the clarifications produce this. */
  direct: number
  /** Question ids that produced DIRECT evidence. */
  directSources: readonly string[]
  /**
   * Every distinct question that touched this attribute at all, including the
   * tradeoff. This is what recurrence language is counted from, and a tradeoff
   * appears here as a genuine second interaction while remaining identifiable
   * through `ordering`.
   */
  corroboration: readonly string[]
  /** Forced-choice outcomes. Never affects `direct`. */
  ordering: readonly OrderRecord[]
  /** Position within an ordered multi-select. Ordering information, not importance. */
  statedRank: number | null
}

export const EMPTY_EVIDENCE: Evidence = {
  direct: 0,
  directSources: [],
  corroboration: [],
  ordering: [],
  statedRank: null,
}

/** Direct-evidence weight at which an attribute is genuinely protected. */
export const PROTECT_AT = 3

/** Distinct questions that touched this at all. Two picks in one question is one. */
export function independentSources(evidence: Evidence): number {
  return new Set(evidence.corroboration).size
}

/** The gate for every phrase claiming recurrence. Two DIFFERENT questions. */
export function isRepeated(evidence: Evidence): boolean {
  return independentSources(evidence) >= 2
}

export type Confidence = 'strong' | 'moderate' | 'weak'

export function confidenceOf(evidence: Evidence): Confidence {
  const signals = independentSources(evidence)
  if (signals >= 3) return 'strong'
  if (signals === 2) return 'moderate'
  return 'weak'
}

/** What we established about an attribute. */
export type AttributeState =
  /** Strong, direct evidence this matters. */
  | 'protect'
  /** Evidence it matters, or it survived a forced choice. */
  | 'scrutinize'
  /** Somewhere to compare real houses. NOT a finding that they do not care. */
  | 'flexibilityToTest'
  /** Never established. A question, not a verdict. */
  | 'unknown'

/**
 * The state of one attribute.
 *
 * A protected attribute that LOSES a forced choice stays protected, because
 * direct importance is tested first. That is the whole point of keeping
 * ordering separate: a buyer forced to rank two non-negotiables has not
 * withdrawn either of them.
 */
export function stateOf(evidence: Evidence): AttributeState {
  if (evidence.direct >= PROTECT_AT) return 'protect'
  if (evidence.direct > 0) return 'scrutinize'
  if (evidence.ordering.some((record) => record.outcome === 'won')) return 'scrutinize'
  if (evidence.ordering.length > 0) return 'flexibilityToTest'
  return 'unknown'
}

/** The cosmetic layers a high-personalization buyer supplies themselves. */
export const PERSONAL_LAYERS: readonly string[] = [
  'Paint and wallpaper',
  'Lighting',
  'Hardware and fittings',
  'Window treatments',
  'Art, furniture and styling',
]
