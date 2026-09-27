import { phraseFor, type Attribute } from './model.ts'
import { QUESTIONS } from './questions.ts'
import { HIGH, LOW, achievableRange, type ReadAttribute, type Result, type Scales } from './score.ts'

/**
 * The Tuesday Test — interpretation layer.
 *
 * COPY STATUS: a draft in Danielle's register, awaiting her line edit.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE. Nobody answers seven questions to be
 * handed a formatted transcript of their own clicks. Every sentence that
 * reaches the top of the result has to do at least one of these:
 *
 *   1. combine two or more signals
 *   2. name a tension between signals
 *   3. derive a consequence for how the search should run
 *   4. identify something the buyer can reject faster
 *   5. identify something the buyer may be rejecting too quickly
 *   6. name the most important thing still unresolved
 *   7. turn an abstract priority into something to verify at a showing
 *
 * A sentence that restates one clicked answer belongs in the brief at the
 * bottom of the page, not in the interpretation.
 *
 * WHAT THIS FILE IS NOT ALLOWED TO DO. The evidence model underneath is
 * unchanged and stays unchanged: unknown is not flexible, permanence is not
 * importance, the loser of a tradeoff takes no penalty, personalization is not
 * renovation tolerance, and the map's strength is never read as its reason.
 * This layer only decides what to SAY about that evidence, and it never
 * exposes a model state just because we happened to calculate it.
 */

// ---------------------------------------------------------------------------
// Signals: the compressed vocabulary the rules are allowed to speak.
// ---------------------------------------------------------------------------

/**
 * A scale reading. `unset` is the important one: if no answered question could
 * have moved a scale, it sits at the midpoint, and calling that "conditional"
 * would be the scale-level version of treating unknown as flexible.
 */
export type Band = 'yes' | 'conditional' | 'no' | 'unset'

const SPATIAL = ['size', 'layout', 'separation', 'publicRooms', 'ceilings']
const SITE = ['lot', 'privacy', 'light', 'street', 'view', 'outdoor']
const CONDITION = ['condition', 'kitchen']
const LOGISTICS = ['proximity', 'convenience', 'circulation', 'utility', 'parking', 'upkeep']

export interface Signals {
  answered: number
  mapTight: boolean
  mapSemi: boolean
  mapOpen: boolean
  mapKnown: boolean
  renovation: Band
  personalization: Band
  architecture: Band
  dayOne: Band
  upkeep: Band
  /** Protected, grouped. An attribute appears in exactly one of these. */
  spatial: readonly ReadAttribute[]
  site: readonly ReadAttribute[]
  condition: readonly ReadAttribute[]
  logistics: readonly ReadAttribute[]
  character: boolean
  /** Everything protected, cosmetic included, so a count in the copy matches
   *  the list the reader can see underneath it. */
  protectedCount: number
  protectedIds: ReadonlySet<string>
  scrutinizeIds: ReadonlySet<string>
  unknownIds: ReadonlySet<string>
  /**
   * How many protected things the property itself has to deliver. Cosmetic
   * attributes are excluded on purpose: wanting character is not a constraint
   * on inventory in the way that wanting a flat lot is.
   */
  specificity: number
  tradedPermanently: readonly ReadAttribute[]
  conflictUnresolved: boolean
  declinedTheTrade: boolean
}

function scaleInPlay(scale: keyof Scales, answered: ReadonlySet<string>): boolean {
  return QUESTIONS.some(
    (question) =>
      answered.has(question.id) &&
      question.options.some((option) => (option.scales?.[scale] ?? 0) !== 0),
  )
}

function bandOf(scale: keyof Scales, result: Result, answered: ReadonlySet<string>): Band {
  if (!scaleInPlay(scale, answered)) return 'unset'
  const value = result.scales[scale]

  /*
   * A ONE-SIDED SCALE AT ITS UNTOUCHED END IS NOT A READING.
   *
   * Only one option in the whole test moves operational burden, and it moves
   * it downwards. Someone who did not pick it therefore normalises to 1.0,
   * and the tool would have concluded "happy to look after a large property"
   * from an answer nobody gave. That is exactly the unknown-as-flexible error
   * the model exists to prevent, so a scale that could only have moved one
   * way, and did not move, reads as unset.
   */
  const { min, max } = achievableRange(scale, answered)
  if (max === 0 && value >= 1) return 'unset'
  if (min === 0 && value <= 0) return 'unset'

  if (value >= HIGH) return 'yes'
  if (value <= LOW) return 'no'
  return 'conditional'
}

export function signalsOf(result: Result): Signals {
  const answered = new Set(result.answeredQuestionIds)
  const held = (ids: readonly string[]) =>
    result.attributes.filter(
      (entry) => entry.state === 'protect' && ids.includes(entry.attribute.id),
    )

  const protectedIds = new Set(
    result.attributes.filter((entry) => entry.state === 'protect').map((e) => e.attribute.id),
  )
  const architecture = bandOf('architecturalRequirement', result, answered)

  const spatial = held(SPATIAL)
  const site = held(SITE)
  const condition = held(CONDITION)
  const logistics = held(LOGISTICS)

  return {
    answered: result.answered,
    mapTight: result.findings.map === 'fixed',
    mapSemi: result.findings.map === 'strongPreference',
    mapOpen: result.findings.map === 'fewAreas' || result.findings.map === 'propertyLed',
    mapKnown: result.findings.map !== null,
    renovation: bandOf('renovationTolerance', result, answered),
    personalization: bandOf('personalizationAppetite', result, answered),
    architecture,
    dayOne: bandOf('dayOneReadiness', result, answered),
    upkeep: bandOf('operationalBurdenTolerance', result, answered),
    spatial,
    site,
    condition,
    logistics,
    character: architecture === 'yes' || protectedIds.has('character'),
    protectedCount: protectedIds.size,
    protectedIds,
    scrutinizeIds: new Set(
      result.attributes.filter((e) => e.state === 'scrutinize').map((e) => e.attribute.id),
    ),
    unknownIds: new Set(result.unknowns.map((attribute) => attribute.id)),
    specificity: spatial.length + site.length + condition.length,
    tradedPermanently: result.attributes.filter((entry) => entry.tradedAwayPermanently),
    conflictUnresolved: result.findings.tensions.includes('readinessVersusRenovation'),
    declinedTheTrade: result.findings.tensions.includes('narrowCriteria'),
  }
}

// ---------------------------------------------------------------------------
// Compression: how a cluster of protected attributes is said in one phrase.
//
// This is the difference between a synthesis and a transcript. "Having enough
// space, living space that works for how you cook and host and somewhere to
// close a door" is the buyer's own three clicks read back. "Space and the way
// the house functions" is the same finding said once, as a category, which is
// what makes the next clause able to draw a conclusion from it.
// ---------------------------------------------------------------------------

function has(entries: readonly ReadAttribute[], id: string): boolean {
  return entries.some((entry) => entry.attribute.id === id)
}

function spatialPhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  const size = has(entries, 'size') || has(entries, 'ceilings')
  const works = has(entries, 'layout') || has(entries, 'publicRooms') || has(entries, 'separation')
  if (size && works) return 'space and the way the house functions'
  if (size) return 'having enough space'
  if (works) return 'the way the house functions'
  return null
}

function sitePhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  const quiet = has(entries, 'privacy') || has(entries, 'street')
  const open = has(entries, 'light') || has(entries, 'outdoor') || has(entries, 'view')
  const ground = has(entries, 'lot')
  if (quiet && open) return 'light, privacy and what the property is surrounded by'
  if (ground && open) return 'the lot and what it gives you'
  if (quiet) return 'privacy and what the street is doing'
  if (open) return 'light and somewhere to be outside'
  if (ground) return 'the lot itself'
  return null
}

function conditionPhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  return has(entries, 'condition') ? 'a house that arrives finished' : 'not taking on the kitchen'
}

function logisticsPhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  const near = has(entries, 'proximity') || has(entries, 'convenience')
  const daily = entries.some((entry) => entry.attribute.operational)
  if (near && daily) return 'staying close to your life and not fighting the house to run it'
  if (near) return 'staying close to your people and your routine'
  if (daily) return 'the ordinary logistics of running the place'
  return null
}

/** The one or two categories to name. Never more, and never a list of clicks. */
function topicPhrase(signals: Signals): string | null {
  const parts = [
    spatialPhrase(signals.spatial),
    sitePhrase(signals.site),
    conditionPhrase(signals.condition),
    logisticsPhrase(signals.logistics),
  ].filter((part): part is string => part !== null)
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]
  // Two cluster phrases already contain "and" of their own, so joining them
  // with another one produces a sentence nobody can parse. A comma does it.
  return `${parts[0]}, plus ${parts[1]}`
}


function labels(entries: readonly ReadAttribute[], limit = 3): string {
  const phrases = entries.slice(0, limit).map((entry) => phraseFor(entry.attribute))
  if (phrases.length === 0) return ''
  if (phrases.length === 1) return phrases[0]
  return `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`
}

// ---------------------------------------------------------------------------
// Combinations. Each one is a conclusion drawn from two or more signals, plus
// what it means for the way the search should run. Ordered by how much the
// conclusion changes what someone should do next, not by how strong any single
// attribute scored: a headline generated from one high attribute is the
// transcript problem wearing a hat.
// ---------------------------------------------------------------------------

export interface Combination {
  id: string
  headline: string
  /** One sentence. Must reference at least two signals. */
  evidence: string
  /** One or two sentences. Must say what to do differently. */
  consequence: string
  /** The compressed form, for the second paragraph when this is not the lead. */
  aside: string
  /**
   * What this combination is about. When the runner-up is about the same thing
   * as the open question, the second paragraph would say "renovation appetite
   * is unsettled, but the bigger question is renovation appetite", so the
   * aside is dropped and the open question speaks for itself.
   */
  topic: string
}

type Rule = { id: string; when: (s: Signals) => boolean; build: (s: Signals) => Omit<Combination, 'id'> }

const RULES: readonly Rule[] = [
  {
    // Nothing else is actionable until these get ranked. A buyer holding six
    // priorities does not need a sixth observation, they need to find out
    // which two they would give up, and only a real house does that.
    id: 'everythingProtected',
    when: (s) => s.specificity >= 5,
    build: (s) => ({
      headline: 'Almost everything came back as a priority.',
      evidence: `${spell(s.protectedCount)} separate things came back as priorities, across ${partsOfHouse(s)}.`,
      consequence:
        "That's a wish list rather than a filter, and it will behave like one the moment you start seeing houses. The useful next step is finding the two you'd actually give up, which happens standing in a real house and nowhere else.",
      aside: 'almost everything came back as a priority',
      topic: "what you'd trade",
    }),
  },
  {
    // The narrowest search the test can produce: condition and geography are
    // both closed. Telling this buyer to be flexible is advice for someone else.
    id: 'finishedAndFixed',
    when: (s) => s.dayOne === 'yes' && s.mapTight,
    build: () => ({
      headline: 'This is a deliberately small search.',
      evidence: "You want a house that's already finished, and your map doesn't move.",
      consequence:
        "Two of the three levers are down before we start, so the inventory is genuinely narrow and searching harder won't widen it. The question isn't whether condition or geography gives, it's which secondary preference you'd let go first when the right house is otherwise there.",
      aside: 'condition and the map are both closed',
      topic: 'condition',
    }),
  },
  {
    id: 'bonesThenLayers',
    when: (s) => s.character && s.personalization === 'yes',
    build: () => ({
      headline: 'The bones have to be right before you make it yours.',
      evidence:
        'You want architecture the house already has, and you still expect to put your own layer on top of it.',
      consequence:
        "Those are one taste, not two, but listings blur them constantly. A blank new build isn't a blank slate: if the architecture itself leaves you cold, nothing you add afterwards rescues it.",
      aside: 'the house has to bring the architecture you then build on',
      topic: 'character',
    }),
  },
  {
    id: 'decorateNotRenovate',
    when: (s) => s.personalization === 'yes' && s.renovation === 'no',
    build: () => ({
      headline: "You'll decorate. You won't renovate.",
      evidence:
        "You're happy to take a house that isn't styled yet, and clear that you're not taking one that needs building work.",
      consequence:
        "Those look identical in a listing and need separating at the door: dated finishes are an opportunity and shouldn't cost a house a viewing, while a floor plan or a kitchen that needs real work is a filter, not a project you'll get to.",
      aside: "the cosmetic layer is yours and the construction isn't",
      topic: 'condition',
    }),
  },
  {
    id: 'worksBeforeYours',
    when: (s) => s.dayOne === 'yes' && s.personalization === 'yes',
    build: () => ({
      headline: 'You want the house to work before you make it yours.',
      evidence:
        'Function and condition are things you want handled at purchase, and the cosmetic layer is the part you want to do yourself.',
      consequence:
        "That's narrower than it sounds, because it rules out the project house and the fully styled one at the same time. What fits is finished and plain, which photographs badly and is usually priced for it.",
      aside: 'it has to work on arrival and the styling is still yours',
      topic: 'condition',
    }),
  },
  {
    id: 'propertyOverFinish',
    when: (s) => s.renovation === 'yes' && (s.site.length >= 1 || s.spatial.length >= 1),
    build: (s) => ({
      headline: 'The property matters more than the finish.',
      evidence: `You'd take on real work, and what you kept protecting is ${topicPhrase(s) ?? 'the property itself'}. That's the part work can't produce.`,
      consequence:
        "So condition should do almost none of your filtering. A house that shows badly is a candidate. A compromised site isn't, because that's the one thing a renovation budget can't buy back.",
      aside: "you'd do the work, so condition isn't the filter",
      topic: 'condition',
    }),
  },
  {
    id: 'outdoorNotGrounds',
    when: (s) => s.protectedIds.has('outdoor') && s.upkeep === 'no',
    build: () => ({
      headline: 'You want outdoor life, not grounds to run.',
      evidence:
        "Being outside is something you'd use, and property maintenance is one of the things you said would wear on you.",
      consequence:
        "Those get advertised as the same thing and they aren't. Usability is the test rather than acreage, a pool or elaborate planting, and a small outdoor space you sit in every day beats a large one you manage.",
      aside: 'the outdoor space has to be usable rather than large',
      topic: 'the outdoor space',
    }),
  },
  {
    id: 'narrowByDesign',
    when: (s) => s.mapTight && s.specificity >= 3,
    build: (s) => ({
      headline: 'Your search is narrow by design.',
      evidence: `Your map is fixed, and you kept coming back to ${topicPhrase(s) ?? 'the property itself'}.`,
      consequence:
        'Both of those hold, so the pool is small on purpose and no amount of searching widens it. The work is separating a real requirement from a preference that arrived alongside it, rather than quietly letting the boundary slide to make the numbers look better.',
      aside: 'your map and your property criteria are both tight',
      topic: 'the map',
    }),
  },
  {
    id: 'mapRoomPropertyNot',
    when: (s) => s.mapOpen && s.specificity >= 3,
    build: (s) => ({
      headline: "Your map has room. Your house criteria don't.",
      evidence: `Geography is the part you're willing to move on. What you protected is ${topicPhrase(s) ?? 'the property itself'}, and that's the part you're not.`,
      consequence:
        "So the search runs across several deliberate areas rather than loosening what kept coming up. Widening the property criteria in order to stay in one neighbourhood would be solving the constraint you don't have.",
      aside: 'the map is the flexible part, not the house',
      topic: 'the map',
    }),
  },
  {
    id: 'spatialUnresolvedReno',
    when: (s) => s.spatial.length >= 2 && s.renovation === 'conditional',
    build: (s) => ({
      headline: "The house has to work. How much you'd change it's still open.",
      evidence: `You were consistent about ${spatialPhrase(s.spatial) ?? 'the way the house works'}, and undecided about how much work you'd take on to get it.`,
      consequence:
        "Those two answers point at different listings, so the appetite is worth settling against an actual imperfect house rather than in the abstract. Until it is, condition can't filter anything for you.",
      aside: "the spatial requirements are firm and the renovation appetite isn't",
      topic: 'condition',
    }),
  },
  {
    id: 'logisticsLed',
    when: (s) => s.logistics.length >= 2 && s.specificity <= 2,
    build: (s) => ({
      headline: 'The day to day is doing the filtering, not the architecture.',
      evidence: `What you protected is ${logisticsPhrase(s.logistics) ?? 'the practical side'}, and the property itself came back comparatively open.`,
      consequence:
        "That's worth knowing, because those things are invisible in listing photography and decide how a house feels after a month. They belong on the showing list rather than in the search filters.",
      aside: 'the practical side is doing the filtering',
      topic: 'the practical side',
    }),
  },
]

/** Numbers read as words in a sentence, never as a numeral at the start of one. */
function spell(count: number): string {
  const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
  return WORDS[count] ?? String(count)
}

/** Which parts of a house the protected things are spread across. */
function partsOfHouse(signals: Signals): string {
  const parts: string[] = []
  if (signals.site.length > 0) parts.push('the site')
  if (signals.spatial.length > 0) parts.push('the way it works')
  if (signals.condition.length > 0) parts.push('its condition')
  if (signals.logistics.length > 0) parts.push('the daily logistics')
  if (parts.length <= 1) return parts[0] ?? 'the house'
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

export function combinations(signals: Signals): Combination[] {
  return RULES.filter((rule) => rule.when(signals)).map((rule) => ({
    id: rule.id,
    ...rule.build(signals),
  }))
}

// ---------------------------------------------------------------------------
// What this changes.
// ---------------------------------------------------------------------------

export interface Change {
  heading: string
  body: string
}

/**
 * Reject faster. Only from a cluster with real evidence, and only when the
 * buyer genuinely can't or won't fix it. This is the one section allowed to
 * tell someone to stop looking at something, so it takes the highest bar.
 */
export function rejectFaster(signals: Signals): Change | null {
  const strong = (entries: readonly ReadAttribute[]) =>
    entries.length >= 2 || entries.some((entry) => entry.confidence !== 'weak')

  // Site problems first: nothing about them improves after you own the house.
  if (signals.site.length >= 1 && strong(signals.site)) {
    const named = signals.site
      .map((entry) => SITE_REJECTS[entry.attribute.id])
      .filter((value): value is string => Boolean(value))
      .slice(0, 2)
    if (named.length > 0) {
      return {
        heading: 'Reject faster',
        body:
          named.length > 1
            ? `Houses with ${named[0]} or ${named[1]}. You can renovate a house. You can't renovate either of those.`
            : `Houses with ${named[0]}. That isn't something a renovation fixes.`,
      }
    }
  }

  if (signals.spatial.length >= 2 && signals.renovation !== 'yes') {
    const rescue = has(signals.spatial, 'size')
      ? "already feel too small in the rooms you'd actually use"
      : 'need the floor plan rescued'
    return {
      heading: 'Reject faster',
      body: `Houses that ${rescue}, or whose main living space doesn't work for the way you cook, host and move around. Neither of those is a cosmetic fix, and you haven't told us you'd take on the work that solves them.`,
    }
  }

  if (signals.condition.length >= 1 && signals.renovation === 'no') {
    return {
      heading: 'Reject faster',
      body: "Anything that needs real work before you could live in it. Dated is a different problem and stays on the list. This is the house where the kitchen, the systems or the layout is a project you'd have to take on.",
    }
  }

  return null
}

/**
 * How a protected site attribute is said as a house you can skip.
 *
 * Written as house descriptions rather than as the attribute labels, because
 * "houses that fail on outdoor space you would actually use" is the buyer's
 * click read back to them, and the whole point of this section is to name the
 * listing they can stop opening.
 */
const SITE_REJECTS: Record<string, string> = {
  outdoor: "no outdoor space you'd actually sit in",
  light: 'a dark interior',
  privacy: 'no real privacy',
  street: 'a street you can hear from inside',
  lot: 'a compromised lot',
  view: 'nothing to look at once you are inside',
}

/**
 * Look twice. Real flexibility only, never invented. Two honest sources: the
 * buyer said they'd supply something themselves, or they lost something in a
 * forced comparison and might be treating that as a decision.
 */
export function lookTwice(signals: Signals): Change | null {
  if (signals.personalization === 'yes' && !signals.protectedIds.has('character')) {
    return {
      heading: 'Look twice',
      body: "A house with the right space and layout that isn't styled yet. You've said the cosmetic layer is yours to add, so a plain one shouldn't lose a viewing to a staged one.",
    }
  }

  if (signals.renovation === 'yes' && signals.condition.length === 0) {
    return {
      heading: 'Look twice',
      body: "Houses that show badly. Dated isn't the same as broken, and you've said you'd take the work on, so those are usually where the value is.",
    }
  }

  if (signals.tradedPermanently.length > 0) {
    return {
      heading: 'Look twice',
      body: `${capitalise(labels(signals.tradedPermanently, 2))}. You gave that up in a forced choice, which isn't the same as deciding it doesn't matter. Worth checking against a real house whether that was a decision or just the way the question was put.`,
    }
  }

  if (signals.renovation === 'conditional' && signals.condition.length === 0) {
    return {
      heading: 'Look twice',
      body: "Houses that need work but are right in every way you can't change. You haven't ruled that out, and it's worth one viewing before you decide you have.",
    }
  }

  return null
}

/**
 * Figure this out next. One uncertainty, chosen for how much it would change
 * the search, not for how uncertain it is. This is where "unknown" earns its
 * place in the model: a result that names what someone hasn't decided is more
 * useful than one that pretends the picture is complete.
 */
export interface OpenQuestion {
  question: string
  /** The full reasoning. Shown once, under the question. */
  why: string
  /** The one-clause version, so the read can point at it without reprinting it. */
  short: string
  /** For the read's second paragraph. */
  topic: string
}

export function figureOutNext(signals: Signals): OpenQuestion | null {
  if (signals.conflictUnresolved) {
    return {
      topic: 'condition',
      short: "you have told us both that you want it finished and that you'd take the project on",
      question: 'How much work would you actually take on for an otherwise exceptional house?',
      why: "You said both that you want it finished and that you'd take the project on. Until that settles, condition can't filter anything, and it's the filter that changes the list most.",
    }
  }

  if (signals.renovation === 'conditional' && (signals.spatial.length > 0 || signals.condition.length > 0)) {
    return {
      topic: 'condition',
      short: "how much work you'd take on hasn't been established",
      question: 'How much work would you actually take on for an otherwise exceptional house?',
      why: "It's the difference between a house being wrong and a house being unfinished, and right now it's doing no filtering at all. Worth settling against a real property before you add another hard requirement.",
    }
  }

  if (signals.mapTight && signals.specificity >= 4) {
    return {
      topic: 'the map',
      short: "you've never actually had to test it",
      question: 'Is the map genuinely fixed, or is it a strong preference you have never had to test?',
      why: "With this many property requirements the map is doing most of the filtering, which means you may never see the house that would have changed your mind. Worth knowing which one you'd move first.",
    }
  }

  if (signals.protectedIds.has('outdoor') && signals.upkeep === 'unset') {
    return {
      topic: 'the outdoor space',
      short: 'we never established how much of it you want to look after',
      question: 'Do you want outdoor space, or specifically outdoor space you can use without looking after it?',
      why: 'Those are different houses and they photograph identically. It decides whether a pool and a planted garden read as a feature or as a standing commitment.',
    }
  }

  if (signals.protectedIds.has('size') && signals.unknownIds.has('expansion') && signals.renovation !== 'no') {
    return {
      topic: 'space',
      short: "it isn't clear whether the space has to exist already",
      question: 'Does the house have to be big already, or could it get there?',
      why: "You protected space and you haven't closed the door on work. Those two answers point at completely different listings, and one of them is a much larger market.",
    }
  }

  if (signals.declinedTheTrade && signals.specificity <= 3) {
    return {
      topic: "what you'd trade",
      short: 'nothing has been ranked against anything else yet',
      question: 'What would actually make you choose between two houses that both nearly work?',
      why: 'You declined the trade, which is a real answer, and it means nothing has been ranked against anything else yet. That ranking usually happens in the second or third house rather than before the first.',
    }
  }

  // Nothing conditional fired, so fall back to the unknown with the most power
  // to change the list. Ordered by leverage, not by how often it comes up.
  const LEVERAGE: readonly (OpenQuestion & { id: string })[] = [
    {
      id: 'condition',
      topic: 'condition',
      short: 'we never established how finished it has to be',
      question: 'How finished does it have to be on the day you move in?',
      why: "We never established it, and it's the single filter that changes the list most. Everything else is a preference inside whatever answer you give here.",
    },
    {
      id: 'size',
      topic: 'space',
      short: 'we never established how much space you actually need',
      question: 'How much space do you actually need, as opposed to want?',
      why: 'The number on a listing and the way a house lives are only loosely related, and this one sets the price band before anything else does.',
    },
    {
      id: 'outdoor',
      topic: 'outdoor space',
      short: 'outdoor space never came up either way',
      question: 'Do you need outdoor space, or somewhere to be outside?',
      why: 'In Los Angeles those are two different budgets and two different parts of the map.',
    },
    {
      id: 'light',
      topic: 'light',
      short: 'we never established your threshold for light',
      question: 'Does the light have to be good, or does it just have to not be bad?',
      why: "It's the most common reason a house that looked right in photographs gets ruled out in person, and it's worth knowing your threshold before you spend Sundays finding it.",
    },
    {
      id: 'privacy',
      topic: 'privacy',
      short: 'privacy never came up either way',
      question: 'How much privacy do you actually need, and from what?',
      why: 'Neighbours, the street and sight lines are three different problems with three different fixes, and only one of them is solvable after purchase.',
    },
    {
      id: 'upkeep',
      topic: 'upkeep',
      short: 'we never established how much property you want to look after',
      question: 'How much property are you willing to look after?',
      why: "It doesn't show up in a listing and it decides how the house feels in month three.",
    },
  ]

  for (const candidate of LEVERAGE) {
    if (signals.unknownIds.has(candidate.id)) {
      const { id: _id, ...question } = candidate
      return question
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// The read.
// ---------------------------------------------------------------------------

export interface TheRead {
  headline: string
  /** Paragraphs. Three or four sentences in total, never more. */
  paragraphs: readonly string[]
}

export function theRead(result: Result): TheRead | null {
  if (result.answered === 0) return null

  const signals = signalsOf(result)
  const firing = combinations(signals)
  const open = figureOutNext(signals)

  if (firing.length === 0) {
    // Not enough established to draw a combination from. Saying so is a real
    // finding, and far more useful than inventing a verdict from one answer.
    const paragraphs = [
      'Nothing here combines into a filter yet, which is worth knowing before you spend a Sunday on it. Two or three houses will settle more than another questionnaire will.',
    ]
    if (open) paragraphs.push(`The place to start is ${open.topic}, and ${open.short}.`)
    return { headline: "There isn't enough here yet to narrow anything.", paragraphs }
  }

  const lead = firing[0]
  const paragraphs = [`${lead.evidence} ${lead.consequence}`]

  /*
   * The second paragraph ranks the runner-up against what is still open:
   * "X matters too, but the bigger question is Y" is the shape that tells a
   * reader which one to act on first.
   *
   * Two things it must not do. It must not print the open question's full
   * reasoning, because that reasoning appears in full a few lines below and
   * reading it twice makes the page feel padded, so it uses the one-clause
   * form instead. And it must not set the runner-up against an open question
   * about the same subject, which reads as an argument with itself.
   */
  const second = firing.find((entry) => entry.id !== lead.id && entry.topic !== open?.topic)

  if (second && open) {
    paragraphs.push(`${capitalise(second.aside)}, but the bigger open question is ${open.topic}: ${open.short}.`)
  } else if (open) {
    paragraphs.push(`The one thing left open is ${open.topic}, and ${open.short}.`)
  } else if (second) {
    paragraphs.push(`${second.evidence} ${second.consequence}`)
  }

  return { headline: lead.headline, paragraphs }
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// ---------------------------------------------------------------------------
// At the showing. Every check ties back to a combination or to something the
// buyer protected, and the combination checks come first so the list opens on
// the thing the read just told them.
// ---------------------------------------------------------------------------

const COMBINATION_CHECKS: readonly { when: (s: Signals) => boolean; check: string }[] = [
  {
    when: (s) => s.protectedIds.has('size'),
    check: "Does it feel big enough in the rooms you'd actually use, or does the square footage just look right on paper?",
  },
  {
    when: (s) => s.protectedIds.has('publicRooms') && s.protectedIds.has('layout'),
    check: 'Can people cook, sit, eat and move through the main space at the same time without fighting it?',
  },
  {
    when: (s) => s.protectedIds.has('layout') && s.renovation !== 'yes',
    check: 'If you never change this floor plan, does the house still work?',
  },
  {
    when: (s) => s.character,
    check: 'Is the character architectural, or is it finishes and staging that leave with the stager?',
  },
  {
    when: (s) => s.renovation === 'conditional' && (s.mapTight || s.mapSemi),
    check: 'If this one needed a real renovation, would it still be worth it inside your map?',
  },
  {
    when: (s) => s.protectedIds.has('outdoor') && s.upkeep === 'no',
    check: "Ask who looks after the outside and how long it takes. Then decide whether you'd actually sit in it.",
  },
  {
    when: (s) => s.personalization === 'yes' && s.renovation === 'no',
    check: "Separate what you'd change from what you'd have to live with. Be honest about which list is longer.",
  },
  {
    when: (s) => s.dayOne === 'yes',
    check: "Separate what's dated from what's broken. Only one of those is a price conversation.",
  },
  {
    when: (s) => s.specificity >= 5,
    check: "Name the two things you'd give up in this house. If you can't, you haven't ranked them yet.",
  },
  {
    when: (s) => s.protectedIds.has('separation'),
    check: "Find the door you'd close when you need to. Is there one, and is it in the right place?",
  },
  {
    when: (s) => s.logistics.some((entry) => entry.attribute.operational),
    check: 'Walk where everyday life actually goes. Laundry, bags, pantry, coats, bins, parking.',
  },
  {
    when: (s) => s.protectedIds.has('light'),
    check: "Come back at a different hour. Light at 11 a.m. isn't light at 5 p.m.",
  },
  {
    when: (s) => s.protectedIds.has('privacy') || s.protectedIds.has('street'),
    check: 'Stand at the windows rather than in the middle of the room, then stand outside on the sidewalk and listen.',
  },
  {
    when: (s) => s.protectedIds.has('lot'),
    check: 'Walk the property line. What is actually next door, and how close is it?',
  },
  {
    when: (s) => s.protectedIds.has('kitchen'),
    check: 'If you never redo this kitchen, can you live with it? Answer honestly.',
  },
  {
    when: (s) => s.protectedIds.has('proximity') || s.protectedIds.has('convenience'),
    check: "Do one ordinary errand starting from the front door, at the hour you'd really be doing it.",
  },
  {
    when: (s) => s.protectedIds.has('view'),
    check: "Check the view from where you'd actually sit, not from the middle of the terrace.",
  },
  {
    when: (s) => s.protectedIds.has('condition') && s.renovation !== 'no',
    check: "Price the work you can see before you decide it's finished. Then ask what it hides.",
  },
]

export const MAX_CHECKS = 5
const MIN_CHECKS = 3

/**
 * When the test established very little, the specific checks run out. These
 * are the fallbacks, and they are written to be useful precisely BECAUSE
 * nothing is settled: each one is a way of finding out something the
 * questionnaire could not tell us.
 */
const OPENING_CHECKS: readonly string[] = [
  "Name the one thing in this house you wouldn't accept. That's your first real filter, and it doesn't exist until you stand in something.",
  'Walk it once without talking. Then say what you noticed first, before anyone tells you what to think about it.',
  "Ask what the house makes hard. Every house makes something hard, and the listing won't say which.",
]

export function showingChecks(result: Result): string[] {
  const signals = signalsOf(result)
  const checks: string[] = []
  for (const entry of COMBINATION_CHECKS) {
    if (!entry.when(signals)) continue
    if (!checks.includes(entry.check)) checks.push(entry.check)
    if (checks.length === MAX_CHECKS) break
  }
  for (const fallback of OPENING_CHECKS) {
    if (checks.length >= MIN_CHECKS) break
    checks.push(fallback)
  }
  return checks
}

// ---------------------------------------------------------------------------
// The structured brief. The factual record, which is a different job from the
// interpretation and belongs below it.
//
// An attribute appears once. Priorities and practical flags are disjoint, and
// the day-one list collapses into a single sentence when it would otherwise
// reprint the priorities verbatim.
// ---------------------------------------------------------------------------

export interface SearchBrief {
  priorities: readonly string[]
  practicalFlags: readonly string[]
  map: string | null
  change: readonly { label: string; value: string }[]
  /**
   * The day-one finding as a sentence, never as a second list. Reprinting the
   * priorities under a different heading is the repetition this rewrite exists
   * to remove, so the useful version names only what is NOT in that state.
   */
  mustWorkNote: string | null
  worthTesting: readonly string[]
  notEstablished: readonly Attribute[]
  openQuestion: OpenQuestion | null
}

export function searchBrief(result: Result): SearchBrief {
  const signals = signalsOf(result)
  const read = (value: number) => (value >= HIGH ? 'Yes' : value <= LOW ? 'Not really' : 'Depends')

  const practical = [...signals.logistics]
  const practicalIds = new Set(practical.map((entry) => entry.attribute.id))
  const priorities = result.attributes.filter(
    (entry) => entry.state === 'protect' && !practicalIds.has(entry.attribute.id),
  )

  /*
   * What could genuinely come later is the COSMETIC layer and nothing else.
   *
   * An earlier version derived this as "the priorities that are not real
   * projects", which quietly swept in the permanent ones and told a buyer
   * that outdoor space could come later. It cannot. The lot, the light and
   * the street are the least deferrable things on the list, so the
   * complement is taken from the adaptable class directly rather than by
   * subtracting one class from the whole.
   */
  const addLater =
    signals.renovation === 'yes'
      ? priorities
      : priorities.filter((entry) => entry.attribute.changeability === 'usuallyAdaptable')

  const mustWorkNote =
    signals.renovation === 'yes' || priorities.length === 0
      ? null
      : addLater.length === 0
        ? "Every one of these is something you'd be buying rather than adding."
        : `Of these, only ${labels(addLater, 2)} could come later. The rest you'd be buying rather than adding.`

  return {
    priorities: priorities.map((entry) => entry.attribute.label),
    practicalFlags: practical.map((entry) => entry.attribute.label),
    map: mapSummary(result),
    change: [
      { label: 'Cosmetic changes', value: read(result.scales.personalizationAppetite) },
      { label: 'Major renovation', value: read(result.scales.renovationTolerance) },
    ],
    mustWorkNote,
    worthTesting: result.attributes
      .filter((entry) => entry.state === 'flexibilityToTest')
      .map((entry) => entry.attribute.label),
    notEstablished: result.unknowns,
    openQuestion: figureOutNext(signals),
  }
}

/** The map finding as a phrase you can read at a glance. */
export function mapSummary(result: Result): string | null {
  switch (result.findings.map) {
    case 'fixed':
      return 'One area. It does not move.'
    case 'strongPreference':
      return 'Strong preference, not a hard boundary.'
    case 'fewAreas':
      return 'A handful of areas, not one ZIP code.'
    case 'propertyLed':
      return 'The property leads. The map follows.'
    case null:
      return null
  }
}

/** Everything the consumer result shows, in page order. */
export interface Interpretation {
  read: TheRead | null
  changes: readonly Change[]
  openQuestion: OpenQuestion | null
  checks: readonly string[]
  brief: SearchBrief
}

export function interpretation(result: Result): Interpretation {
  const signals = signalsOf(result)
  const open = figureOutNext(signals)
  return {
    read: theRead(result),
    changes: [rejectFaster(signals), lookTwice(signals)].filter(
      (change): change is Change => change !== null,
    ),
    openQuestion: open,
    checks: showingChecks(result),
    brief: searchBrief(result),
  }
}
