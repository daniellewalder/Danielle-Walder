/**
 * Every word the brief can say.
 *
 * ONE PLACE FOR COPY. The engine produces ids; this turns ids into English.
 * Nothing else in the renderer may contain a sentence, so changing the voice
 * never means touching a frozen layer, and a new engine id shows up as a
 * missing phrase rather than as silently absent prose.
 *
 * TWO REGISTERS, ONE MEANING. `agent` is how Danielle would write it in her
 * own notes. `buyer` is the same fact in first person, and it exists only
 * where the shift actually reads better. It is never a different conclusion.
 *
 * WHAT IS NOT ALLOWED IN HERE: anything about the market. No phrase may say a
 * kind of house is rare, tends to lack something, photographs badly or is
 * where the value is. The brief reasons from the buyer and has researched no
 * inventory at all.
 */

export interface Phrase {
  agent: string
  /** First person. Falls back to `agent` when the shift adds nothing. */
  buyer?: string
}

// ---------------------------------------------------------------------------
// Attributes, as search criteria
// ---------------------------------------------------------------------------

/** How each attribute reads in a filter list. Short, concrete, a search term. */
export const CRITERION: Readonly<Record<string, string>> = {
  light: 'real natural light',
  privacy: 'privacy',
  outdoor: "outdoor space they'd actually use",
  street: 'a street they can live with',
  site: 'the site itself',
  proximity: 'staying close to their people',
  convenience: 'everyday convenience',
  architecturalCharacter: 'architectural character',
  layout: 'a layout that works as built',
  size: 'enough space',
  separation: 'somewhere to close a door',
  publicRooms: 'living space that works for how they cook and host',
  kitchen: "a kitchen they don't have to redo",
  condition: 'move-in condition',
  circulation: 'stairs and circulation',
  utility: 'where everyday life goes',
  parking: 'parking and access',
  upkeep: 'upkeep they can live with',
}

/** The same, in first person. */
export const CRITERION_BUYER: Readonly<Record<string, string>> = {
  light: 'real natural light',
  privacy: 'privacy',
  outdoor: "outdoor space I'd actually use",
  street: 'a street I can live with',
  site: 'the site itself',
  proximity: 'staying close to my people',
  convenience: 'everyday convenience',
  architecturalCharacter: 'architectural character',
  layout: 'a layout that works as built',
  size: 'enough space',
  separation: 'somewhere to close a door',
  publicRooms: 'living space that works for how I cook and host',
  kitchen: "a kitchen I don't have to redo",
  condition: 'move-in condition',
  circulation: 'stairs and circulation',
  utility: 'where everyday life goes',
  parking: 'parking and access',
  upkeep: 'upkeep I can live with',
}

/** What a qualifier adds to its attribute. Used only where it sharpens. */
export const QUALIFIER_CRITERION: Readonly<Record<string, string>> = {
  'site:land': 'the land itself, slope and usable ground',
  'site:sits': 'how the house sits on the lot',
  'site:neighbours': "what's built right next to it",
  'site:access': 'getting in and out',
  'site:whole': 'the site as a whole',
  'utility:laundry': 'somewhere real for laundry',
  'utility:storage': 'actual storage',
  'utility:pantry': 'pantry function',
  'utility:all': 'laundry, storage and pantry',
  'parking:offstreet': 'off-street parking',
  'parking:garage': 'a garage',
  'parking:access': 'the driveway and getting in and out',
  'parking:charging': 'EV charging',
  'upkeep:pool': 'a pool',
  'upkeep:planting': 'planting and landscape',
  'upkeep:amount': 'how much property there is',
  'upkeep:general': 'general maintenance',
}

// ---------------------------------------------------------------------------
// Levers
// ---------------------------------------------------------------------------

/** What can move, and what moving it means. Never "be flexible". */
export const LEVER: Readonly<Record<string, Phrase>> = {
  geography: {
    agent: 'Widen the area before you widen anything about the house.',
    buyer: 'The area. I have more room on where than on what.',
  },
  condition: {
    agent: 'A house that needs work is fair game. The work is on the table.',
    buyer: 'A house that needs work is fine by me.',
  },
  cosmeticFinish: {
    agent: 'The finish. Paint, paper and lighting are theirs to change anyway.',
    buyer: "The finish. Paint, paper and lighting I'll change anyway.",
  },
  sizeRoute: {
    agent: 'How the space gets there, not how much of it there is. The amount stays fixed.',
    buyer: 'How I get the space, not how much of it I need.',
  },
}

/**
 * The four search dimensions, as opposed to the buyer's own criteria.
 *
 * The snapshot's asymmetry has to be between two of THESE. Contrasting a lever
 * against a dealbreaker produces both nonsense ("use the map before asking
 * them to take on natural light") and a sentence the buyer could have written
 * themselves, which is the no-shit-sherlock line.
 */
export const SEARCH_DIMENSIONS: readonly string[] = [
  'geography',
  'condition',
  'cosmeticFinish',
  'sizeRoute',
]

/**
 * What leading with a dimension actually means, per dimension.
 *
 * "I would use a renovation" does not read. Each dimension gets the verb that
 * fits it, for the same reason the negative side below does.
 */
export const THE_GIVE: Readonly<Record<string, Phrase>> = {
  geography: { agent: 'widen the map', buyer: 'widen the map' },
  condition: {
    agent: 'look at houses that need work',
    buyer: 'look at houses that need work',
  },
  cosmeticFinish: { agent: 'look at plain houses', buyer: 'look at plain houses' },
  sizeRoute: {
    agent: 'look at how the space could get there',
    buyer: 'look at how I could get the space',
  },
}

/**
 * What NOT leading with a dimension actually means, per dimension.
 *
 * One template cannot cover these. You take on a renovation, you move someone
 * off a map, and you offer a plain house; they are different relations and a
 * single verb makes at least two of them read as gibberish.
 */
export const NOT_THE_GIVE: Readonly<Record<string, Phrase>> = {
  // The agent side follows "before", so it is a gerund. The buyer side follows
  // "I'd rather X than", so it is a bare infinitive. Mixing them produced
  // "I'd rather look at houses that need work than assuming I can add space".
  condition: {
    agent: 'asking them to take on a renovation',
    buyer: 'take on a renovation',
  },
  cosmeticFinish: {
    agent: 'offering a plain house as the compromise',
    buyer: 'settle for a plain house',
  },
  geography: {
    agent: 'moving them off the map',
    buyer: 'move off the map',
  },
  sizeRoute: {
    agent: 'assuming the space can be created later',
    buyer: 'assume I can add the space later',
  },
}

/** A protected attribute offered as the softest give. */
export const LEVER_FALLBACK = (criterion: string, buyer: string): Phrase => ({
  agent: `${criterion.charAt(0).toUpperCase()}${criterion.slice(1)}, which is the softest thing they named.`,
  buyer: `${buyer.charAt(0).toUpperCase()}${buyer.slice(1)}, which is what I'd give on first.`,
})

/** Why a lever is off the table. Buyer evidence, never our own gap. */
export const VETO: Readonly<Record<string, Phrase>> = {
  /*
   * Written to read inside a list: "the map does not move, renovation is out
   * and the rest are outright dealbreakers". Each has to work as a clause on
   * its own, which is why none of them starts with a subject.
   */
  isDealbreaker: { agent: 'the rest are outright dealbreakers', buyer: 'the rest are my dealbreakers' },
  hardFiltered: { agent: 'it is already eliminating listings' },
  operational: { agent: 'it gets checked per house rather than traded' },
  fixedGeography: { agent: 'the map does not move', buyer: 'the map does not move' },
  geographyAlreadyOpen: { agent: 'the area is already open', buyer: 'the area is already open' },
  lowRenovation: { agent: 'renovation is out', buyer: "I'm not renovating" },
  unresolvedProject: { agent: 'project appetite is still unsettled' },
  noCosmeticAppetite: {
    agent: "they'd rather the look already worked",
    buyer: "I'd rather the look already worked",
  },
  limitedCosmeticAppetite: {
    agent: "decorating is not the point for them",
    buyer: 'decorating is not really the point for me',
  },
  noStructuralRoute: { agent: 'no structural route was established' },
  sizeMustExistAlready: {
    agent: 'the space has to be there already',
    buyer: 'the space has to be there already',
  },
  renovationNotEstablished: { agent: 'the renovation question was never answered' },
  personalizationNotEstablished: { agent: 'the finish question was never answered' },
}

/**
 * Vetoes a reader cares about, in the order they are worth quoting.
 *
 * `hardFiltered` and `operational` are left out on purpose. Both are true, and
 * both are about how the engine works rather than about anything the buyer
 * said, so quoting them turns a brief into a tour of our own plumbing.
 */
export const BUYER_DECISION_VETOES: readonly string[] = [
  'fixedGeography',
  'lowRenovation',
  'sizeMustExistAlready',
  'isDealbreaker',
  'noCosmeticAppetite',
  'limitedCosmeticAppetite',
]

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Kinds of listing not to dismiss too early. */
export const SECOND_LOOK: Readonly<Record<string, Phrase>> = {
  'secondLook.cosmeticallyPlain': {
    agent: "Plain inside but right everywhere else. They're repainting regardless.",
    buyer: "Plain inside but right everywhere else. I'm repainting anyway.",
  },
  'secondLook.datedButSound': {
    agent: 'Dated, as long as the plan and the site are good. That part is fixable.',
    buyer: 'Dated, as long as the plan and the site are good. That part I can fix.',
  },
  'secondLook.architecturalButUnstyled': {
    agent: 'Good bones, bad styling. The architecture is what has to be there.',
    buyer: 'Good bones, bad styling. The architecture is the part I need.',
  },
  'secondLook.smallerWithPotential': {
    agent: 'Smaller than the target, where adding on looks genuinely possible.',
    buyer: 'Smaller than I want, if adding on is genuinely possible.',
  },
  'secondLook.badlyArrangedNotSmall': {
    agent: 'Badly arranged rather than actually too small. The area may be fine once the plan changes.',
    buyer: "Badly arranged rather than actually too small. I'd rework the plan.",
  },
}

/** Kinds of listing to stop spending time on. Phrased as houses, not criteria. */
export const SKIP: Readonly<Record<string, Phrase>> = {
  'reject.undersized': {
    agent: 'Anything under the target size. It has to be there on day one.',
    buyer: 'Anything under the size I need. It has to be there already.',
  },
  'reject.lacksArchitecturalCharacter': {
    agent: 'Houses with no architectural character. Staging will not supply it.',
    buyer: 'Houses with no character. Staging will not fix that.',
  },
  'reject.condition': {
    agent: 'Houses that need the kind of work they have ruled out.',
    buyer: "Houses that need the kind of work I've ruled out.",
  },
  'reject.kitchen': {
    agent: 'Houses where the kitchen would have to come out.',
    buyer: 'Houses where the kitchen would have to come out.',
  },
  'reject.layout': {
    agent: 'Houses where the plan only works after moving walls.',
    buyer: 'Houses where the plan only works after moving walls.',
  },
  'reject.size': {
    agent: 'Houses that are simply too small.',
    buyer: "Houses that are too small.",
  },
  'reject.separation': {
    agent: 'Open-plan houses with nowhere to close a door.',
    buyer: 'Open-plan houses with nowhere to close a door.',
  },
  'reject.publicRooms': {
    agent: 'Houses whose living space does not work for how they cook and host.',
    buyer: 'Houses whose living space does not work for how I cook and host.',
  },
  'reject.upkeep.pool': {
    agent: 'Houses with a pool to look after.',
    buyer: 'Houses with a pool to look after.',
  },
  'reject.upkeep.planting': {
    agent: 'Properties with planting that needs managing.',
    buyer: 'Properties with planting that needs managing.',
  },
  'reject.upkeep.amount': {
    agent: 'More property than they want to look after.',
    buyer: 'More property than I want to look after.',
  },
  'reject.upkeep.general': {
    agent: 'Houses with a lot of general maintenance attached.',
    buyer: 'Houses with a lot of general maintenance attached.',
  },
}

/** What to actually do at the showing. Specific to this buyer, never a checklist. */
export const SHOWING: Readonly<Record<string, Phrase>> = {
  'inspect.outdoorUsability': {
    agent: "Sit outside. Is there somewhere they'd actually use, or just square footage?",
    buyer: "Sit outside. Is there somewhere I'd actually use, or just square footage?",
  },
  'inspect.upkeep': { agent: 'Work out who looks after what, and how often.' },
  'inspect.upkeep~pool': {
    agent: 'Find out what the pool actually costs to run before anyone falls in love with it.',
    buyer: 'Find out what the pool really costs to run.',
  },
  'inspect.upkeep~planting': {
    agent: 'Ask what the planting needs. Who cuts it, and how often.',
    buyer: 'Ask what the planting needs, and who cuts it.',
  },
  'inspect.upkeep~amount': { agent: 'Walk the whole property and count what has to be maintained.' },
  'inspect.upkeep~general': { agent: 'Ask what has been deferred and what is coming up.' },
  'inspect.utility': { agent: 'Find out where everyday life actually goes in this house.' },
  'inspect.utility~laundry': { agent: 'Find the laundry. Is it somewhere they would use it?' },
  'inspect.utility~storage': { agent: 'Open the cupboards. Where does everything actually go?' },
  'inspect.utility~pantry': {
    agent: 'Where does the pantry overflow go? Look for the second place to put things.',
    buyer: 'Where does the pantry overflow go?',
  },
  'inspect.utility~all': { agent: 'Laundry, storage, pantry. Check all three, not the kitchen photo.' },
  'inspect.parking': { agent: 'Check the arrival, not just the car count.' },
  'inspect.parking~offstreet': { agent: 'Confirm the off-street space is real and usable.' },
  'inspect.parking~garage': { agent: 'Look in the garage. Does a car fit, or is it storage?' },
  'inspect.parking~access': {
    agent: 'Try the driveway, not just the garage count.',
    buyer: 'Try the driveway, not just the garage count.',
  },
  'inspect.parking~charging': {
    agent: 'Check whether a charger can actually go in. Panel, run, and where the car sits.',
    buyer: 'Check whether a charger can actually go in.',
  },
  'inspect.circulation': {
    agent: 'Walk the stairs and the halls the way they would on an ordinary evening.',
    buyer: 'Walk the stairs the way I would on an ordinary evening.',
  },
  'inspect.siteFit': { agent: 'Walk the lot before you judge the house.' },
  'inspect.siteFit~land': {
    agent: 'Walk the lot. Slope, shape, and which parts are actually usable.',
    buyer: 'Walk the lot. Slope, shape, and what I could actually use.',
  },
  'inspect.siteFit~sits': {
    agent: 'Stand back. How does the house actually sit on this lot?',
    buyer: 'How does the house actually sit on the lot?',
  },
  'inspect.siteFit~neighbours': {
    agent: "Look at what's built next door, from inside the house.",
    buyer: "Look at what's next door, from inside the house.",
  },
  'inspect.siteFit~access': { agent: 'Arrive the way they would. Driveway, gate, the last fifty feet.' },
  'inspect.siteFit~whole': { agent: 'Walk the whole site before you form a view of the house.' },
  'inspect.characterIsStructural': {
    agent: 'Check the character is in the building, not in the furniture.',
    buyer: 'Check the character is in the building, not the furniture.',
  },
  'inspect.expansionFeasibility': {
    agent: 'If it is small, find out what adding on would actually involve here.',
    buyer: 'If it is small, find out what adding on would involve.',
  },
  'inspect.areaCanBeRearranged': {
    agent: 'Where are the walls that matter? Work out whether the plan can change without an addition.',
    buyer: 'Can the plan change without adding on?',
  },
  'inspect.sizeSolvableHere': {
    agent: 'Decide the size question in the house, not on the listing.',
    buyer: "I'd want to decide the size question in the house, not on the listing.",
  },
  'inspect.firstRejection': {
    agent: 'Take them to two or three very different houses and watch what they rule out.',
    buyer: "Show me a few very different houses. I'll learn what I don't want faster that way.",
  },
  'inspect.size.correctable': {
    agent: 'Is it too small, or just badly arranged? Those are different problems.',
    buyer: 'Is it too small, or just badly arranged?',
  },
  'inspect.layout.correctable': {
    agent: 'Find out which walls are structural before calling the plan fixable.',
    buyer: 'Which walls are structural? That decides whether the plan is fixable.',
  },
  'inspect.separation.correctable': {
    agent: 'Could a door go in where they need one, or is it open by construction?',
    buyer: 'Could a door go in where I need one?',
  },
  'inspect.publicRooms.correctable': {
    agent: 'Walk the main rooms the way they cook and host, then ask what it would take.',
    buyer: 'Walk the main rooms the way I cook and host.',
  },
}

/** False equivalences, phrased as a sentence rather than an equation. */
export const NO_SUBSTITUTE: Readonly<Record<string, Phrase>> = {
  'outdoor/largeYard': {
    agent: 'A big yard is not usable outdoor space. Square footage outside is not the same as somewhere to sit.',
    buyer: 'A big yard is not the same as somewhere I would actually sit.',
  },
  'architecturalCharacter/staging': {
    agent: 'Staging is not character. If it would leave with the furniture, it does not count.',
    buyer: 'Staging is not character. If it leaves with the furniture, it does not count.',
  },
  'layout/newKitchen': {
    agent: 'A new kitchen is not a good plan. A renovated kitchen in the wrong place is still in the wrong place.',
    buyer: 'A new kitchen is not the same as a good plan.',
  },
}

/** The one tension worth watching. Never a prediction about a specific house. */
export const TRADEOFF: Readonly<Record<string, Phrase>> = {
  bothProtectedAndOrderedByForcedChoice: {
    agent: 'Both still matter. This is just the pair most likely to come up first when real houses start forcing a choice.',
    buyer: 'Both still matter to me. This is just the pair most likely to come up first.',
  },
  wantsTheOutsideButNotTheMaintenance: {
    /*
     * "the work that usually comes attached" was a claim about houses in
     * general, which is the market layer we do not have. This says only what
     * they told us and what to do about it.
     */
    agent: 'They want the outside and they do not want to look after it. Watch which way they lean when a real house makes them pick.',
    buyer: 'I want the outside without wanting to look after it.',
  },
}

/** Questions that could still change the search. Never a list of unknowns. */
export const UNRESOLVED: Readonly<Record<string, Phrase>> = {
  renovationAppetite: {
    agent: 'How much work they would really take on. It changes what is worth showing.',
    buyer: "How much work I'd really take on.",
  },
  whatWouldGive: {
    agent: 'What they would give on when a house makes them choose. Nothing has settled it yet.',
    buyer: "What I'd give on when a house makes me choose.",
  },
  mustSpaceExistAlready: {
    agent: 'Whether the space has to exist now or could be created. It decides what even counts as a candidate.',
    buyer: 'Whether the space has to be there already, or could be added.',
  },
  firstFilter: {
    agent: 'What the first real filter is. Nothing narrow enough has come out yet.',
    buyer: 'What my first real filter is.',
  },
}

/** Functional requirements. Factual, never analysis. */
export const PROGRAM: Readonly<Record<string, string>> = {
  circulation: 'stairs and circulation that work',
  utility: 'somewhere for laundry, storage and the everyday',
  parking: 'parking that works',
  upkeep: 'upkeep they can live with',
}

export const PROGRAM_QUALIFIED: Readonly<Record<string, string>> = {
  'utility:laundry': 'laundry',
  'utility:storage': 'storage',
  'utility:pantry': 'a pantry that works',
  'utility:all': 'laundry, storage and pantry',
  'parking:offstreet': 'off-street parking',
  'parking:garage': 'a garage',
  'parking:access': 'a driveway they can use',
  'parking:charging': 'EV charging',
  // Factual. "A pool is a maintenance question, not a feature" was analysis
  // wearing a checklist's clothes, and this section is not for analysis.
  'upkeep:pool': 'pool upkeep',
  'upkeep:planting': 'planting and landscape upkeep',
  'upkeep:amount': 'how much property there is to look after',
  'upkeep:general': 'general maintenance',
  'site:land': 'the land itself',
  'site:sits': 'how the house sits on the lot',
  'site:neighbours': 'what is built next door',
  'site:access': 'access they can live with',
  'site:whole': 'the site as a whole',
}

/** Handoff field labels. No interpretation anywhere in this section. */
export const FACT_LABEL: Readonly<Record<string, string>> = {
  price: 'Budget',
  ceiling: 'Hard ceiling',
  timing: 'Timing',
  considering: 'Looking at',
  ruledOut: 'Ruled out',
  schoolBoundary: 'Boundary to respect',
  destinations: 'Needs reasonable access to',
  types: 'Property type',
  minBeds: 'Minimum bedrooms',
  minBaths: 'Minimum bathrooms',
  minSqft: 'Minimum square footage',
  parking: 'Parking',
  stairs: 'Stairs',
  pool: 'Pool',
  ev: 'EV charging',
  other: 'Also',
  note: 'Note',
}

export const TIMING: Readonly<Record<string, string>> = {
  casual: 'looking, not in a hurry',
  thisYear: 'this year',
  active: 'actively looking now',
  specific: 'a specific date',
}

export const REQUIREMENT: Readonly<Record<string, string>> = {
  required: 'required',
  preferred: 'preferred',
  noPreference: 'no preference',
  no: 'not wanted',
  stepFreeNeeded: 'needs to be step-free',
  preferMinimal: 'prefers minimal stairs',
}

/** Discrepancies. Stated, never resolved. */
export const DISCREPANCY: Readonly<Record<string, Phrase>> = {
  'upkeep qualifier = pool|hardFilters.pool = required': {
    agent: 'The test has pool upkeep down as a burden. The search facts say a pool is required. Worth one question.',
    buyer: 'I flagged pool upkeep as a burden but also asked for a pool. Worth sorting out.',
  },
  'renovationTolerance = no|buyer note mentions major work': {
    agent: 'The test has renovation ruled out. The note mentions major work. Worth one question before you search on either.',
    buyer: 'I said no renovation but my note mentions major work. Worth sorting out.',
  },
}
