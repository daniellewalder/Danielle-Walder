import type { StructuredBrief } from '../brief.ts'
import { attributeById } from '../model.ts'
import {
  BUYER_DECISION_VETOES, CRITERION, CRITERION_BUYER, DISCREPANCY, FACT_LABEL,
  GAP, LEAD, LEVER, LEVER_BY_SITUATION, LEVER_FALLBACK, NO_SUBSTITUTE, PROGRAM,
  PROGRAM_QUALIFIED, PROJECT_LIMIT_LEAD,
  PROPERTY_LED, QUALIFIER_CRITERION, REQUIREMENT, SEARCH_DIMENSIONS, SECOND,
  PUSH_ON, SECOND_LOOK, SHOWING, SIZE_ROUTE_LEAD, SKIP, TIMING, TRADEOFF, UNRESOLVED,
  VETO, VETO_ALONE,
  type Phrase,
} from './phrases.ts'

/**
 * StructuredBrief to the two things a person reads.
 *
 * ONE COMPOSITION, TWO SERIALIZATIONS. Everything is decided once, here, and
 * each line carries both registers. The buyer copy is a shorter selection of
 * the same lines, never a second reading of the same data, so the two can not
 * drift into disagreeing about what this search is.
 *
 * READS NOTHING BUT THE CONTRACT. No answers, no scores, no bands. If a
 * sentence cannot be built from a field, it is omitted and the omission is
 * recorded, because the alternative is prose that knows more than the model.
 */

export type SectionId =
  | 'snapshot' | 'facts' | 'filter' | 'flex' | 'noLever' | 'leverUnknown'
  | 'secondLook' | 'skip' | 'showing' | 'noSubstitute' | 'tradeoff'
  | 'unresolved' | 'program' | 'clarify'

export interface Line {
  agent: string
  /** First person. Falls back to `agent` where the shift adds nothing. */
  buyer: string
  /** The concept this line is about, for the duplication guard. */
  concept?: string
}

export interface Section {
  id: SectionId
  heading: string
  lines: readonly Line[]
}

export interface Composed {
  /** Two to four sentences of derived strategy. Never a recap. */
  snapshot: readonly Line[]
  sections: readonly Section[]
  omitted: readonly { id: SectionId; why: string }[]
}

const HEADING: Readonly<Record<SectionId, string>> = {
  snapshot: 'Search snapshot',
  facts: 'Search facts',
  filter: 'Filter on these',
  flex: 'Use this as the flex',
  noLever: 'No obvious lever',
  leverUnknown: 'Lever not established yet',
  secondLook: 'Worth a second look',
  skip: 'Probably not worth the time',
  showing: 'At the showing',
  noSubstitute: 'Do not substitute',
  tradeoff: 'The tradeoff to watch',
  unresolved: 'Still to settle',
  program: 'Practical program',
  clarify: 'Needs clarification',
}

const line = (phrase: Phrase, concept?: string): Line => ({
  agent: phrase.agent,
  buyer: phrase.buyer ?? phrase.agent,
  ...(concept ? { concept } : {}),
})

/** Short noun for a concept, for use inside a sentence. */
const short = (concept: string, buyer = false): string => {
  const derived: Readonly<Record<string, string>> = {
    geography: 'the map',
    condition: 'a renovation',
    cosmeticFinish: 'the finish',
    sizeRoute: 'how the space gets there',
  }
  if (derived[concept]) return derived[concept]
  return (buyer ? CRITERION_BUYER : CRITERION)[concept] ?? concept
}

/**
 * Skip entries that describe a kind of house rather than a criterion.
 *
 * These survive even when the same concept is already in the filter list,
 * because "anything under the target size" is an instruction about listings
 * and "enough space" is a search field. Everything else is suppressed as a
 * restatement.
 */
const SKIP_ALWAYS_SURVIVES: readonly string[] = [
  'reject.undersized',
  'reject.lacksArchitecturalCharacter',
  'reject.upkeep.pool',
  'reject.upkeep.planting',
  'reject.upkeep.amount',
  'reject.upkeep.general',
]

/** Showing tests, most useful first. Anything unlisted sorts last. */
const SHOWING_PRIORITY: readonly string[] = [
  'inspect.firstRejection',
  'inspect.outdoorUsability',
  'inspect.siteFit',
  'inspect.expansionFeasibility',
  'inspect.areaCanBeRearranged',
  'inspect.sizeSolvableHere',
  'inspect.characterIsStructural',
  'inspect.upkeep',
  'inspect.parking',
  'inspect.utility',
  'inspect.circulation',
]
const MAX_SHOWING = 6
const MAX_SHOWING_BUYER = 4

const keyOf = (id: string, qualifier?: string) => (qualifier ? `${id}~${qualifier}` : id)
const rank = (id: string) => {
  const index = SHOWING_PRIORITY.findIndex((entry) => id.startsWith(entry))
  return index === -1 ? SHOWING_PRIORITY.length : index
}

// ---------------------------------------------------------------------------
// The snapshot
// ---------------------------------------------------------------------------

/**
 * The most important consequence of the combination.
 *
 * Keyed on which instructions the engine actually produced, first match wins.
 * Every one of these is a reading of two or more facts together; none of them
 * is an answer the buyer could recognise as something they clicked.
 */
const IMPLICATIONS: readonly {
  needs: readonly string[]
  phrase: Phrase
  /** Suppressed when the tradeoff section is already making this point. */
  alsoTheTradeoff?: string
  /** Suppressed when a size route is set, because the lead already says it. */
  alsoTheSizeRoute?: boolean
}[] = [
  {
    needs: ['secondLook.cosmeticallyPlain', 'reject.condition'],
    phrase: {
      agent: 'A plain house is fine. One that needs real work is not.',
      buyer: "A plain house is fine. One that needs real work isn't.",
    },
  },
  {
    needs: ['reject.lacksArchitecturalCharacter', 'flex.cosmeticFinish'],
    phrase: {
      agent: 'The character has to come with the house. The finishes they can do themselves.',
      buyer: 'The character has to come with the house. The finishes I can do myself.',
    },
  },
  {
    needs: ['hold.sizeRoute'],
    alsoTheSizeRoute: true,
    phrase: {
      agent: 'Do not keep a small house in play hoping it can grow.',
      buyer: "Don't keep a small house in play hoping it can grow.",
    },
  },
  {
    needs: ['secondLook.smallerWithPotential'],
    alsoTheSizeRoute: true,
    phrase: {
      agent: 'A smaller house can work, but only where adding on is actually possible here.',
      buyer: 'A smaller house can work if adding on is actually possible.',
    },
  },
  {
    needs: ['secondLook.badlyArrangedNotSmall'],
    alsoTheSizeRoute: true,
    phrase: {
      agent: 'The area may well be enough. The plan is the thing that has to change.',
      buyer: 'The area is probably enough. The plan is the problem.',
    },
  },
  {
    needs: ['inspect.sizeSolvableHere'],
    alsoTheSizeRoute: true,
    phrase: {
      agent: 'The size question gets answered in the house, not on the listing.',
      buyer: "I'd answer the size question in the house, not on the listing.",
    },
  },
  {
    needs: ['secondLook.datedButSound'],
    phrase: {
      agent: 'Dated is fine where the plan and the lot are right. Those two are the parts nobody can change later.',
      buyer: 'Dated is fine if the plan and the lot are right.',
    },
  },
  /*
   * THE OUTDOOR BURDEN, AS THEY NAMED IT.
   *
   * We collected which part of the upkeep worries them, so the instruction
   * should use it. Specific before general, because `.find` takes the first
   * match. None of these says they dislike pools, refuse landscaping, want a
   * small yard, or that more property is bad: the evidence is a burden they
   * identified, not a new hard filter.
   */
  {
    needs: ['inspect.outdoorUsability', 'inspect.upkeep~pool'],
    phrase: {
      agent: 'A pool does not automatically count as the outdoor space. The outside still has to be somewhere they would sit.',
      buyer: 'A pool is not automatically the outdoor space I meant. It still has to be somewhere I would actually sit.',
    },
  },
  {
    needs: ['inspect.outdoorUsability', 'inspect.upkeep~planting'],
    phrase: {
      agent: 'They want the outdoor space, but not if using it comes with a landscaping job.',
      buyer: 'I want the outdoor space, but not if using it comes with a landscaping job.',
    },
  },
  {
    needs: ['inspect.outdoorUsability', 'inspect.upkeep'],
    phrase: {
      agent: 'They want outdoor space, not another job.',
      buyer: 'I want outdoor space, not another job.',
    },
  },
  {
    needs: ['secondLook.architecturalButUnstyled'],
    phrase: {
      agent: 'Bad styling is not a reason to skip. Missing architecture is.',
      buyer: 'Bad styling is not a dealbreaker. No character is.',
    },
  },
  {
    needs: ['inspect.firstRejection'],
    phrase: {
      agent: 'Nothing they said is narrow enough to search on yet. A few very different houses will tell us more than another question would.',
      buyer: "I don't have a real filter yet. Seeing a few very different houses is probably how I get one.",
    },
  },
]

function snapshotFor(brief: StructuredBrief): Line[] {
  const out: Line[] = []
  /*
   * Both the bare id and the qualified one, so an instruction can key on the
   * part of the upkeep the buyer actually named without losing the general
   * case for the qualifiers that have no specific line.
   */
  const ids = new Set<string>([
    ...brief.skipFaster.map((e) => e.id),
    ...brief.doNotFlex.map((e) => e.id),
    ...brief.secondLook.map((e) => e.id),
    ...brief.showingTests.flatMap((e) => (e.qualifier ? [e.id, `${e.id}~${e.qualifier}`] : [e.id])),
    ...brief.flexOrder.candidates.filter((c) => c.status === 'available').map((c) => `flex.${c.lever}`),
  ])

  const available = leversOf(brief)
  const closed = closedLeversOf(brief)
  const route = brief.searchPattern.sizeRoute

  if (route && SIZE_ROUTE_LEAD[route]) {
    /*
     * The size route leads. What a buyer will do about a house that is too
     * small changes more about the search than anything else they told us, and
     * the four answers have to read as four different searches.
     */
    /*
     * The size lead stands alone. Two of the four are already two sentences,
     * and appending the geography clause made the same formulaic line the
     * ending of all four size routes while adding nothing to any of them.
     * Geography is still in the flex section, where it belongs.
     */
    out.push(line(SIZE_ROUTE_LEAD[route]))
  } else if (available.length > 0) {
    const first = available[0].lever
    const blocked = closed.find((entry) => SEARCH_DIMENSIONS.includes(entry.lever))?.lever
    const hardStops = closed.some((entry) => entry.veto === 'isDealbreaker')
    /*
     * CONDITIONAL APPETITE IS NOT MAJOR APPETITE.
     *
     * Where condition leads and the buyer told us what the work depends on,
     * that limit is the lead. Without it all four follow-up answers printed
     * "open to real work", including the one that says moving walls is out.
     */
    const limit = brief.searchPattern.projectLimit
    const lead =
      (first === 'condition' && limit && PROJECT_LIMIT_LEAD[limit]) ||
      (blocked && LEAD[`${first}|${blocked}`]) ||
      LEAD[first]
    /*
     * One thing can move, nothing is blocking it, and the rest are outright
     * dealbreakers. The hard-stop sentence says all of that at once; leading
     * with the generic instruction first made the two sentences repeat.
     */
    if (!blocked && !available[1] && hardStops && PUSH_ON[first]) {
      out.push({
        agent: `Everything else they named is a hard stop, so ${PUSH_ON[first].agent} is the only part I would push on.`,
        buyer: `Everything else on my list is a hard stop, so ${PUSH_ON[first].buyer ?? PUSH_ON[first].agent} is the only part worth pushing on.`,
      })
    } else if (lead) {
      out.push(line(lead))
    } else {
      // A protected attribute offered as the softest give. No dimension
      // sentence fits, so say the one true thing and stop.
      const phrase = LEVER_FALLBACK(
        CRITERION[first] ?? first,
        CRITERION_BUYER[first] ?? first,
      )
      out.push(line(phrase))
    }
    const second = available[1]
    if (second && SECOND[second.lever]) out.push(line(SECOND[second.lever]))
    // The buyer already opened the map, so the instruction is about sequencing
    // the search rather than about widening anything.
    if (brief.searchPattern.map === 'propertyLed') out.push(line(PROPERTY_LED))
  } else if (brief.flexOrder.state === 'closed') {
    /*
     * The constraints themselves are listed in the no-lever section. This says
     * what to do about them, in words that do not require translating the
     * engine.
     */
    out.push({
      agent: 'Nothing obvious should move here.',
      buyer: 'Nothing obvious should move on my list.',
    })
    out.push({
      agent: 'I would keep the search narrow rather than loosen one of these just to create more options.',
      buyer: "I'd rather see fewer houses than loosen one of these just to have more to look at.",
    })
  } else {
    /*
     * Plainly, and without a word about the buyer. The old pair said "not a
     * buyer digging in", which frames them as resistant in the act of saying
     * they are not, and apologised for the instrument on the way past.
     */
    out.push({
      agent: 'We do not know yet what they would trade first.',
      buyer: "I haven't worked out yet what I'd trade first.",
    })
    out.push({
      agent: 'The test did not establish it, so I would ask before narrowing the search.',
      buyer: 'Worth asking me before we narrow the search.',
    })
  }

  /*
   * The consequence of the combination. One, the most useful available, and
   * never one that restates the tradeoff section or the size-route lead.
   */
  const implication = IMPLICATIONS.find(
    (entry) =>
      entry.needs.every((id) => ids.has(id)) &&
      !(entry.alsoTheTradeoff && entry.alsoTheTradeoff === brief.expectedTradeoff?.why) &&
      !(entry.alsoTheSizeRoute && route),
  )
  if (implication) out.push(line(implication.phrase))

  return out.slice(0, 4)
}

const leversOf = (brief: StructuredBrief) =>
  brief.flexOrder.candidates
    .filter((entry) => entry.status === 'available')
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

/** Vetoed levers a reader cares about, best worth quoting first. */
const closedLeversOf = (brief: StructuredBrief) =>
  brief.flexOrder.candidates
    .filter((entry) => entry.veto && BUYER_DECISION_VETOES.includes(entry.veto))
    .sort(
      (a, b) =>
        BUYER_DECISION_VETOES.indexOf(a.veto!) - BUYER_DECISION_VETOES.indexOf(b.veto!),
    )

/** At most three reasons. A longer list stops reading as a sentence. */
const MAX_CLOSING_REASONS = 3

const upper = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const unique = (xs: readonly (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])]
const sentence = (xs: readonly string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

// ---------------------------------------------------------------------------
// Search facts
// ---------------------------------------------------------------------------

const money = (value: number) =>
  value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}m` : `$${(value / 1000).toFixed(0)}k`

function factsFor(brief: StructuredBrief): Line[] {
  const facts = brief.searchFacts
  if (!facts) return []
  const out: Line[] = []
  const put = (label: string, value: string) => out.push({ agent: `${label}: ${value}`, buyer: `${label}: ${value}` })

  const { price, timing, geography, schoolBoundary, destinations, propertyBasics, hardFilters, buyerNote } = facts
  if (price?.targetMin || price?.targetMax) {
    const low = price.targetMin ? money(price.targetMin) : null
    const high = price.targetMax ? money(price.targetMax) : null
    put(FACT_LABEL.price, low && high ? `${low} to ${high}` : (low ?? high)!)
  }
  if (price?.hardCeiling) put(FACT_LABEL.ceiling, money(price.hardCeiling))
  if (timing?.posture) put(FACT_LABEL.timing, TIMING[timing.posture] ?? timing.posture)
  if (timing?.note) put(FACT_LABEL.note, timing.note)
  if (geography?.considering?.length) put(FACT_LABEL.considering, geography.considering.join(', '))
  if (geography?.ruledOut?.length) put(FACT_LABEL.ruledOut, geography.ruledOut.join(', '))
  if (geography?.note) put(FACT_LABEL.note, geography.note)
  if (schoolBoundary) put(FACT_LABEL.schoolBoundary, schoolBoundary)
  if (destinations?.length) put(FACT_LABEL.destinations, destinations.join(', '))
  if (propertyBasics?.types?.length) put(FACT_LABEL.types, propertyBasics.types.join(', '))
  if (propertyBasics?.minBeds) put(FACT_LABEL.minBeds, String(propertyBasics.minBeds))
  if (propertyBasics?.minBaths) put(FACT_LABEL.minBaths, String(propertyBasics.minBaths))
  if (propertyBasics?.minSqft) put(FACT_LABEL.minSqft, `${propertyBasics.minSqft.toLocaleString()} sq ft`)
  for (const [key, value] of [
    ['parking', hardFilters?.parking],
    ['stairs', hardFilters?.stairs],
    ['pool', hardFilters?.pool],
    ['ev', hardFilters?.ev],
  ] as const) {
    if (value && value !== 'noPreference') put(FACT_LABEL[key], REQUIREMENT[value] ?? value)
  }
  if (hardFilters?.other?.length) put(FACT_LABEL.other, hardFilters.other.join(', '))
  if (buyerNote) put(FACT_LABEL.note, buyerNote)
  return out
}

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------

export function compose(brief: StructuredBrief): Composed {
  const sections: Section[] = []
  const omitted: { id: SectionId; why: string }[] = []
  const add = (id: SectionId, lines: readonly Line[], whyEmpty: string) => {
    if (lines.length > 0) sections.push({ id, heading: HEADING[id], lines })
    else omitted.push({ id, why: whyEmpty })
  }

  const snapshot = snapshotFor(brief)

  add('facts', factsFor(brief), 'no handoff was supplied')

  /*
   * FILTER ON THESE is for criteria that can eliminate inventory, so it takes
   * the non-negotiables that are not `verifyPerProperty`. You cannot filter a
   * search on pantry function; that is a requirement to carry to the house, and
   * it belongs in the practical program instead. The split comes from the
   * contract's own `changeability`, not from a judgement about each attribute.
   */
  const filterable = brief.nonNegotiables.filter((entry) => entry.changeability !== 'verifyPerProperty')
  const operational = brief.nonNegotiables.filter((entry) => entry.changeability === 'verifyPerProperty')
  const criterionOf = (attribute: string, qualifier: string | null, buyer = false) =>
    (qualifier ? QUALIFIER_CRITERION[`${attribute}:${qualifier}`] : undefined) ??
    (buyer ? CRITERION_BUYER : CRITERION)[attribute] ??
    attribute
  add(
    'filter',
    filterable.map((entry) => ({
      agent: upper(criterionOf(entry.attribute, entry.qualifier)),
      buyer: upper(criterionOf(entry.attribute, entry.qualifier, true)),
      concept: entry.attribute,
    })),
    'nothing reached protect level that a search can filter on',
  )

  // The lever, in whichever of its three forms applies.
  const available = leversOf(brief)
  if (brief.flexOrder.state === 'identified') {
    const lines = available.slice(0, 2).map((entry) => {
      // Most specific first: the situation that produced this lever, then the
      // lever on its own, then a protected attribute offered as the give.
      const phrase =
        LEVER_BY_SITUATION[`${entry.lever}|${brief.searchPattern.map}|${entry.rank}`] ??
        LEVER_BY_SITUATION[`${entry.lever}|${entry.rank}`] ??
        LEVER[entry.lever] ??
        LEVER_FALLBACK(CRITERION[entry.lever] ?? entry.lever, CRITERION_BUYER[entry.lever] ?? entry.lever)
      return line(phrase, entry.lever)
    })
    add('flex', lines, 'no lever was offered')
    omitted.push({ id: 'noLever', why: 'a lever exists' })
    omitted.push({ id: 'leverUnknown', why: 'a lever exists' })
  } else if (brief.flexOrder.state === 'closed') {
    /*
     * "The rest are my dealbreakers" is the tail of a list, and the list of
     * dealbreakers is the section directly above this one. Where anything else
     * closed the gives, that clause only restates the filter list, so it is
     * dropped. Alone it keeps a form that does not need an antecedent.
     */
    const closedReasons = closedLeversOf(brief).slice(0, MAX_CLOSING_REASONS)
    const quotable =
      closedReasons.length > 1
        ? closedReasons.filter((entry) => entry.veto !== 'isDealbreaker')
        : closedReasons
    const voice = (entry: (typeof quotable)[number]) =>
      (quotable.length === 1 ? VETO_ALONE[entry.veto!] : undefined) ?? VETO[entry.veto!]
    const agentReasons = unique(quotable.map((entry) => voice(entry)?.agent))
    const buyerReasons = unique(
      quotable.map((entry) => voice(entry)?.buyer ?? voice(entry)?.agent),
    )
    add(
      'noLever',
      agentReasons.length
        ? [{
            agent: `${upper(sentence(agentReasons))}.`,
            buyer: `${upper(sentence(buyerReasons))}.`,
          }]
        : [],
      'nothing explicit closed the gives',
    )
    omitted.push({ id: 'flex', why: 'the buyer closed every route' })
    omitted.push({ id: 'leverUnknown', why: 'the routes were measured and closed' })
  } else {
    add(
      'leverUnknown',
      // The instruction to ask is in the snapshot. This section is the list of
      // what is actually missing, and repeating the instruction per line was
      // the same sentence three times on a buyer with three gaps.
      (brief.flexOrder.missing ?? []).map((gap) => {
        const phrase = GAP[gap]
        return {
          agent: `${upper(phrase?.agent ?? gap)}.`,
          buyer: `${upper(phrase?.buyer ?? phrase?.agent ?? gap)}.`,
        }
      }),
      'nothing was recorded as missing',
    )
    omitted.push({ id: 'flex', why: 'no lever was established' })
    omitted.push({ id: 'noLever', why: 'this is our gap, not the buyer being inflexible' })
  }

  add(
    'secondLook',
    brief.secondLook.map((entry) => line(SECOND_LOOK[entry.id] ?? { agent: '' }, entry.subject))
      .filter((entry) => entry.agent),
    'nothing in the evidence licenses keeping a listing in play',
  )

  /*
   * The skip list carries kinds of house, not criteria. Where it would only
   * restate something already in the filter list, it is dropped: a reader does
   * not need "a kitchen they don't have to redo" and "houses where the kitchen
   * would have to come out" as two separate findings.
   */
  const filtered = new Set(filterable.map((entry) => entry.attribute))
  /*
   * Qualified concepts that already carry an instruction somewhere a reader
   * will act on. Collected from the lines actually rendered, never from the
   * contract, so a suppressed instruction cannot suppress anything.
   */
  const instructed = new Set<string>()
  const skipLines: Line[] = []
  const suppressedSkips: string[] = []
  for (const entry of brief.skipFaster) {
    // The upkeep rejections already carry the qualifier in the id itself.
    const phrase = SKIP[entry.id]
    if (!phrase) continue
    if (!SKIP_ALWAYS_SURVIVES.includes(entry.id) && filtered.has(entry.subject)) {
      suppressedSkips.push(entry.id)
      continue
    }
    // `reject.upkeep.planting` is the concept `upkeep` qualified by `planting`.
    const tail = entry.id.startsWith(`reject.${entry.subject}.`)
      ? entry.id.slice(`reject.${entry.subject}.`.length)
      : null
    instructed.add(tail ? `${entry.subject}:${tail}` : entry.subject)
    skipLines.push(line(phrase, entry.subject))
  }
  add(
    'skip',
    skipLines,
    suppressedSkips.length
      ? `every skip repeated a criterion already in the filter list (${suppressedSkips.join(', ')})`
      : 'nothing is firm enough to eliminate listings on',
  )

  const showingLines = [...brief.showingTests]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))
    .map((entry) => {
      const phrase = SHOWING[keyOf(entry.id, entry.qualifier)] ?? SHOWING[entry.id]
      return phrase ? line(phrase, entry.subject) : null
    })
    .filter((entry): entry is Line => entry !== null)
    .slice(0, MAX_SHOWING)
  add('showing', showingLines, 'nothing needs checking in person that is specific to this buyer')
  for (const entry of brief.showingTests) {
    if (!showingLines.some((candidate) => candidate.concept === entry.subject)) continue
    instructed.add(entry.qualifier ? `${entry.subject}:${entry.qualifier}` : entry.subject)
  }

  add(
    'noSubstitute',
    brief.doNotSubstitute
      .map((entry) => {
        const phrase = NO_SUBSTITUTE[`${entry.wanted}/${entry.doNotSubstitute}`]
        return phrase ? line(phrase, entry.wanted) : null
      })
      .filter((entry): entry is Line => entry !== null),
    'no false equivalence is established by the evidence',
  )

  const tradeoff = brief.expectedTradeoff
  if (tradeoff) {
    const phrase = TRADEOFF[tradeoff.why]
    /*
     * ONE PAIR PER REGISTER. Built once for the agent and once for the buyer:
     * six concepts read "outdoor space they'd actually use" in Danielle's
     * notes and "outdoor space I'd actually use" in the buyer's own brief, and
     * sharing the string put her vocabulary inside their sentence.
     */
    const pairAgent = `${short(tradeoff.sideA)} against ${short(tradeoff.sideB)}`
    const pairBuyer = `${short(tradeoff.sideA, true)} against ${short(tradeoff.sideB, true)}`
    const ordered = tradeoff.ordering === 'sideAWins'
    add('tradeoff', phrase ? [{
      agent: `${upper(pairAgent)}.${ordered ? ` Forced to choose once, they kept ${short(tradeoff.sideA)}.` : ''} ${phrase.agent}`,
      buyer: `${upper(pairBuyer)}.${ordered ? ` When I had to pick, I kept ${short(tradeoff.sideA, true)}.` : ''} ${phrase.buyer ?? phrase.agent}`,
      concept: tradeoff.sideA,
    }] : [], 'the tension has no phrasing in the catalogue')
  } else {
    omitted.push({ id: 'tradeoff', why: 'no tension is established by the evidence' })
  }

  add(
    'unresolved',
    brief.unresolved
      .slice(0, 2)
      .map((entry) => (UNRESOLVED[entry.id] ? line(UNRESOLVED[entry.id]) : null))
      .filter((entry): entry is Line => entry !== null),
    'nothing open would materially change the search',
  )

  /*
   * The practical program takes the operational non-negotiables, which cannot
   * filter a search, plus the secondary functional needs the engine recorded
   * below protect level.
   */
  const programLines: Line[] = []
  const seen = new Set<string>()
  const addProgram = (subject: string, qualifier: string | null | undefined) => {
    const key = qualifier ? `${subject}:${qualifier}` : subject
    const phrase = PROGRAM_QUALIFIED[key] ?? PROGRAM[subject]
    if (!phrase || seen.has(subject)) return
    /*
     * TARGETED DEDUP, ONE DIRECTION ONLY.
     *
     * A program item is a noun on a checklist. Where the same qualified
     * concept already has an instruction somewhere that says what to do about
     * it, the noun adds nothing: "ask what the planting needs, and who cuts
     * it" and "planting and landscape upkeep" are the same fact, and only one
     * of them is useful. Nothing else is suppressed, because a requirement, a
     * showing check and a false-substitute warning are three different jobs.
     */
    if (instructed.has(key)) return
    seen.add(subject)
    programLines.push({
      agent: upper(phrase.agent),
      buyer: upper(phrase.buyer ?? phrase.agent),
      concept: subject,
    })
  }
  for (const entry of operational) addProgram(entry.attribute, entry.qualifier)
  for (const entry of brief.practicalProgram) {
    // `site` is a filter criterion, not a program item. It arrives here too
    // because the contract keeps the same fact in both functional views, and
    // printing it twice is exactly what the renderer is supposed to prevent.
    if (filtered.has(entry.subject)) continue
    addProgram(entry.subject, entry.qualifier)
  }
  add('program', programLines, 'no functional requirement was established')

  add(
    'clarify',
    brief.discrepancies
      .map((entry) => {
        const phrase = DISCREPANCY[`${entry.testEvidence}|${entry.handoffFact}`]
        return phrase
          ? line(phrase)
          : { agent: `${upper(entry.testEvidence)} against ${entry.handoffFact}. Worth one question.`, buyer: `${upper(entry.testEvidence)} against ${entry.handoffFact}.` }
      }),
    'the test and the search facts do not contradict each other',
  )

  return { snapshot, sections, omitted }
}

export { HEADING, MAX_SHOWING_BUYER, attributeById }
