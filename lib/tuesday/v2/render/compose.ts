import type { StructuredBrief } from '../brief.ts'
import { attributeById } from '../model.ts'
import {
  BUYER_DECISION_VETOES, CRITERION, CRITERION_BUYER, DISCREPANCY, FACT_LABEL,
  LEVER, LEVER_FALLBACK, NO_SUBSTITUTE, PROGRAM, PROGRAM_QUALIFIED, QUALIFIER_CRITERION,
  NOT_THE_GIVE, REQUIREMENT, SEARCH_DIMENSIONS, SECOND_LOOK, SHOWING, SKIP, THE_GIVE, TIMING,
  TRADEOFF, UNRESOLVED, VETO,
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
}[] = [
  {
    needs: ['secondLook.cosmeticallyPlain', 'reject.condition'],
    phrase: {
      agent: 'Plain is fine. A project is not. That is a narrower gap than it sounds.',
      buyer: "Plain is fine. A project isn't.",
    },
  },
  {
    needs: ['reject.lacksArchitecturalCharacter', 'flex.cosmeticFinish'],
    phrase: {
      agent: 'The character has to arrive with the house. The finish does not.',
      buyer: 'The character has to come with the house. The finish I can do.',
    },
  },
  {
    needs: ['hold.sizeRoute'],
    phrase: {
      agent: 'Do not keep a small house in play hoping it can grow. That route is closed.',
      buyer: "Don't keep a small house in play hoping it can grow.",
    },
  },
  {
    needs: ['secondLook.smallerWithPotential'],
    phrase: {
      agent: 'A smaller house can work, but only where adding on is actually possible here.',
      buyer: 'A smaller house can work if adding on is actually possible.',
    },
  },
  {
    needs: ['secondLook.badlyArrangedNotSmall'],
    phrase: {
      agent: 'The area may well be enough. The plan is the thing that has to change.',
      buyer: 'The area is probably enough. The plan is the problem.',
    },
  },
  {
    needs: ['inspect.sizeSolvableHere'],
    phrase: {
      agent: 'The size question gets answered in the house, not on the listing.',
      buyer: "I'd answer the size question in the house, not on the listing.",
    },
  },
  {
    needs: ['secondLook.datedButSound'],
    phrase: {
      agent: 'Dated is fine where the plan and the site are right. Those two are the ones that cannot be fixed.',
      buyer: 'Dated is fine if the plan and the site are right.',
    },
  },
  {
    needs: ['inspect.outdoorUsability', 'inspect.upkeep'],
    alsoTheTradeoff: 'wantsTheOutsideButNotTheMaintenance',
    phrase: {
      agent: 'Look for the usable version of the outside, not the biggest one.',
      buyer: 'Look for the usable version of the outside, not the biggest one.',
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
      agent: 'There is nothing narrow enough to search on yet. The showings are the instrument.',
      buyer: "I don't have a filter yet. Seeing houses is how I get one.",
    },
  },
]

function snapshotFor(brief: StructuredBrief): Line[] {
  const out: Line[] = []
  const ids = new Set<string>([
    ...brief.skipFaster.map((e) => e.id),
    ...brief.doNotFlex.map((e) => e.id),
    ...brief.secondLook.map((e) => e.id),
    ...brief.showingTests.map((e) => e.id),
    ...brief.flexOrder.candidates.filter((c) => c.status === 'available').map((c) => `flex.${c.lever}`),
  ])

  const available = leversOf(brief)
  const closed = closedLeversOf(brief)

  /*
   * The asymmetry, then the ordering it implies.
   *
   * This is the whole job of the section: not what matters to this buyer, but
   * what to spend first and what not to reach for. The `doNotFlex` instruction
   * is preferred over a vetoed lever for the thing not to reach for, because
   * it is an instruction rather than a state.
   */
  if (available.length > 0) {
    const first = available[0].lever
    /*
     * The thing not to reach for has to be another SEARCH DIMENSION. A
     * dealbreaker is not a compromise anyone was going to offer, so naming one
     * here produces a sentence the buyer already knows and, worse, one that
     * does not parse: you cannot ask someone to take on natural light.
     */
    const blocked =
      closed.find((entry) => SEARCH_DIMENSIONS.includes(entry.lever))?.lever ??
      brief.doNotFlex.find((entry) => SEARCH_DIMENSIONS.includes(entry.subject))?.subject
    if (blocked && NOT_THE_GIVE[blocked] && THE_GIVE[first]) {
      out.push({
        agent: `${upper(short(first))} has room in it. ${upper(short(blocked))} does not.`,
        buyer: `${upper(short(first, true))} has room in it. ${upper(short(blocked, true))} doesn't.`,
      })
      out.push({
        agent: `I would ${THE_GIVE[first].agent} before ${NOT_THE_GIVE[blocked].agent}.`,
        buyer: `I'd rather ${THE_GIVE[first].buyer ?? THE_GIVE[first].agent} than ${NOT_THE_GIVE[blocked].buyer ?? NOT_THE_GIVE[blocked].agent}.`,
      })
    } else {
      out.push({
        agent: `${upper(short(first))} is the thing with room in it.`,
        buyer: `${upper(short(first, true))} is where I have room.`,
      })
    }
    /*
     * A single lever with nothing to contrast it against leaves the snapshot
     * as one bare observation, which is a fact rather than an instruction. Say
     * what to do with it instead.
     */
    if (available.length === 1) {
      const verb = THE_GIVE[first]
      out.push({
        agent: verb
          ? `Nothing else they named has give in it, so I would ${verb.agent} rather than soften one of the rest.`
          : 'Nothing else they named has give in it, so lead with that rather than softening one of the rest.',
        buyer: verb
          ? `Nothing else on my list has give in it, so I'd rather ${verb.buyer ?? verb.agent} than soften one of the rest.`
          : "Nothing else on my list has give in it, so I'd lead with that.",
      })
    }
    if (available[1]) {
      out.push({
        agent: `${upper(short(available[1].lever))} is the second thing to try, not the first.`,
        buyer: `After that, ${short(available[1].lever, true)}.`,
      })
    }
  } else if (brief.flexOrder.state === 'closed') {
    /*
     * The constraint list belongs to the NO OBVIOUS LEVER section. Repeating it
     * here would make the two halves of the brief say the same thing twice, so
     * the snapshot carries only the consequence.
     */
    out.push({
      agent: 'There is no soft give here.',
      buyer: 'There is no soft give on my list.',
    })
    out.push({
      agent: 'I would not loosen one on paper just to get more listings on the page. Fewer, better showings.',
      buyer: "I'd rather see fewer houses than loosen one of these to pad the list.",
    })
  } else {
    out.push({
      agent: 'Nothing softer than the hard constraints has come out yet, so there is no give to name.',
      buyer: "I haven't worked out what I'd give on yet.",
    })
    out.push({
      agent: 'That is a gap in what we asked, not a buyer digging in. I would ask before narrowing anything.',
      buyer: 'Worth asking me before we narrow anything.',
    })
  }

  /*
   * The implication of the combination. One, the most useful available, and
   * never one that restates the tradeoff section. "They want the outside
   * without the maintenance" was arriving in both places in slightly different
   * words, which is the duplication this renderer exists to stop.
   */
  const implication = IMPLICATIONS.find(
    (entry) =>
      entry.needs.every((id) => ids.has(id)) &&
      !(entry.alsoTheTradeoff && entry.alsoTheTradeoff === brief.expectedTradeoff?.why),
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
      const phrase =
        LEVER[entry.lever] ??
        LEVER_FALLBACK(CRITERION[entry.lever] ?? entry.lever, CRITERION_BUYER[entry.lever] ?? entry.lever)
      return line(phrase, entry.lever)
    })
    add('flex', lines, 'no lever was offered')
    omitted.push({ id: 'noLever', why: 'a lever exists' })
    omitted.push({ id: 'leverUnknown', why: 'a lever exists' })
  } else if (brief.flexOrder.state === 'closed') {
    const quotable = closedLeversOf(brief).slice(0, MAX_CLOSING_REASONS)
    const agentReasons = unique(quotable.map((entry) => VETO[entry.veto!]?.agent))
    const buyerReasons = unique(
      quotable.map((entry) => VETO[entry.veto!]?.buyer ?? VETO[entry.veto!]?.agent),
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
      (brief.flexOrder.missing ?? []).map((gap) => ({
        agent: `${upper(gap)}.`,
        buyer: `${upper(gap)}.`,
      })),
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
    const pair = `${short(tradeoff.sideA)} against ${short(tradeoff.sideB)}`
    const ordered = tradeoff.ordering === 'sideAWins'
    add('tradeoff', phrase ? [{
      agent: `${upper(pair)}.${ordered ? ` Forced to choose once, they kept ${short(tradeoff.sideA)}.` : ''} ${phrase.agent}`,
      buyer: `${upper(pair)}.${ordered ? ` When I had to pick, I kept ${short(tradeoff.sideA, true)}.` : ''} ${phrase.buyer ?? phrase.agent}`,
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
  for (const entry of operational) {
    const key = entry.qualifier ? `${entry.attribute}:${entry.qualifier}` : entry.attribute
    const text = PROGRAM_QUALIFIED[key] ?? PROGRAM[entry.attribute]
    if (!text || seen.has(entry.attribute)) continue
    seen.add(entry.attribute)
    programLines.push({ agent: upper(text), buyer: upper(text), concept: entry.attribute })
  }
  for (const entry of brief.practicalProgram) {
    const key = entry.qualifier ? `${entry.subject}:${entry.qualifier}` : entry.subject
    const text = PROGRAM_QUALIFIED[key] ?? PROGRAM[entry.subject]
    // `site` is a filter criterion, not a program item. It arrives here too
    // because the contract keeps the same fact in both functional views, and
    // printing it twice is exactly what the renderer is supposed to prevent.
    if (!text || seen.has(entry.subject) || filtered.has(entry.subject)) continue
    seen.add(entry.subject)
    programLines.push({ agent: upper(text), buyer: upper(text), concept: entry.subject })
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
