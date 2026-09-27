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
  if (quiet && open) return 'light and privacy'
  if (ground && open) return 'the lot and what it gives you'
  if (quiet) return 'privacy and noise'
  if (open) return 'light and somewhere to be outside'
  if (ground) return 'the lot itself'
  return null
}

function conditionPhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  return has(entries, 'condition') ? 'a finished house' : 'not taking on the kitchen'
}

function logisticsPhrase(entries: readonly ReadAttribute[]): string | null {
  if (entries.length === 0) return null
  const near = has(entries, 'proximity') || has(entries, 'convenience')
  const daily = entries.some((entry) => entry.attribute.operational)
  if (near && daily) return "staying close to things, and a house that isn't a hassle to run"
  if (near) return 'staying close to your people'
  if (daily) return 'the everyday running of the place'
  return null
}

/*
 * The two clauses that keep the interpretation talking about houses.
 *
 * A result is only useful if it can finish the sentence "I wouldn't spend much
 * time on ...". These build that clause, and its opposite, out of whatever the
 * buyer actually protected, so the copy names a listing rather than a finding.
 */
function skipClause(signals: Signals): string {
  if (signals.spatial.length > 0) {
    const small = has(signals.spatial, 'size') || has(signals.spatial, 'ceilings')
    const works =
      has(signals.spatial, 'layout') ||
      has(signals.spatial, 'publicRooms') ||
      has(signals.spatial, 'separation')
    if (small && works) return 'houses that are already too small or need the floor plan rescued'
    if (small) return 'houses that are already too small'
    return 'houses that need the floor plan rescued'
  }
  if (signals.site.length > 0) {
    const named = signals.site
      .map((entry) => SITE_REJECTS[entry.attribute.id])
      .filter((value): value is string => Boolean(value))
    if (named.length >= 2) return `houses with ${named[0]} or ${named[1]}`
    if (named.length === 1) return `houses with ${named[0]}`
  }
  if (signals.condition.length > 0) return 'houses that need real work before you could move in'
  return 'houses that miss on the things you were clearest about'
}

function wantClause(signals: Signals): string {
  if (signals.spatial.length > 0) return 'the space and layout you want'
  if (has(signals.site, 'outdoor')) return 'the outdoor space you want'
  if (has(signals.site, 'light')) return 'the light you want'
  if (has(signals.site, 'lot')) return 'the lot you want'
  if (has(signals.site, 'privacy') || has(signals.site, 'street')) return 'the quiet you want'
  return 'the things you were clearest about'
}

/**
 * The one or two categories to name, and whether naming them may claim
 * recurrence.
 *
 * Clusters holding something the buyer established twice come first, so the
 * sentence leads on what they actually confirmed rather than on whichever
 * cluster the registry happens to list first. Never more than two, and never
 * a list of clicks.
 */
function topicOf(signals: Signals): { phrase: string; repeated: boolean } | null {
  const clusters = [
    { entries: signals.spatial, phrase: spatialPhrase(signals.spatial) },
    { entries: signals.site, phrase: sitePhrase(signals.site) },
    { entries: signals.condition, phrase: conditionPhrase(signals.condition) },
    { entries: signals.logistics, phrase: logisticsPhrase(signals.logistics) },
  ]
    .filter(
      (cluster): cluster is { entries: readonly ReadAttribute[]; phrase: string } =>
        cluster.phrase !== null,
    )
    .map((cluster) => ({
      phrase: cluster.phrase,
      repeated: cluster.entries.some((entry) => entry.repeated),
      strength: Math.max(...cluster.entries.map((entry) => entry.evidence.direct), 0),
    }))

  if (clusters.length === 0) return null

  const named = [...clusters]
    .sort((a, b) => Number(b.repeated) - Number(a.repeated) || b.strength - a.strength)
    .slice(0, 2)

  // Two cluster phrases already contain "and" of their own, so joining them
  // with another one produces a sentence nobody can parse. A comma does it.
  const phrase =
    named.length === 1 ? named[0].phrase : `${named[0].phrase}, plus ${named[1].phrase}`
  return { phrase, repeated: named.some((cluster) => cluster.repeated) }
}

function topicPhrase(signals: Signals): string | null {
  return topicOf(signals)?.phrase ?? null
}

/**
 * "You kept coming back to X" is only true when X came from two different
 * questions. One answer reused by four downstream result states is still one
 * thing the buyer said, so everything else gets the neutral verb.
 */
function heldPhrase(signals: Signals, fallback = 'the property itself'): string {
  const topic = topicOf(signals)
  if (!topic) return `you're strict about ${fallback}`
  return topic.repeated
    ? `you kept coming back to ${topic.phrase}`
    : `you're strict about ${topic.phrase}`
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
      headline: 'Almost everything is still a must-have.',
      evidence: "That may be exactly how you feel. It doesn't tell us what wins when two of them are in the same house.",
      consequence:
        "Before adding another filter, I'd go and see a few very different houses and find out what actually gives.",
      aside: 'almost everything is still a must-have',
      topic: 'what wins when two of them conflict',
    }),
  },
  {
    // The narrowest search the test can produce: condition and geography are
    // both closed. Telling this buyer to be flexible is advice for someone else.
    id: 'finishedAndFixed',
    when: (s) => s.dayOne === 'yes' && s.mapTight,
    build: () => ({
      headline: 'You want it finished, and you want it here.',
      evidence: "You want a house that's already done, and your map doesn't move.",
      consequence:
        "Not much matches both at once. What I'd want to know is which of the smaller things you'd let go when a good one does turn up.",
      aside: 'the condition and the map are both fixed',
      topic: 'condition',
    }),
  },
  {
    id: 'bonesThenLayers',
    when: (s) => s.character && s.personalization === 'yes',
    build: () => ({
      headline: 'The bones have to be right.',
      evidence:
        'You want the house itself to have something going for it, and you still want to make it yours.',
      consequence:
        "A brand-new white box isn't automatically a blank slate. If the architecture does nothing for you, wallpaper won't fix it.",
      aside: 'you want the house to bring something of its own',
      topic: 'character',
    }),
  },
  {
    id: 'decorateNotRenovate',
    when: (s) => s.personalization === 'yes' && s.renovation === 'no',
    build: () => ({
      headline: "You'll decorate. You won't renovate.",
      evidence: "You'll take a house nobody has styled, but not one that needs building work.",
      consequence:
        "Those look the same in photos. Dated finishes shouldn't cost a house a viewing. A bad floor plan or a kitchen that needs ripping out should, because you're not going to do it.",
      aside: "you'll do the decorating, not the construction",
      topic: 'condition',
    }),
  },
  {
    id: 'worksBeforeYours',
    when: (s) => s.dayOne === 'yes' && s.personalization === 'yes',
    build: () => ({
      headline: 'It has to work on day one. The rest is yours.',
      evidence:
        'You want the condition and the function handled when you buy. The decorating is the part you want to do.',
      consequence:
        "That rules out the project house and the fully styled one. What's left is finished and plain, which photographs badly and usually gets priced for it. Go and see those.",
      aside: 'it has to work on day one and the decorating is still yours',
      topic: 'condition',
    }),
  },
  {
    id: 'propertyOverFinish',
    when: (s) => s.renovation === 'yes' && (s.site.length >= 1 || s.spatial.length >= 1),
    build: (s) => ({
      headline: "You'd take the right property over the finished one.",
      evidence: `You'd do real work, and ${heldPhrase(s)}. No budget produces that.`,
      consequence:
        "So condition shouldn't do much of your filtering. Go and see the ones that show badly, and skip the ones on a bad site, because that's the part you can't buy your way out of later.",
      aside: "you'd do the work, so condition isn't what's filtering",
      topic: 'condition',
    }),
  },
  {
    id: 'outdoorNotGrounds',
    when: (s) => s.protectedIds.has('outdoor') && s.upkeep === 'no',
    build: () => ({
      headline: 'You want outdoor space, not another job.',
      evidence:
        'You want to be outside, and you said maintenance is one of the things that would wear on you.',
      consequence:
        'Those get sold as the same thing. Ask what it takes to keep rather than how big it is. A small patio you sit in every day beats a lawn and a pool you manage.',
      aside: 'the outdoor space has to be usable, not big',
      topic: 'the outdoor space',
    }),
  },
  {
    id: 'narrowByDesign',
    when: (s) => s.mapTight && s.specificity >= 3,
    build: (s) => ({
      headline: 'Your map is tight.',
      evidence: `Your map is fixed, and ${heldPhrase(s)}.`,
      consequence:
        `I wouldn't spend much time on ${skipClause(s)}.`,
      aside: 'your map is fixed as well',
      topic: 'the map',
    }),
  },
  {
    id: 'mapRoomPropertyNot',
    when: (s) => s.mapOpen && s.specificity >= 3,
    build: (s) => ({
      headline: 'The house matters more than the ZIP code.',
      evidence: `You'll move on the map. You won't move on ${topicPhrase(s) ?? 'the property itself'}.`,
      consequence:
        "So we look in a few areas on purpose instead of loosening the house. Staying in one neighbourhood and giving up what you actually want would be the wrong way round.",
      aside: "you'll move on the map, not on the house",
      topic: 'the map',
    }),
  },
  {
    id: 'spatialUnresolvedReno',
    when: (s) => s.spatial.length >= 2 && s.renovation === 'conditional',
    build: (s) => ({
      headline: "The house has to work. What you'd change is still open.",
      evidence: `You were clear about ${spatialPhrase(s.spatial) ?? 'the way the house works'}, and not clear about how much work you'd do to get there.`,
      consequence:
        "Those point at different houses. Go and stand in one that's nearly right and needs work, and you'll know.",
      aside: "you know what the house has to do, not how much you'd change",
      topic: 'condition',
    }),
  },
  {
    id: 'logisticsLed',
    when: (s) => s.logistics.length >= 2 && s.specificity <= 2,
    build: (s) => ({
      headline: "It's the everyday stuff that'll decide this.",
      evidence: `${capitalise(heldPhrase(s, 'the practical side'))}, and you were looser about the house itself.`,
      consequence:
        'None of that shows up in photographs, and all of it decides how a house feels after a month. Check it at the showing rather than trying to filter for it.',
      aside: "the everyday stuff is what's filtering",
      topic: 'the everyday side',
    }),
  },
]

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
  /*
   * The bar here is an explicit statement, NOT a repeated one.
   *
   * These clusters only ever contain attributes already in the protect state,
   * which means the buyer named them outright. That is one interaction and it
   * is enough to skip a listing: a dealbreaker answer is emphatic even though
   * it was given once. Confidence deliberately does not appear, because it is
   * now counted by distinct question, and reading a single emphatic answer as
   * "weak" would have quietly switched this section off for most buyers.
   */
  if (signals.site.length >= 1) {
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
            : `Houses with ${named[0]}. A renovation doesn't fix that one.`,
      }
    }
  }

  if (signals.spatial.length >= 2 && signals.renovation !== 'yes') {
    const rescue = has(signals.spatial, 'size')
      ? "already feel too small in the rooms you'd actually use"
      : 'need the floor plan rescued'
    return {
      heading: 'Reject faster',
      body: `Houses that ${rescue}, or where the main living space fights the way you cook and host.`,
    }
  }

  if (signals.condition.length >= 1 && signals.renovation === 'no') {
    return {
      heading: 'Reject faster',
      body: "Anything that needs real work before you could move in. Dated is a different thing and stays on the list. This is the one where the kitchen, the systems or the layout is a job you'd have to take on.",
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
      body: "A house with the right space and layout that's cosmetically boring. You said the decorating is yours, so don't let a plain one lose out to a staged one.",
    }
  }

  if (signals.renovation === 'yes' && signals.condition.length === 0) {
    return {
      heading: 'Look twice',
      body: "Houses that show badly. Dated isn't broken, and you said you'd do the work, so that's usually where the value is.",
    }
  }

  if (signals.tradedPermanently.length > 0) {
    return {
      heading: 'Look twice',
      body: `${capitalise(labels(signals.tradedPermanently, 2))}. You gave that up in a forced choice, which isn't the same as deciding it doesn't matter. Worth checking against a real house before you treat it as settled.`,
    }
  }

  if (signals.renovation === 'conditional' && signals.condition.length === 0) {
    return {
      heading: 'Look twice',
      body: `A house with ${wantClause(signals)} that needs work elsewhere. You haven't ruled that out yet.`,
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
      short: "you told me both that you want it finished and that you'd take the project",
      question: 'How much work would you really take on for an otherwise great house?',
      why: "You told me both. You want it finished, and you'd take the project on. Those are different houses at different prices, so it's worth knowing which one you meant.",
    }
  }

  if (signals.renovation === 'conditional' && (signals.spatial.length > 0 || signals.condition.length > 0)) {
    return {
      topic: 'condition',
      short: "you haven't said how much work you'd really take on for an otherwise great house",
      question: 'How much work would you really take on for an otherwise great house?',
      why: "It's the difference between a house being wrong and a house just being unfinished. Go and see one that needs work before you add another rule.",
    }
  }

  if (signals.mapTight && signals.specificity >= 4) {
    return {
      topic: 'the map',
      short: "you've never actually had to test it",
      question: 'If the house is right, how far outside your usual area would you actually go?',
      why: "With this much riding on the house, the map is what's cutting the list. You may never see the one that would have changed your mind.",
    }
  }

  if (signals.protectedIds.has('outdoor') && signals.upkeep === 'unset') {
    return {
      topic: 'the outdoor space',
      short: 'we never got to how much of it you want to look after',
      question: "Do you need outdoor space, or do you need a yard you'll actually use every day?",
      why: 'Those are different houses and they photograph the same. It decides whether a pool and a planted garden read as a feature or as a standing job.',
    }
  }

  if (signals.protectedIds.has('size') && signals.unknownIds.has('expansion') && signals.renovation !== 'no') {
    return {
      topic: 'space',
      short: "it's not clear whether it has to be big already",
      question: 'Does it have to be big already, or could it get there?',
      why: "You protected space and you haven't ruled out work. Those are two different sets of listings, and one of them is a lot bigger.",
    }
  }

  if (signals.declinedTheTrade && signals.specificity <= 3) {
    return {
      topic: "what you'd give up",
      short: "you haven't had to choose between two things you want yet",
      question: 'What would actually make you pick one house over another?',
      why: "You wouldn't take the trade, which is fair enough. You'll find that answer in the second or third house, not before the first one.",
    }
  }

  // Nothing conditional fired, so fall back to the unknown with the most power
  // to change the list. Ordered by leverage, not by how often it comes up.
  const LEVERAGE: readonly (OpenQuestion & { id: string })[] = [
    {
      id: 'condition',
      topic: 'condition',
      short: 'we never got to how finished it has to be',
      question: 'How finished does it have to be the day you move in?',
      why: 'We never got to it, and it changes which houses are even worth sending you. Everything else sits inside your answer to it.',
    },
    {
      id: 'size',
      topic: 'space',
      short: 'we never got to how much space you actually need',
      question: 'How much space do you actually need, as opposed to want?',
      why: "The number on a listing and the way a house lives aren't the same thing, and this one sets the price band before anything else does.",
    },
    {
      id: 'outdoor',
      topic: 'outdoor space',
      short: 'outdoor space never came up either way',
      question: 'Do you need outdoor space, or somewhere to sit outside?',
      why: 'In Los Angeles those are two different budgets and two different parts of the map.',
    },
    {
      id: 'light',
      topic: 'light',
      short: 'we never got to your threshold for light',
      question: 'Does the light have to be good, or does it just have to not be bad?',
      why: "It's the most common reason a house that looked right online gets ruled out in person. Worth knowing your threshold before you spend Sundays finding it.",
    },
    {
      id: 'privacy',
      topic: 'privacy',
      short: 'privacy never came up either way',
      question: 'How much privacy do you need, and from what?',
      why: 'Neighbours, the street and sight lines are three different problems. Only one of them is fixable after you buy.',
    },
    {
      id: 'upkeep',
      topic: 'upkeep',
      short: 'we never got to how much property you want to look after',
      question: 'How much property are you willing to look after?',
      why: "It never shows up in a listing, and it decides how the house feels in month three.",
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
      "Nothing you picked rules much out yet. Two or three houses will tell you more than another set of questions will.",
    ]
    if (open) paragraphs.push(`Start with ${open.topic}. ${capitalise(open.short)}.`)
    return { headline: 'Not enough to go on yet.', paragraphs }
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
    paragraphs.push(`${capitalise(second.aside)}. The one I'd settle first is ${open.topic}. ${capitalise(open.short)}.`)
  } else if (open) {
    paragraphs.push(`${capitalise(open.topic)} is still open. ${capitalise(open.short)}.`)
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
    check: 'Can people cook, sit, eat and get past each other in the main space at the same time?',
  },
  {
    when: (s) => s.protectedIds.has('layout') && s.renovation !== 'yes',
    check: 'If you never change this floor plan, does the house still work?',
  },
  {
    when: (s) => s.character,
    check: 'Is the character actually in the house, or is it the staging? The staging leaves.',
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
    check: 'Two things you want will compete in this house. Work out which one wins before you leave.',
  },
  {
    when: (s) => s.protectedIds.has('separation'),
    check: "Find the door you'd close when you need to. Is there one, and is it in the right place?",
  },
  {
    when: (s) => s.logistics.some((entry) => entry.attribute.operational),
    check: 'Where do the bags, coats, laundry and pantry stuff actually go?',
  },
  {
    when: (s) => s.protectedIds.has('light'),
    check: "Come back at a different hour. Light at 11 a.m. isn't light at 5 p.m.",
  },
  {
    when: (s) => s.protectedIds.has('privacy') || s.protectedIds.has('street'),
    check: 'Stand at the windows, not in the middle of the room. Does it still feel private? Then stand out front for five minutes and listen.',
  },
  {
    when: (s) => s.protectedIds.has('lot'),
    check: "Walk the property line. What's actually next door, and how close is it?",
  },
  {
    when: (s) => s.protectedIds.has('kitchen'),
    check: 'If you never redo this kitchen, can you live with it? Answer honestly.',
  },
  {
    when: (s) => s.protectedIds.has('proximity') || s.protectedIds.has('convenience'),
    check: "Do one ordinary errand from the front door, at the hour you'd really be doing it.",
  },
  {
    when: (s) => s.protectedIds.has('view'),
    check: "Check the view from where you'd actually sit, not from the middle of the terrace.",
  },
  {
    when: (s) => s.protectedIds.has('condition') && s.renovation !== 'no',
    check: "Price the work you can see before you call it finished. Then ask what it's hiding.",
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
  "Name the one thing in this house you wouldn't accept. That's your first real filter, and it doesn't exist until you're standing in something.",
  'Walk it once without talking. Then say what you noticed first, before anyone tells you what to think about it.',
  "Ask what this house makes hard. They all make something hard, and the listing never says which.",
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
        ? "You'd be buying all of these, not adding them later."
        : `Only ${labels(addLater, 2)} could come later. The rest you'd be buying.`

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
      return 'Open, if the house is right.'
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
