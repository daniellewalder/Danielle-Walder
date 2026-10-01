import { attributeById, type Changeability, type SizeRoute } from './model.ts'
import type { Result } from './score.ts'
import type { AgentAction, Strategy } from './strategy.ts'
import { isMeasurementGap, type LeverDiagnosis, type VetoReason } from './lever.ts'
import { isEmptyHandoff, type Handoff } from './handoff.ts'

/**
 * The structured buyer brief.
 *
 * Everything Danielle's eventual brief will say, before anyone decides how to
 * say it. It has to be useful printed as raw JSON, and auditable end to end:
 * every strategic item names the facts behind it, the questions those facts
 * came from and the rule that produced it.
 *
 * THREE SOURCES, NEVER MIXED.
 *
 *   buyerEvidence   stated through the Tuesday Test
 *   derived         concluded by the strategy engine from combinations
 *   handoff         literal search facts supplied after the result
 *
 * Handoff facts never touch a score, a band or an attribute state. Where they
 * disagree with the test, the brief says so rather than quietly picking one.
 *
 * ONE FACTUAL HOME PER CONCEPT. An attribute is described once, in
 * `nonNegotiables` or `practicalProgram`. Every other section refers to it by
 * id and says only what it changes about the search. The old result printed the
 * kitchen four times under four headings; `conceptIndex` exists so the renderer
 * can never do that again.
 */

export type Layer = 'buyerEvidence' | 'derived' | 'handoff'

export interface Trace {
  layer: Layer
  /** The facts. Present for derived items. */
  because?: readonly string[]
  /** Question ids for evidence, or the questions behind a derived item. */
  sources?: readonly string[]
  /** Which strategy rules produced it. Derived items only. */
  rules?: readonly string[]
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export interface NonNegotiable {
  attribute: string
  qualifier: string | null
  changeability: Changeability
  direct: number
  directSources: readonly string[]
  statedRank: number | null
  corroboration: readonly string[]
  repeated: boolean
  /** Present only when Q8 weighed this attribute. */
  ordering: { against: string; outcome: 'won' | 'lost' } | null
  trace: Trace
  /**
   * Derived reasoning that lands on the same attribute, kept here rather than
   * repeated as its own entry.
   *
   * A `doNotFlex` on something the buyer already named as a non-negotiable is
   * the same instruction twice. The reasoning is still worth having, so it is
   * folded into the attribute's one factual home instead of being dropped or
   * printed again under another heading.
   */
  reinforcedBy?: readonly Trace[]
}

/**
 * THREE STATUSES, NOT TWO.
 *
 * `vetoed` is a finding about the buyer: something in their answers rules this
 * out as the give. `notSelected` is a fact about us: it could move, and better
 * levers exist, so we do not lead with it. Collapsing the second into the
 * first is how our own ranking starts reading as the buyer's inflexibility.
 */
export interface LeverEntry {
  lever: string
  status: 'available' | 'notSelected' | 'vetoed'
  /** Present when available. 1 is tried first. */
  rank?: number
  /** Present only when status is `vetoed`. */
  veto?: VetoReason
  trace: Trace
}

export interface FlexOrder {
  state: LeverDiagnosis['state']
  reason: LeverDiagnosis['reason']
  candidates: readonly LeverEntry[]
  /** For notEstablished: what we never gathered. */
  missing?: readonly string[]
}

export interface BriefItem {
  /** The operational id. Stable, and what copy will later be written against. */
  id: string
  subject: string
  qualifier?: string
  trace: Trace
}

export interface SecondLookItem extends BriefItem {
  /** What this explicitly does NOT license. */
  doesNotImply: readonly string[]
}

export interface ShowingTest extends BriefItem {
  /** Whether the need is stated or concluded. */
  origin: 'buyerEvidence' | 'derived'
}

export interface Substitution {
  wanted: string
  doNotSubstitute: string
  trace: Trace
}

export interface ExpectedTradeoffItem {
  sideA: string
  sideB: string
  /** Set only when Q8 actually ordered them. */
  ordering: 'sideAWins' | 'none'
  why: string
  /** Established by a forced choice, or a tension still to test. */
  confidence: 'established' | 'toTest'
  trace: Trace
}

export interface UnresolvedItem {
  id: string
  /** Higher moves the search more. */
  leverage: number
  trace: Trace
}

export type DiscrepancyStatus = 'needsClarification'

export interface Discrepancy {
  kind: 'structuredConflict' | 'freeTextMayConflict'
  testEvidence: string
  handoffFact: string
  /** Verbatim, for free-text sources. Never interpreted further. */
  quote?: string
  status: DiscrepancyStatus
  trace: Trace
}

export interface SearchPattern {
  map: Result['map']
  project: 'turnkey' | 'cosmeticOnly' | 'contained' | 'major' | 'undecided' | 'notEstablished'
  personalization: 'wantsToMakeItTheirs' | 'someChanges' | 'prefersItLeftAlone' | 'notEstablished'
  leverState: LeverDiagnosis['state']
  /**
   * HOW the protected size may be satisfied. Null when the question was never
   * put, or is still open. Never defaulted: assuming it either way would
   * change which listings are candidates on evidence nobody gave.
   */
  sizeRoute: SizeRoute | null
  /** Each posture names the evidence behind it. No posture is asserted bare. */
  trace: Readonly<Record<'map' | 'project' | 'personalization' | 'sizeRoute', Trace>>
}

export interface StructuredBrief {
  version: 2
  searchPattern: SearchPattern
  nonNegotiables: readonly NonNegotiable[]
  flexOrder: FlexOrder
  doNotFlex: readonly BriefItem[]
  skipFaster: readonly BriefItem[]
  secondLook: readonly SecondLookItem[]
  showingTests: readonly ShowingTest[]
  doNotSubstitute: readonly Substitution[]
  expectedTradeoff: ExpectedTradeoffItem | null
  unresolved: readonly UnresolvedItem[]
  practicalProgram: readonly BriefItem[]
  /** Verbatim handoff, or null when nothing was supplied. */
  searchFacts: Handoff | null
  discrepancies: readonly Discrepancy[]
  /**
   * The shared concept id for every fact in the brief.
   *
   * One home, and every other section is a reference to it. This is what tells
   * the renderer that a functional requirement in `nonNegotiables` and the
   * same requirement in `practicalProgram` are ONE signal described twice for
   * two different purposes, not two independent things the buyer said.
   */
  conceptIndex: Readonly<
    Record<string, { home: string; referencedIn: readonly string[]; attribute: boolean }>
  >
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

const traceOf = (action: AgentAction): Trace => ({
  layer: 'derived',
  because: action.because,
  sources: action.sources,
  rules: action.rules,
})

const item = (action: AgentAction): BriefItem => ({
  id: action.id,
  subject: action.subject,
  ...(action.qualifier ? { qualifier: action.qualifier } : {}),
  trace: traceOf(action),
})

/** What a second look explicitly does not license. Keyed by the action. */
const DOES_NOT_IMPLY: Readonly<Record<string, readonly string[]>> = {
  'secondLook.cosmeticallyPlain': ['renovationTolerance', 'structuralWork'],
  'secondLook.datedButSound': ['acceptingABadPlan', 'acceptingACompromisedSite'],
  'secondLook.architecturalButUnstyled': ['renovationTolerance'],
  // Appetite for an addition, never a claim that this property can take one.
  'secondLook.smallerWithPotential': ['sizeIsNegotiable', 'expansionIsFeasibleHere'],
  // Reworking a plan is not accepting less area than they need.
  'secondLook.badlyArrangedNotSmall': ['sizeIsNegotiable', 'insufficientAreaIsAcceptable'],
}

/**
 * Rules whose showing test verifies a need the buyer stated outright.
 *
 * Everything else reaches a showing test by combining signals, and the
 * distinction is what stops a conclusion of ours being read back as theirs.
 */
const STATED_NEED_RULES: readonly string[] = ['operationalNeedsInspection', 'siteNeedsInspection']

function projectPosture(result: Result, strategy: Strategy): SearchPattern['project'] {
  const { renovation, dayOne, cosmetic } = strategy.buyerEvidence.bands
  if (result.needs === 'depends') return 'undecided'
  if (result.stances.has('structuralWorkOkay')) return 'major'
  if (dayOne === 'yes' || (renovation === 'no' && cosmetic !== 'yes')) return 'turnkey'
  if (renovation === 'no' && cosmetic === 'yes') return 'cosmeticOnly'
  if (renovation === 'yes') return 'major'
  if (renovation === 'conditional') return 'contained'
  return 'notEstablished'
}

/**
 * ONE SOURCE OF TRUTH WITH THE STRATEGY ENGINE.
 *
 * This reads the same band the rules fired on, so the brief can never describe
 * a buyer one way while carrying actions produced by reading them another way.
 *
 * KNOWN LIMIT, DELIBERATELY NOT PAPERED OVER HERE. The personalization scale
 * has one question and four options, and the middle band is arithmetically
 * unreachable, so "some changes" and "all of it" both arrive as `yes`. The
 * posture names are therefore the band's, not a magnitude we cannot support,
 * and the trace records which option was actually chosen.
 */
function personalizationPosture(strategy: Strategy): SearchPattern['personalization'] {
  switch (strategy.buyerEvidence.bands.cosmetic) {
    case 'yes':
      return 'wantsToMakeItTheirs'
    case 'conditional':
      return 'someChanges'
    case 'no':
      return 'prefersItLeftAlone'
    default:
      return 'notEstablished'
  }
}

/**
 * Discrepancies.
 *
 * CONSERVATIVE BY CONSTRUCTION. Absence in the handoff is never a
 * contradiction, and neither is a handoff fact the test simply did not cover.
 * Only an explicit incompatible statement qualifies.
 *
 * Structured fields are compared directly. Free text is NOT parsed for meaning:
 * where a note contains a phrase that may contradict the test, the brief
 * quotes it verbatim beside the evidence and marks it for clarification. That
 * is co-location, not interpretation, and it never changes a score.
 */
const RENOVATION_PHRASES = [
  'gut',
  'gutting',
  'down to the studs',
  'major renovation',
  'full renovation',
  'tear it down',
  'rebuild',
]

function discrepanciesFor(result: Result, strategy: Strategy, handoff: Handoff): Discrepancy[] {
  const found: Discrepancy[] = []
  const qualifiers = Object.fromEntries(
    result.attributes.filter((entry) => entry.qualifier).map((e) => [e.attribute.id, e.qualifier]),
  )
  const upkeep = result.attributes.find((entry) => entry.attribute.id === 'upkeep')

  // The buyer named pool maintenance as a burden and then required a pool.
  if (
    handoff.hardFilters?.pool === 'required' &&
    qualifiers.upkeep === 'pool' &&
    upkeep &&
    upkeep.state !== 'unknown'
  ) {
    found.push({
      kind: 'structuredConflict',
      testEvidence: 'upkeep qualifier = pool',
      handoffFact: 'hardFilters.pool = required',
      status: 'needsClarification',
      trace: { layer: 'derived', because: ['upkeep = ' + upkeep.state, 'qualifier = pool'], sources: ['daily', 'handoff'] },
    })
  }

  // A step-free requirement against circulation never being raised is NOT a
  // conflict, so only the opposite direction is checked: they said stairs would
  // wear on them and then recorded no preference. That is also not a conflict.
  // Nothing is emitted here on purpose.

  // Free text that may contradict a settled renovation posture.
  const note = [handoff.buyerNote, handoff.timing?.note, handoff.geography?.note]
    .filter((value): value is string => Boolean(value))
    .join(' · ')
  if (note && strategy.buyerEvidence.bands.renovation === 'no') {
    const hit = RENOVATION_PHRASES.find((phrase) => note.toLowerCase().includes(phrase))
    if (hit) {
      found.push({
        kind: 'freeTextMayConflict',
        testEvidence: 'renovationTolerance = no',
        handoffFact: 'buyer note mentions major work',
        quote: note,
        status: 'needsClarification',
        trace: {
          layer: 'derived',
          because: ['renovation = no', `note contains "${hit}"`, 'free text, quoted rather than interpreted'],
          sources: ['project', 'handoff'],
        },
      })
    }
  }

  return found
}

export function assembleBrief(
  result: Result,
  strategy: Strategy,
  handoff?: Handoff,
): StructuredBrief {
  const supplied = handoff && !isEmptyHandoff(handoff) ? handoff : null

  const nonNegotiables: NonNegotiable[] = result.attributes
    .filter((entry) => entry.state === 'protect')
    .map((entry) => {
      const order = entry.evidence.ordering[0]
      return {
        attribute: entry.attribute.id,
        qualifier: entry.qualifier,
        changeability: entry.attribute.changeability,
        direct: entry.evidence.direct,
        directSources: entry.evidence.directSources,
        statedRank: entry.evidence.statedRank,
        corroboration: entry.evidence.corroboration,
        repeated: entry.repeated,
        ordering: order ? { against: order.against, outcome: order.outcome } : null,
        trace: { layer: 'buyerEvidence', sources: entry.evidence.directSources },
      }
    })

  const skipFaster = strategy.derived.filterHard.map(item)
  const skipped = new Set(skipFaster.map((entry) => entry.subject))
  const byAttribute = new Map(nonNegotiables.map((entry) => [entry.attribute, entry]))

  /*
   * A do-not-flex only survives when it changes the search on its own.
   *
   * Against a skip-faster it is noise: eliminating listings on something
   * already implies not quietly compromising it. Against a non-negotiable it
   * is the buyer's own answer read back. In the second case the derived
   * reasoning is folded into that attribute rather than thrown away, so the
   * concept keeps one home and the audit trail survives.
   */
  const doNotFlex: BriefItem[] = []
  for (const action of strategy.derived.doNotFlex) {
    if (skipped.has(action.subject)) continue
    const already = byAttribute.get(action.subject)
    if (already) {
      already.reinforcedBy = [...(already.reinforcedBy ?? []), traceOf(action)]
      continue
    }
    doNotFlex.push(item(action))
  }

  /*
   * The rank is dense over the levers actually offered, in the order the
   * strategy sorted them. Reading it off the emitted array leaves holes
   * wherever a candidate was eligible without being selected.
   */
  const ranked = strategy.derived.flexFirst
    .filter((action) =>
      strategy.derived.lever.candidates.some((c) => c.concept === action.subject && c.accepted),
    )
    .map((action) => action.subject)

  const flexOrder: FlexOrder = {
    state: strategy.derived.lever.state,
    reason: strategy.derived.lever.reason,
    candidates: strategy.derived.lever.candidates.map((candidate): LeverEntry => {
      const emitted = strategy.derived.flexFirst.find((action) => action.subject === candidate.concept)
      if (candidate.accepted && emitted) {
        return {
          lever: candidate.concept,
          status: 'available',
          rank: ranked.indexOf(candidate.concept) + 1,
          trace: traceOf(emitted),
        }
      }
      if (candidate.accepted) {
        return {
          lever: candidate.concept,
          status: 'notSelected',
          trace: {
            layer: 'derived',
            because: ['it could move', 'stronger levers were available, so we do not lead with it'],
            rules: ['leverSelection'],
          },
        }
      }
      return {
        lever: candidate.concept,
        status: 'vetoed',
        ...(candidate.vetoedBy ? { veto: candidate.vetoedBy } : {}),
        trace: {
          layer: 'derived',
          because: [`vetoed: ${candidate.vetoedBy ?? 'unknown'}`],
          rules: ['leverDiagnosis'],
        },
      }
    }),
    ...(strategy.derived.lever.state === 'notEstablished'
      ? { missing: missingFor(strategy.derived.lever) }
      : {}),
  }

  const expected = strategy.derived.expectedTradeoff
  const orderedByQ8 =
    expected && result.tradeoff?.winner
      ? result.tradeoff.pair.includes(expected.a) && result.tradeoff.pair.includes(expected.b)
      : false

  const brief: StructuredBrief = {
    version: 2,
    searchPattern: {
      map: result.map,
      project: projectPosture(result, strategy),
      personalization: personalizationPosture(strategy),
      leverState: strategy.derived.lever.state,
      sizeRoute: result.sizeRoute,
      trace: {
        map: {
          layer: 'buyerEvidence',
          sources: result.answeredQuestionIds.includes('location') ? ['location'] : [],
        },
        project: {
          layer: 'derived',
          because: [
            `renovationTolerance = ${strategy.buyerEvidence.bands.renovation}`,
            `dayOneReadiness = ${strategy.buyerEvidence.bands.dayOne}`,
            ...(result.needs === 'depends' ? ['the follow-up is still open'] : []),
            ...(result.stances.has('structuralWorkOkay') ? ['structuralWorkOkay'] : []),
          ],
          sources: result.answeredQuestionIds.filter((id) => id === 'project' || id === 'depends'),
          rules: ['projectPosture'],
        },
        personalization: {
          layer: 'derived',
          because: [`personalizationAppetite = ${strategy.buyerEvidence.bands.cosmetic}`],
          sources: result.answeredQuestionIds.filter((id) => id === 'personalization'),
          rules: ['personalizationPosture'],
        },
        // Stated outright by the follow-up, so it is evidence, not a reading.
        sizeRoute: {
          layer: 'buyerEvidence',
          sources: result.answeredQuestionIds.filter((id) => id === 'sizeRoute'),
        },
      },
    },
    nonNegotiables,
    flexOrder,
    doNotFlex,
    skipFaster,
    secondLook: strategy.derived.secondLook.map((action) => ({
      ...item(action),
      doesNotImply: DOES_NOT_IMPLY[action.id] ?? [],
    })),
    showingTests: strategy.derived.showingTests.map((action) => ({
      ...item(action),
      // Verifying something the buyer named is evidence-led; verifying
      // something a combination produced is strategy-led.
      origin: action.rules.some((rule) => STATED_NEED_RULES.includes(rule)) ? 'buyerEvidence' : 'derived',
    })),
    doNotSubstitute: strategy.derived.doNotSubstitute.map((action) => ({
      wanted: action.subject,
      doNotSubstitute: substitutionFor(action.id),
      trace: traceOf(action),
    })),
    expectedTradeoff: expected
      ? {
          sideA: expected.a,
          sideB: expected.b,
          ordering: orderedByQ8 ? 'sideAWins' : 'none',
          why: expected.why,
          confidence: orderedByQ8 ? 'established' : 'toTest',
          trace: { layer: 'derived', because: expected.because, sources: expected.sources },
        }
      : null,
    unresolved: strategy.derived.unresolvedLever
      ? [
          {
            id: strategy.derived.unresolvedLever.id,
            leverage: 1,
            trace: {
              layer: 'derived',
              because: strategy.derived.unresolvedLever.because,
              sources: strategy.derived.unresolvedLever.sources,
            },
          },
        ]
      : [],
    /*
     * The literal functional requirements: pantry, EV charging, circulation,
     * a pool that needs maintaining. Kept whole, including the protect-level
     * ones, because a non-negotiable says do not compromise it while this says
     * the house has to have it. `conceptIndex` records which is the home.
     */
    practicalProgram: strategy.practicalProgram.map(item),
    searchFacts: supplied,
    discrepancies: supplied ? discrepanciesFor(result, strategy, supplied) : [],
    conceptIndex: {},
  }

  return { ...brief, conceptIndex: indexConcepts(brief) }
}

/**
 * What we never gathered, named by the question that would settle it.
 *
 * `notEstablished` is a statement about our own instrument, so it has to be
 * specific enough to act on. A generic "no secondary preference" tells Danielle
 * nothing; "the renovation question was never answered" tells her what to ask.
 */
const GAP_TEXT: Readonly<Record<string, string>> = {
  renovationNotEstablished: 'the renovation question was never answered, so condition could not be weighed',
  personalizationNotEstablished: 'the personalization question was never answered, so finish could not be weighed',
  unresolvedProject: 'they said it depends how much work, and the follow-up is still open',
}

function missingFor(lever: LeverDiagnosis): readonly string[] {
  const gaps = lever.candidates
    .map((candidate) => candidate.vetoedBy)
    .filter((reason): reason is VetoReason => Boolean(reason) && isMeasurementGap(reason!))
    .map((reason) => GAP_TEXT[reason])
  const unique = [...new Set(gaps)]
  return unique.length > 0
    ? unique
    : ['nothing softer than their hard constraints was ever gathered']
}

/** The false equivalence each substitution action guards against. */
function substitutionFor(actionId: string): string {
  switch (actionId) {
    case 'noSub.sizeForUsableOutdoor':
      return 'largeYard'
    case 'noSub.stagingForArchitecture':
      return 'staging'
    case 'noSub.newKitchenForGoodLayout':
      return 'newKitchen'
    default:
      return 'unknown'
  }
}

/**
 * Where each concept is described, and where it is only referred to.
 *
 * This is what lets the renderer avoid the old failure, where the kitchen
 * appeared under four headings as four separate findings. A concept has one
 * home; everything else is a reference to it.
 *
 * The home is the highest-priority section the concept actually appears in.
 * That matters because a concept can reach the brief without being protected
 * or operational at all: `condition` arrives as a lever in most briefs and is
 * described nowhere else, so `flexOrder` is legitimately its home. Leaving it
 * homeless would give the renderer a concept it is never allowed to introduce.
 */
const SECTION_PRIORITY = [
  'nonNegotiables',
  'practicalProgram',
  'showingTests',
  'skipFaster',
  'doNotFlex',
  'flexOrder',
  'secondLook',
  'doNotSubstitute',
] as const

function indexConcepts(brief: StructuredBrief): StructuredBrief['conceptIndex'] {
  const appearances = new Map<string, Set<string>>()
  /*
   * EVERY concept, not only taxonomy attributes.
   *
   * `sizeRoute`, `geography`, `condition` and `cosmeticFinish` can each appear
   * in two sections, and the renderer needs the same record for them that it
   * has for an attribute: this is one fact with one home, not two signals.
   */
  const put = (subject: string, section: string) => {
    const sections = appearances.get(subject) ?? new Set<string>()
    sections.add(section)
    appearances.set(subject, sections)
  }

  for (const entry of brief.nonNegotiables) put(entry.attribute, 'nonNegotiables')
  for (const entry of brief.practicalProgram) put(entry.subject, 'practicalProgram')
  for (const entry of brief.showingTests) put(entry.subject, 'showingTests')
  for (const entry of brief.skipFaster) put(entry.subject, 'skipFaster')
  for (const entry of brief.doNotFlex) put(entry.subject, 'doNotFlex')
  for (const lever of brief.flexOrder.candidates) put(lever.lever, 'flexOrder')
  for (const entry of brief.secondLook) put(entry.subject, 'secondLook')
  for (const entry of brief.doNotSubstitute) put(entry.wanted, 'doNotSubstitute')

  const index: Record<string, { home: string; referencedIn: readonly string[]; attribute: boolean }> = {}
  for (const [subject, sections] of appearances) {
    const ordered = SECTION_PRIORITY.filter((section) => sections.has(section))
    index[subject] = {
      home: ordered[0],
      referencedIn: ordered.slice(1),
      // False for a derived concept, which has no entry in the taxonomy and so
      // can never carry buyer evidence of its own.
      attribute: Boolean(attributeById(subject)),
    }
  }
  return index
}
