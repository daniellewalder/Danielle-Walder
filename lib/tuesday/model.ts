/**
 * The Tuesday Test — domain model.
 *
 * The product question is not "what do you like?" but "what would you regret
 * compromising on?", and the answer depends on two independent things:
 *
 *   IMPORTANCE   — how much this buyer demonstrated they care. From answers.
 *   CHANGEABILITY— how hard the thing is to change afterwards. A property of
 *                  the attribute itself, not of the buyer.
 *
 * The result is the cross of the two. That cross is the whole idea, and the
 * cell that gets mishandled is "matters a lot, easy to change": a naive model
 * calls that flexibility and tells the buyer paint is cheap. It is not
 * flexibility. It resolves on whether this particular person actually wants to
 * be the one who changes it — which is `personalizationAppetite`, a dimension
 * kept deliberately separate from `renovationTolerance`.
 *
 * Someone can happily wallpaper, repaint, relight and rehang a whole house and
 * have zero interest in replacing a kitchen. Someone else will gut a kitchen
 * and never choose a cushion. Collapsing those into one "likes renovation"
 * score is what produces "just buy the fixer" — the output this tool exists to
 * avoid.
 */

/** How hard a thing is to undo once you own it. Not a judgement of worth. */
export type Changeability =
  /** Lot, light, street, what is next door. "We'll fix it later" is not true. */
  | 'hard'
  /** Possible with money, permits and patience. Most buyers never will. */
  | 'major'
  /** Paint, lighting, hardware, landscaping. Easy is not the same as unimportant. */
  | 'easy'

export interface Attribute {
  id: string
  /** Shown as a list item in the result. */
  label: string
  /**
   * The same thing said mid-sentence. "You were consistent about a kitchen you
   * do not have to redo" is a label doing prose's job; this is the prose form.
   * Defaults to the lowercased label.
   */
  phrase?: string
  changeability: Changeability
}

export function phraseFor(attribute: Attribute): string {
  return attribute.phrase ?? attribute.label.toLowerCase()
}

/**
 * Five axes, scored independently. The combinations are the interesting part —
 * see `interpret.ts` — so none of these may be folded into another.
 */
export type DimensionId =
  /** How much real life pins the map. High means the map should stay tight. */
  | 'geographicRigidity'
  /** Appetite for structural work: layout, additions, a kitchen replaced. */
  | 'renovationTolerance'
  /** Appetite for cosmetic and creative work: paint, paper, light, hardware. */
  | 'personalizationAppetite'
  /** Need for it to be finished on day one. Not simply the inverse of above. */
  | 'turnkeyNeed'
  /** Whether character should come from the house or from the buyer. */
  | 'characterFromHouse'

export const DIMENSION_IDS: readonly DimensionId[] = [
  'geographicRigidity',
  'renovationTolerance',
  'personalizationAppetite',
  'turnkeyNeed',
  'characterFromHouse',
]

/**
 * The attribute registry.
 *
 * Deliberately not exhaustive. Every attribute here must be reachable from at
 * least one answer — the result only ever speaks about things the buyer
 * actually signalled. A tool that lectures someone about a category they never
 * raised is imposing a theory, which is the opposite of the point.
 */
export const ATTRIBUTES: readonly Attribute[] = [
  // Hard — the lot and everything around it.
  { id: 'light', label: 'Natural light', changeability: 'hard' },
  { id: 'privacy', label: 'Privacy', changeability: 'hard' },
  { id: 'outdoor', label: 'Usable outdoor space', phrase: 'outdoor space you would use', changeability: 'hard' },
  { id: 'lot', label: 'The lot itself', changeability: 'hard' },
  { id: 'street', label: 'The street and the noise', phrase: 'the street', changeability: 'hard' },
  { id: 'proximity', label: 'Being close to the people you see constantly', phrase: 'staying close to your people', changeability: 'hard' },
  { id: 'convenience', label: 'Getting daily life done easily', phrase: 'everyday convenience', changeability: 'hard' },
  { id: 'view', label: 'The view', changeability: 'hard' },
  { id: 'expansion', label: 'Room to add on later', phrase: 'room to add on later', changeability: 'hard' },

  // Major — technically possible, rarely done.
  { id: 'layout', label: 'The layout', changeability: 'major' },
  { id: 'size', label: 'Enough square footage', phrase: 'having enough space', changeability: 'major' },
  { id: 'ceilings', label: 'Ceiling height', changeability: 'major' },
  /*
   * A kitchen is NOT an easy change, and classing it as one is how a model
   * ends up telling a buyer who said "I will never redo it" that they are
   * being flexible. Cost, permits and months of a missing kitchen put it
   * firmly with the structural work.
   */
  { id: 'kitchen', label: 'A kitchen you do not have to redo', phrase: 'the kitchen', changeability: 'major' },

  // Easy — and easy is not the same as unimportant.
  { id: 'condition', label: 'Move-in condition', changeability: 'easy' },
  { id: 'finishes', label: 'Finishes and fixtures', changeability: 'easy' },
  { id: 'character', label: 'Character you can see on arrival', phrase: 'character', changeability: 'easy' },
]

export function attributeById(id: string): Attribute | undefined {
  return ATTRIBUTES.find((attribute) => attribute.id === id)
}

/** Where an attribute lands in the result. */
export type Bucket =
  /** Demonstrated it matters. Stay strict here. */
  | 'protect'
  /** Not shouted about, but difficult or impossible to manufacture later. */
  | 'getPicky'
  /** Genuinely flexible. Real room to trade. */
  | 'room'
  /** Easy to change, and this buyer wants to be the one who changes it. */
  | 'makeItYours'

export type Importance = 'high' | 'medium' | 'low'

/** Accumulated points, before tiering. Weights live in the question set. */
export const IMPORTANCE_THRESHOLDS = { high: 3, medium: 1 } as const

export function importanceOf(points: number): Importance {
  if (points >= IMPORTANCE_THRESHOLDS.high) return 'high'
  if (points >= IMPORTANCE_THRESHOLDS.medium) return 'medium'
  return 'low'
}
