/**
 * The Tuesday Test — domain model.
 *
 * EVIDENCE, NOT A SCORE. An earlier version summed points per attribute and
 * read the total as truth. Numbers still exist below for deterministic
 * ordering, but they are not allowed to manufacture certainty: every attribute
 * carries what we actually observed — direct statements, tradeoff outcomes,
 * how many times it came up, whether the signals agreed — and a STATE derived
 * from that evidence, including the state "we never established this".
 *
 * Two separations are load-bearing and must not be collapsed:
 *
 * 1. IMPORTANCE BELONGS TO THE BUYER. CHANGEABILITY BELONGS TO THE PROPERTY.
 *    A lot is impossible to change and can still be something this buyer
 *    knowingly deprioritised. Changeability colours the INTERPRETATION — "that
 *    is a compromise you would live with rather than fix later" — it never
 *    promotes an attribute the buyer did not care about.
 *
 * 2. RENOVATION TOLERANCE IS NOT PERSONALIZATION APPETITE, and neither is
 *    "how much the architecture itself has to deliver". All three can be high
 *    at once: "I want real bones, I will wallpaper every room, and I am not
 *    gutting the kitchen" is one coherent person.
 */

/**
 * How hard a thing is to change once you own it. Four classes, because three
 * made the tool say "fixable" about things whose honest answer is "maybe".
 */
export type Changeability =
  /** Usually difficult, uncertain or impossible to correct. Location, grade,
   *  adjacency, privacy geometry, most views, daily access. */
  | 'protectAtPurchase'
  /** Possible, but real money, time, approvals and disruption. Kitchens,
   *  baths, layout, additions, pool removal, structural work. */
  | 'realProject'
  /** Normally manageable without construction. Paint, paper, decorative
   *  lighting, hardware, furnishings, window treatments, art. */
  | 'usuallyAdaptable'
  /** Too dependent on the actual site, structure or rules to classify in the
   *  abstract. Sound mitigation, bigger windows, ADU potential, parking
   *  changes, some landscaping and privacy work. The honest "maybe". */
  | 'verifyPerProperty'

export interface Attribute {
  id: string
  /** Shown as a list item in the result. */
  label: string
  /** The same thing said mid-sentence. Defaults to the lowercased label. */
  phrase?: string
  changeability: Changeability
  /**
   * True for things a house can impose on you every day regardless of how
   * nice it looks — maintenance, circulation, utility. Surfaced in the brief.
   */
  operational?: boolean
}

export function phraseFor(attribute: Attribute): string {
  return attribute.phrase ?? attribute.label.toLowerCase()
}

/**
 * Dimensions. Each is independent — see the header. `mapConstraint` is
 * deliberately not a 0..1 scale: constraint strength is a choice the buyer
 * makes, not a quantity we infer.
 */
export type ScaleId =
  | 'renovationTolerance'
  | 'personalizationAppetite'
  | 'architecturalRequirement'
  | 'dayOneReadiness'
  | 'operationalBurdenTolerance'

export const SCALE_IDS: readonly ScaleId[] = [
  'renovationTolerance',
  'personalizationAppetite',
  'architecturalRequirement',
  'dayOneReadiness',
  'operationalBurdenTolerance',
]

/** Four levels, strongest first. Never derived from the buyer's reasons. */
export type MapConstraint = 'fixed' | 'strongPreference' | 'fewAreas' | 'propertyLed'

/**
 * What we established about an attribute.
 *
 * UNKNOWN IS A REAL STATE AND THE MOST IMPORTANT ADDITION. Unasked is not
 * flexible. If the test never raised parking, laundry, stairs or maintenance,
 * the honest output is "we have not established this", not "you have room
 * here".
 */
export type AttributeState =
  /** Strong, direct evidence this matters. */
  | 'protect'
  /** Evidence it matters, and it is expensive, permanent or property-specific. */
  | 'scrutinize'
  /** Evidence of relative flexibility. Somewhere to compare real houses — NOT
   *  a finding that the buyer does not care. */
  | 'flexibilityToTest'
  /** Never established. Belongs in the brief as a question, not in a verdict. */
  | 'unknown'

export type Confidence = 'strong' | 'moderate' | 'weak'

/** What we actually observed about one attribute. */
export interface Evidence {
  /** Weighted direct statements of importance. NEVER negative — see below. */
  direct: number
  /** Times chosen as the winner of a constrained comparison. */
  tradeoffWins: number
  /**
   * Times NOT chosen in a constrained comparison. Carries no penalty: losing
   * one pairwise tradeoff establishes relative priority between two live
   * criteria, not that the loser is unimportant.
   */
  tradeoffLosses: number
  /** Distinct answers that referenced it, for confidence. */
  mentions: number
}

export const EMPTY_EVIDENCE: Evidence = {
  direct: 0,
  tradeoffWins: 0,
  tradeoffLosses: 0,
  mentions: 0,
}

/** Direct-evidence weight at which an attribute is genuinely protected. */
export const PROTECT_AT = 3

export function confidenceOf(evidence: Evidence): Confidence {
  const signals = evidence.mentions + evidence.tradeoffWins
  if (signals >= 3) return 'strong'
  if (signals === 2) return 'moderate'
  return 'weak'
}

/**
 * The attribute registry.
 *
 * `operational` marks the things that become a daily tax rather than a
 * headline feature. A house can have every right feature on paper and still
 * annoy you every single day, and that category was invisible to the first
 * model.
 */
export const ATTRIBUTES: readonly Attribute[] = [
  // Protect at purchase — the lot and everything around it.
  { id: 'light', label: 'Natural light', changeability: 'protectAtPurchase' },
  { id: 'privacy', label: 'Privacy', changeability: 'protectAtPurchase' },
  {
    id: 'outdoor',
    label: 'Outdoor space you would actually use',
    phrase: 'outdoor space you would actually use',
    changeability: 'protectAtPurchase',
  },
  { id: 'lot', label: 'The lot itself', changeability: 'protectAtPurchase' },
  { id: 'street', label: 'The street and the noise', phrase: 'the street', changeability: 'protectAtPurchase' },
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
  { id: 'view', label: 'The view', changeability: 'protectAtPurchase' },

  // Real project — possible, but money, permits and disruption.
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
  { id: 'kitchen', label: 'A kitchen you do not have to redo', phrase: 'the kitchen', changeability: 'realProject' },
  { id: 'condition', label: 'Move-in condition', changeability: 'realProject' },
  { id: 'ceilings', label: 'Ceiling height', changeability: 'realProject' },

  // Verify per property — the honest "maybe".
  { id: 'expansion', label: 'Room to add on later', changeability: 'verifyPerProperty' },
  {
    id: 'circulation',
    label: 'Stairs and how you move through it',
    phrase: 'stairs and circulation',
    changeability: 'verifyPerProperty',
    operational: true,
  },
  {
    id: 'utility',
    label: 'Laundry, storage and pantry',
    phrase: 'laundry, storage and pantry',
    changeability: 'verifyPerProperty',
    operational: true,
  },
  {
    id: 'parking',
    label: 'Parking, garage and charging',
    phrase: 'parking and charging',
    changeability: 'verifyPerProperty',
    operational: true,
  },
  {
    id: 'upkeep',
    label: 'How much property there is to look after',
    phrase: 'how much there is to look after',
    changeability: 'verifyPerProperty',
    operational: true,
  },

  // Usually adaptable — and adaptable is not the same as unimportant.
  { id: 'character', label: 'Character you can see on arrival', phrase: 'character', changeability: 'usuallyAdaptable' },
  { id: 'finishes', label: 'Finishes and fixtures', changeability: 'usuallyAdaptable' },
]

export function attributeById(id: string): Attribute | undefined {
  return ATTRIBUTES.find((attribute) => attribute.id === id)
}

/**
 * The cosmetic layers a high-personalization buyer supplies themselves.
 *
 * A FIXED LIST, NOT SCORED ATTRIBUTES. "Make it yours" is about paint, paper,
 * lighting and styling — never about move-in condition or a working kitchen,
 * which is precisely what the decorator was NOT flexible about at the
 * project level.
 */
export const PERSONAL_LAYERS: readonly string[] = [
  'Paint and wallpaper',
  'Lighting',
  'Hardware and fittings',
  'Window treatments',
  'Art, furniture and styling',
]
