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
  /*
   * These are the scannable WHAT, with the reason attached. The snapshot is the
   * HOW, in prose, so the two sections are not the same sentence twice.
   */
  geography: {
    agent: 'Area. A few streets out from the preferred line is worth testing.',
    buyer: 'Area. A few streets out from where I said is worth a look.',
  },
  condition: {
    agent: 'Condition. Work on the house is on the table.',
    buyer: 'Condition. Work on the house is on the table.',
  },
  cosmeticFinish: {
    agent: 'Finishes. Paint, paper and lighting they are changing anyway.',
    buyer: "Finishes. Paint, paper and lighting I'm changing anyway.",
  },
  sizeRoute: {
    agent: 'How the square footage arrives, not how much of it they need.',
    buyer: 'How I get the square footage, not how much I need.',
  },
}

/**
 * The same four, varied by the situation that produced them.
 *
 * Geography is an available lever for most buyers, so one sentence for it
 * appeared in eleven of fifteen briefs. The engine already knows which kind of
 * movement this is: a preferred line with the right house just past it is not
 * the same instruction as a set of areas that already work. Keyed
 * `lever|map|rank`, falling back to `LEVER`.
 */
export const LEVER_BY_SITUATION: Readonly<Record<string, Phrase>> = {
  'geography|strongPreference|1': {
    agent: 'Area. They have a line they prefer. The right house just past it should still get shown.',
    buyer: 'Area. I have a line I prefer, but the right house just past it should still get shown to me.',
  },
  'geography|strongPreference|2': {
    agent: 'Area. If nothing else opens it up, a few streets past the preferred line.',
    buyer: 'Area. If nothing else opens it up, a few streets past my preferred line.',
  },
  'geography|fewAreas|1': {
    agent: 'Area. More than one neighbourhood already works, so stretch inside that set before anything else.',
    buyer: 'Area. More than one neighbourhood already works for me, so stretch that set first.',
  },
  'geography|fewAreas|2': {
    agent: 'Area. If nothing else opens it up, the neighbourhoods that already work can stretch.',
    buyer: 'Area. If nothing else opens it up, the neighbourhoods that already work can stretch.',
  },
  'condition|2': {
    agent: 'Condition. If the finishes alone are not enough, real work is on the table too.',
    buyer: 'Condition. If the finishes alone are not enough, real work is on the table too.',
  },
}

/** A protected attribute offered as the softest give. */
export const LEVER_FALLBACK = (criterion: string, buyer: string): Phrase => ({
  agent: `Of everything they named, ${criterion} is the one I would push on first.`,
  buyer: `Of everything on my list, ${buyer} is the one I'd push on first.`,
})

/**
 * The four search dimensions, as opposed to the buyer's own criteria.
 *
 * The opening instruction has to be about one of THESE. A dealbreaker is not a
 * compromise anyone was going to offer, so naming one produces a sentence the
 * buyer already knows.
 */
export const SEARCH_DIMENSIONS: readonly string[] = [
  'geography',
  'condition',
  'cosmeticFinish',
  'sizeRoute',
]

/**
 * The opening instruction, keyed by what can move and what cannot.
 *
 * NOT A TEMPLATE. "X has room in it, Y does not" read like a strategy memo and
 * made every buyer sound alike, so each pair gets the sentence Danielle would
 * actually say. A `first|blocked` key is preferred over the bare `first`.
 */
export const LEAD: Readonly<Record<string, Phrase>> = {
  geography: {
    agent: 'I would look a little outside the preferred area before asking them to drop anything they said they needed.',
    buyer: "I'd look a little outside my preferred area before dropping anything I said I needed.",
  },
  'geography|condition': {
    agent: 'I would look a little outside the preferred area before taking on a house that needs real work.',
    buyer: "I'd look a little outside my preferred area before taking on a house that needs real work.",
  },
  'geography|cosmeticFinish': {
    agent: 'I would look a little outside the preferred area. A house that just looks plain is not the compromise they want.',
    buyer: "I'd look a little outside my preferred area. A house that just looks plain isn't the compromise I want.",
  },
  'geography|sizeRoute': {
    agent: 'I would look a little outside the preferred area. The square footage has to be there already.',
    buyer: "I'd look a little outside my preferred area. The square footage has to be there already.",
  },
  condition: {
    agent: 'They are open to doing work, so a house that needs updating is worth showing.',
    buyer: "I'm open to doing work, so a house that needs updating is worth seeing.",
  },
  'condition|cosmeticFinish': {
    agent: 'They are open to doing work. Decorating is not the draw, so a house that needs something structural will land better than one that just needs painting.',
    buyer: "I'm open to doing work. Decorating isn't the draw, so a house that needs something structural suits me better than one that just needs painting.",
  },
  'condition|geography': {
    // Two facts and no instruction was a recap. The useful half is what to put
    // in front of them inside a boundary that is not moving.
    agent: 'The area stays where it is. Inside that line I would show them houses that need something done rather than waiting for a finished one.',
    buyer: "My area stays where it is. Inside it I'd rather see houses that need something done than wait for a finished one.",
  },
  cosmeticFinish: {
    agent: 'I would not rule out a house because the paint, the lighting or the finishes are boring.',
    buyer: "I wouldn't rule out a house because the paint, the lighting or the finishes are boring.",
  },
  'cosmeticFinish|condition': {
    agent: 'I would not rule out a house because the paint, the lighting or the finishes are boring. Anything that needs real work is a different conversation.',
    buyer: "I wouldn't rule out a house because the paint, the lighting or the finishes are boring. Anything that needs real work is a different conversation.",
  },
  'cosmeticFinish|geography': {
    agent: 'I would not rule out a house because the finishes are boring. The area itself stays where it is.',
    buyer: "I wouldn't rule out a house because the finishes are boring. The area stays where it is.",
  },
}

/** The dimension as a short noun, for "the only part I would push on". */
export const PUSH_ON: Readonly<Record<string, Phrase>> = {
  geography: { agent: 'the area', buyer: 'the area' },
  condition: { agent: 'the condition', buyer: 'the condition' },
  cosmeticFinish: { agent: 'the finishes', buyer: 'the finishes' },
  sizeRoute: { agent: 'how the square footage arrives', buyer: 'how I get the square footage' },
}

/** When geography is not a lever because the buyer already opened it. */
export const PROPERTY_LED: Phrase = {
  agent: 'I would search for the house first and treat the area as the wider field.',
  buyer: "I'd look for the house first and treat the area as the wider field.",
}

/** The next thing to try, once the first is exhausted. */
export const SECOND: Readonly<Record<string, Phrase>> = {
  geography: {
    agent: 'If that still does not open enough up, the area is the next thing I would test.',
    buyer: "If that doesn't open enough up, the area is the next thing I'd test.",
  },
  condition: {
    agent: 'If that is not enough, houses that need real work are the next thing to put in front of them.',
    buyer: "If that isn't enough, houses that need real work are next.",
  },
  cosmeticFinish: {
    agent: 'If that is not enough, I would stop screening on how finished a house looks.',
    buyer: "If that isn't enough, I'd stop screening on how finished a house looks.",
  },
}

/**
 * The four size routes, as four visibly different searches.
 *
 * Each leads the snapshot when it is set, because what a buyer will do about a
 * house that is too small changes more about the search than anything else
 * they told us.
 */
export const SIZE_ROUTE_LEAD: Readonly<Record<string, Phrase>> = {
  existingOnly: {
    agent: 'They are open to work, just not as a way to create the square footage. I would look at houses that need updating, but I would not keep an undersized house in play hoping it can grow.',
    buyer: "I'm open to work, just not as a way to create the square footage. Houses that need updating are fine. An undersized one is not.",
  },
  additionOkay: {
    agent: 'The house does not have to be big enough today. If the property is otherwise right, I would keep a smaller one in play long enough to find out whether adding on is realistic.',
    buyer: "The house doesn't have to be big enough today. If it's otherwise right, I'd want to find out whether adding on is realistic before ruling it out.",
  },
  reconfigureOkay: {
    agent: 'I would not chase more square footage just because the plan is bad. If the area is there, a badly arranged house is still worth looking at.',
    buyer: "I don't need more square footage just because the plan is bad. If the area is there, a badly arranged house is still worth seeing.",
  },
  propertySpecific: {
    agent: 'I would not make the size call from the listing. This is one they have to stand in to know whether the house could work.',
    buyer: "I can't make the size call from a listing. I'd have to stand in it.",
  },
}

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
    agent: 'Watch which way they lean when a real house makes them pick between the two.',
    buyer: 'Watch which way I lean when a real house makes me pick.',
  },
}

/** Questions that could still change the search. Never a list of unknowns. */
export const UNRESOLVED: Readonly<Record<string, Phrase>> = {
  renovationAppetite: {
    agent: 'How much work they would really take on. It changes what is worth showing.',
    buyer: "How much work I'd really take on.",
  },
  whatWouldGive: {
    // "What they would give on" put the engine's word for a lever in front of
    // the reader. "Bend on" is what an agent would actually say.
    agent: 'What they would actually bend on when a house forces the choice. Nothing has settled that yet.',
    buyer: "What I'd actually bend on when a house forces the choice.",
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
