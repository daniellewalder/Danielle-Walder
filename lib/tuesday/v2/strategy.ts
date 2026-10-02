import { type MapConstraint, type SizeRoute, type StanceId } from './model.ts'
import { bandOf, type Band, type ReadAttribute, type Result } from './score.ts'
import { MAP } from './tradeoff.ts'
import { diagnoseLever, type LeverDiagnosis } from './lever.ts'

/**
 * The search-strategy engine.
 *
 * It sits between raw evidence and any language at all, and answers one
 * question: given what this buyer established, what should Danielle do
 * differently? The output is structured operations, never prose.
 *
 * THREE LAYERS, KEPT APART.
 *
 *   A  BUYER EVIDENCE      what they directly told us
 *   B  DERIVED STRATEGY    what follows from combinations of their answers
 *   C  MARKET KNOWLEDGE    external facts about inventory, prices, stock
 *
 * C IS EMPTY AND MUST STAY EMPTY until a real data source exists. Nothing here
 * may assert that something is rare, that a kind of house tends to lack a
 * feature, or that bad photographs mean opportunity. Those read as expertise
 * and are guesses.
 *
 * THE NO-SHIT-SHERLOCK LINE. If an action is the buyer's answer rewritten, it
 * belongs in `buyerEvidence` or `practicalProgram`. Layer B has to combine
 * signals or draw a consequence.
 */

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export type ActionKind =
  | 'filterHard'
  | 'flexFirst'
  | 'doNotFlex'
  | 'secondLook'
  | 'showingTest'
  | 'doNotSubstitute'
  | 'practicalProgram'

/**
 * One operational instruction.
 *
 * `id` is the deduplication key and the thing copy will later be written
 * against. `because` and `sources` are the audit trail: every action names the
 * facts that produced it and the questions those facts came from.
 */
export interface AgentAction {
  kind: ActionKind
  id: string
  /** The attribute, concept or lever this acts on. */
  subject: string
  /** Present only when a bundled attribute's qualifier licenses the precision. */
  qualifier?: string
  /** Ranking within a slot. Lower sorts first. Used by flexFirst. */
  order?: number
  because: readonly string[]
  sources: readonly string[]
  /** Which combination rules contributed. Merged on deduplication. */
  rules: readonly string[]
}

export interface ExpectedTradeoff {
  a: string
  b: string
  /** A reason code, not prose. */
  why: string
  because: readonly string[]
  sources: readonly string[]
}

export interface UnresolvedLever {
  id: string
  because: readonly string[]
  sources: readonly string[]
}

export interface Strategy {
  /** Layer A. Facts, compressed but not interpreted. */
  buyerEvidence: {
    protect: readonly { id: string; qualifier: string | null; rank: number | null; repeated: boolean }[]
    scrutinize: readonly string[]
    map: MapConstraint | null
    bands: Record<'cosmetic' | 'renovation' | 'dayOne', Band>
    stances: readonly StanceId[]
    tradeoff: Result['tradeoff']
    notEstablished: readonly string[]
  }
  /** Layer B. Everything here combines signals or draws a consequence. */
  derived: {
    filterHard: readonly AgentAction[]
    flexFirst: readonly AgentAction[]
    doNotFlex: readonly AgentAction[]
    secondLook: readonly AgentAction[]
    showingTests: readonly AgentAction[]
    doNotSubstitute: readonly AgentAction[]
    expectedTradeoff: ExpectedTradeoff | null
    unresolvedLever: UnresolvedLever | null
    /**
     * Whether a lever exists, and when it does not, which of the two findings
     * that is. `closed` means the buyer's own answers shut every route, which
     * is real information. `notEstablished` means we never gathered anything
     * that could move, which is our gap and must never be reported as though
     * the buyer were inflexible.
     */
    lever: LeverDiagnosis
  }
  /** Factual operational checklist. Not analysis. */
  practicalProgram: readonly AgentAction[]
  /** Layer C. Empty by design until a market-data source exists. */
  market: readonly never[]
  firedRules: readonly string[]
}

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

/**
 * What the size lever actually means, per route.
 *
 * Never more than the answer supports. "I'd have to see the house" is not a
 * statement that the size can be created, so that route says only that the
 * question is open at the property.
 */
const SIZE_LEVER: Readonly<Record<string, string>> = {
  unsettled: 'whether the size must already exist is not yet established',
  additionOkay: 'the size may be created by adding on, subject to the property',
  reconfigureOkay: 'the existing area may be made to work by reworking the plan',
  propertySpecific: 'whether the size can be solved is a question for the actual house',
}

/**
 * What to look at on the site, by qualifier.
 *
 * Each is an instruction to inspect, never a finding. `whole` is deliberately
 * one line: the buyer said the whole thing, which is one answer, and splitting
 * it into four would turn a single signal into four separate concerns.
 */
const SITE_FOCUS: Readonly<Record<string, string>> = {
  land: 'inspect the slope, the shape and which parts of the land are usable',
  sits: 'inspect how the house actually sits on the property',
  neighbours: 'inspect the physical relationship to the neighbouring structures',
  access: 'inspect the arrival, the driveway and how the property is entered',
  whole: 'inspect the site as one thing, not as four separate checks',
  none: 'inspect the overall site fit',
}

/** Where the size evidence came from. Used by every size-route rule. */
const sizeSources = (s: Signals): readonly string[] =>
  s.byId.get('size')?.evidence.directSources ?? []

/** Clusters used for filtering decisions. Organizational only. */
const SPATIAL = ['size', 'separation', 'publicRooms', 'layout']
const SITE_QUALITIES = ['light', 'privacy', 'outdoor', 'street', 'site']
const FINISH = ['condition', 'kitchen']
const OPERATIONAL = ['circulation', 'utility', 'parking', 'upkeep']

export interface Signals {
  map: MapConstraint | null
  reno: Band
  pers: Band
  dayOne: Band
  stances: ReadonlySet<StanceId>
  byId: ReadonlyMap<string, ReadAttribute>
  protectedIds: ReadonlySet<string>
  qualifiers: Readonly<Record<string, string>>
  protectedIn: (ids: readonly string[]) => ReadAttribute[]
  /** Protected things that filter inventory. Excludes operational. */
  specificity: number
  tradeoff: Result['tradeoff']
  tradeoffLoserProtected: boolean
  declinedTradeoff: boolean
  projectUnresolved: boolean
  /** HOW the protected size may be satisfied, once settled. Null until then. */
  sizeRoute: SizeRoute | null
  answered: number
  /**
   * Subjects that a filter rule will eliminate on.
   *
   * Computed up front because the lever rules need it: offering a buyer a
   * "give" on something the same result eliminates listings for is a straight
   * contradiction, and it is far better to report that no lever is established
   * than to invent one.
   */
  hardFiltered: ReadonlySet<string>
}

export function signalsOf(result: Result): Signals {
  const byId = new Map(result.attributes.map((entry) => [entry.attribute.id, entry]))
  const protectedIds = new Set(
    result.attributes.filter((entry) => entry.state === 'protect').map((entry) => entry.attribute.id),
  )
  const protectedIn = (ids: readonly string[]) =>
    ids.map((id) => byId.get(id)).filter((entry): entry is ReadAttribute => entry?.state === 'protect')

  const loser = result.tradeoff?.winner
    ? result.tradeoff.pair.find((side) => side !== result.tradeoff!.winner)
    : undefined

  const reno = bandOf('renovationTolerance', result)
  const qualifiers = Object.fromEntries(
    result.attributes.filter((e) => e.qualifier).map((e) => [e.attribute.id, e.qualifier as string]),
  )
  const hardFiltered = new Set<string>()
  if (reno !== 'yes') for (const entry of protectedIn(SPATIAL)) hardFiltered.add(entry.attribute.id)
  if (reno === 'no') for (const entry of protectedIn(FINISH)) hardFiltered.add(entry.attribute.id)
  if (protectedIds.has('architecturalCharacter')) hardFiltered.add('architecturalCharacter')
  if (protectedIds.has('upkeep') && qualifiers.upkeep) hardFiltered.add('upkeep')

  return {
    map: result.map,
    reno,
    pers: bandOf('personalizationAppetite', result),
    dayOne: bandOf('dayOneReadiness', result),
    stances: result.stances,
    byId,
    protectedIds,
    qualifiers,
    hardFiltered,
    protectedIn,
    specificity: protectedIn([...SPATIAL, ...SITE_QUALITIES, ...FINISH, 'architecturalCharacter']).length,
    tradeoff: result.tradeoff,
    tradeoffLoserProtected: Boolean(loser && protectedIds.has(loser)),
    declinedTradeoff: result.declinedTradeoff,
    projectUnresolved: result.needs === 'depends',
    sizeRoute: result.sizeRoute,
    answered: result.answered,
  }
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

interface Emission {
  actions?: AgentAction[]
  tradeoff?: ExpectedTradeoff & { priority: number }
  unresolved?: UnresolvedLever & { priority: number }
  /** flexFirst ids this rule forbids, whatever another rule proposed. */
  veto?: string[]
}

interface Rule {
  id: string
  /** Precedence tier. Lower runs first and its vetoes bind. */
  tier: number
  when: (s: Signals) => boolean
  emit: (s: Signals) => Emission
}

const act = (
  kind: ActionKind,
  id: string,
  subject: string,
  because: string[],
  sources: string[],
  rule: string,
  extra: Partial<AgentAction> = {},
): AgentAction => ({ kind, id, subject, because, sources, rules: [rule], ...extra })

const band = (name: string, value: Band) => `${name} = ${value}`

/**
 * Tiers, derived from what each layer is allowed to decide.
 *
 *  1  blockers        an unresolved project decision changes what any later
 *                     rule may claim, so it runs first and can veto
 *  2  map x project   sets the primary lever and the primary do-not-flex
 *  3  the tradeoff    direct evidence of what gives, so it outranks a generic
 *                     lever rule and is allowed to insert ahead of it
 *  4  property x project
 *  5  architecture x personalization
 *  6  operational burden
 *  7  low information fallback, fires only when nothing else did
 */
const RULES: readonly Rule[] = [
  // --- tier 1: blockers ----------------------------------------------------
  {
    id: 'projectUnresolved',
    tier: 1,
    when: (s) => s.projectUnresolved,
    emit: () => ({
      // Condition cannot be called a lever while appetite is unestablished.
      veto: ['flex.condition'],
      unresolved: {
        id: 'renovationAppetite',
        because: ['project = depends', 'follow-up not answered'],
        sources: ['project'],
        priority: 1,
      },
    }),
  },
  {
    id: 'noOrderingEstablished',
    tier: 1,
    when: (s) => s.specificity >= 3 && !s.tradeoff,
    emit: (s) => ({
      unresolved: {
        id: 'whatWouldGive',
        because: [`${s.specificity} protected criteria`, 'no forced choice answered'],
        sources: ['dealbreaker', 'daily'],
        priority: 3,
      },
    }),
  },
  {
    id: 'tradeoffDeclined',
    tier: 1,
    when: (s) => s.declinedTradeoff,
    emit: () => ({
      unresolved: {
        id: 'whatWouldGive',
        because: ['tradeoff declined', 'no ordering established'],
        sources: ['tradeoff'],
        priority: 2,
      },
    }),
  },

  // --- tier 2: map x project ----------------------------------------------
  {
    id: 'fixedMap',
    tier: 2,
    when: (s) => s.map === 'fixed',
    emit: () => ({
      actions: [
        act('doNotFlex', 'doNotFlex.geography', 'geography', ['map = fixed'], ['location'], 'fixedMap'),
      ],
      veto: ['flex.geography'],
    }),
  },
  {
    id: 'fixedMapLowReno',
    tier: 2,
    when: (s) => s.map === 'fixed' && (s.reno === 'no' || s.dayOne === 'yes'),
    emit: (s) => ({
      actions: [
        act('doNotFlex', 'doNotFlex.condition', 'condition', ['map = fixed', band('renovation', s.reno)], ['location', 'project'], 'fixedMapLowReno'),
      ],
      veto: ['flex.condition'],
    }),
  },
  {
    id: 'movableMapLowReno',
    tier: 2,
    when: (s) => (s.map === 'strongPreference' || s.map === 'fewAreas') && s.reno === 'no',
    emit: (s) => ({
      actions: [
        act('doNotFlex', 'doNotFlex.condition', 'condition', [`map = ${s.map}`, band('renovation', s.reno)], ['location', 'project'], 'movableMapLowReno'),
      ],
      veto: ['flex.condition'],
    }),
  },
  {
    id: 'propertyLedStrict',
    tier: 2,
    when: (s) => s.map === 'propertyLed' && s.specificity >= 3,
    emit: (s) => ({
      actions: [
        ...s.protectedIn([...SPATIAL, ...SITE_QUALITIES]).map((entry) =>
          act('doNotFlex', `doNotFlex.${entry.attribute.id}`, entry.attribute.id,
            ['map = propertyLed', `${entry.attribute.id} = protect`], ['location', ...entry.evidence.directSources], 'propertyLedStrict'),
        ),
      ],
    }),
  },
  {
    id: 'fewAreasStrict',
    tier: 2,
    when: (s) => s.map === 'fewAreas' && s.specificity >= 3,
    emit: (s) => ({
      actions: s.protectedIn([...SPATIAL, ...SITE_QUALITIES]).map((entry) =>
        act('doNotFlex', `doNotFlex.${entry.attribute.id}`, entry.attribute.id,
          ['map = fewAreas', `${entry.attribute.id} = protect`, 'area selection is the lever'],
          ['location', ...entry.evidence.directSources], 'fewAreasStrict'),
      ),
    }),
  },

  // --- tier 3: the tradeoff -----------------------------------------------
  /*
   * CONCEPT LEVERS.
   *
   * A lever is a property of the evidence, not of the map posture. Writing one
   * rule per posture meant a property-led buyer who would happily renovate was
   * never told condition could give, and a buyer who will paper every room was
   * never told an unstyled house counts as a give. These say it once.
   */
  {
    id: 'geographyLever',
    tier: 2,
    /*
     * NOT `propertyLed`. That buyer already told us the property leads and the
     * area is open, so "give on geography first" is their own answer read back
     * to them, and there is no constraint left there to trade. The lever
     * diagnosis vetoes it as `geographyAlreadyOpen`; this rule used to offer it
     * anyway, and the two disagreed silently.
     */
    when: (s) => s.map === 'strongPreference' || s.map === 'fewAreas',
    emit: (s) => ({
      actions: [
        act('flexFirst', 'flex.geography', 'geography', [`map = ${s.map}`], ['location'], 'geographyLever', { order: 20 }),
      ],
    }),
  },
  {
    id: 'conditionLever',
    tier: 2,
    when: (s) => s.reno === 'yes' && !s.projectUnresolved,
    emit: (s) => ({
      actions: [
        act('flexFirst', 'flex.condition', 'condition', [band('renovation', s.reno), 'work is on the table'], ['project'], 'conditionLever', { order: 15 }),
      ],
    }),
  },
  {
    id: 'cosmeticFinishLever',
    tier: 2,
    when: (s) => s.pers === 'yes',
    emit: (s) => ({
      actions: [
        // A give on PRESENTATION, and nothing else. Saying an unstyled house is
        // acceptable implies nothing whatever about moving a wall, so this
        // never touches condition or renovation tolerance.
        act('flexFirst', 'flex.cosmeticFinish', 'cosmeticFinish',
          [band('cosmetic', s.pers), 'an unstyled house is acceptable', 'implies nothing about renovation'],
          ['personalization'], 'cosmeticFinishLever', { order: 10 }),
      ],
    }),
  },
  {
    id: 'sizeRouteLever',
    tier: 2,
    /*
     * NOT when the buyer said it has to be big enough already. That answer
     * closes this route explicitly, and offering it afterwards would be
     * flexing on something they just ruled out.
     */
    when: (s) =>
      s.protectedIds.has('size') &&
      s.stances.has('structuralWorkOkay') &&
      s.sizeRoute !== 'existingOnly',
    emit: (s) => ({
      actions: [
        // The ROUTE to the required size, not the size. Size stays protected;
        // what can move is whether it already exists.
        act('flexFirst', 'flex.sizeRoute', 'sizeRoute',
          ['size = protect', 'structuralWorkOkay',
            ...(s.sizeRoute ? [`sizeRoute = ${s.sizeRoute}`] : ['the route is not settled yet']),
            SIZE_LEVER[s.sizeRoute ?? 'unsettled']],
          [...(s.byId.get('size')?.evidence.directSources ?? []),
            'project', ...(s.sizeRoute ? ['sizeRoute'] : [])], 'sizeRouteLever', { order: 25 }),
      ],
    }),
  },
  {
    id: 'tradeoffBothProtected',
    tier: 3,
    when: (s) => Boolean(s.tradeoff?.winner) && s.tradeoffLoserProtected,
    emit: (s) => {
      const [a, b] = s.tradeoff!.pair
      const winner = s.tradeoff!.winner!
      const loser = a === winner ? b : a
      return {
        tradeoff: {
          a: winner,
          b: loser,
          why: 'bothProtectedAndOrderedByForcedChoice',
          because: [`${winner} = protect`, `${loser} = protect`, `forced choice: ${winner} over ${loser}`],
          sources: ['tradeoff', ...(s.byId.get(loser)?.evidence.directSources ?? [])],
          priority: 1,
        },
        actions: [
          act('doNotFlex', `doNotFlex.${loser}`, loser,
            [`${loser} = protect`, `lost a forced choice but stayed protected`],
            ['tradeoff', ...(s.byId.get(loser)?.evidence.directSources ?? [])], 'tradeoffBothProtected'),
        ],
      }
    },
  },
  {
    id: 'tradeoffLoserWeaker',
    tier: 3,
    when: (s) => Boolean(s.tradeoff?.winner) && !s.tradeoffLoserProtected,
    emit: (s) => {
      const [a, b] = s.tradeoff!.pair
      const winner = s.tradeoff!.winner!
      const loser = a === winner ? b : a
      /*
       * WHICH WAY THE MAP WENT.
       *
       * The map LOSING means the buyer chose the property over the area, so
       * geography is the thing they have already agreed to spend. An earlier
       * version read that backwards and marked geography as do-not-flex, which
       * is the opposite of what the answer says.
       *
       * The map WINNING means geography is firmer than the stated posture, and
       * the property criterion is where the search gives.
       */
      if (loser === MAP) {
        return {
          actions: [
            act('flexFirst', 'flex.geography', 'geography',
              ['geography lost a forced choice', 'the property criterion won', 'they have agreed to spend the map'],
              ['tradeoff', 'location'], 'tradeoffLoserWeaker', { order: 5 }),
          ],
        }
      }
      if (winner === MAP) {
        return {
          actions: [
            act('doNotFlex', 'doNotFlex.geography', 'geography',
              ['geography won a forced choice', 'firmer than the stated posture'],
              ['tradeoff', 'location'], 'tradeoffLoserWeaker'),
          ],
          veto: ['flex.geography'],
        }
      }
      return {
        actions: [
          act('flexFirst', `flex.${loser}`, loser,
            [`${loser} lost a forced choice`, `${loser} is not protected`],
            ['tradeoff'], 'tradeoffLoserWeaker', { order: 1 }),
        ],
      }
    },
  },

  // --- tier 4: property x project -----------------------------------------
  {
    id: 'spatialLowReno',
    tier: 4,
    when: (s) => s.protectedIn(SPATIAL).length > 0 && s.reno !== 'yes',
    emit: (s) => ({
      actions: s.protectedIn(SPATIAL).flatMap((entry) => [
        act('filterHard', `reject.${entry.attribute.id}`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, band('renovation', s.reno), 'not correctable without a project'],
          [...entry.evidence.directSources, 'project'], 'spatialLowReno'),
        act('doNotFlex', `doNotFlex.${entry.attribute.id}`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, band('renovation', s.reno)],
          [...entry.evidence.directSources, 'project'], 'spatialLowReno'),
      ]),
    }),
  },
  {
    id: 'spatialHighReno',
    tier: 4,
    when: (s) => s.protectedIn(SPATIAL).length > 0 && s.reno === 'yes',
    emit: (s) => ({
      actions: s.protectedIn(SPATIAL)
        // The size-route rules ask the same question about size, and ask it
        // more precisely, so the general check stands aside rather than
        // duplicating it under a vaguer heading.
        .filter((entry) => !(entry.attribute.id === 'size' && s.stances.has('structuralWorkOkay')))
        .map((entry) =>
        act('showingTest', `inspect.${entry.attribute.id}.correctable`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, band('renovation', s.reno), 'correctable in principle, so the question is whether it is correctable here'],
          [...entry.evidence.directSources, 'project'], 'spatialHighReno'),
      ),
    }),
  },
  /*
   * THE SIZE ROUTE.
   *
   * Size stays protected throughout. What differs is how the requirement may
   * be met, and each route produces different search behaviour:
   *
   *   unanswered        the question is open, so it is the unresolved item
   *   existingOnly      undersized is out; never kept on an enlargement guess
   *   additionOkay      undersized may stay in, subject to verification
   *   reconfigureOkay   badly arranged may stay in; genuinely too small is out
   *   propertySpecific  nothing is decided from the listing at all
   */
  {
    id: 'sizeRouteUnsettled',
    tier: 4,
    when: (s) =>
      s.protectedIds.has('size') && s.stances.has('structuralWorkOkay') && s.sizeRoute === null,
    emit: (s) => ({
      actions: [
        act('showingTest', 'inspect.expansionFeasibility', 'size',
          ['size = protect', 'structuralWorkOkay', 'expansion potential is a property fact, not a buyer priority'],
          [...sizeSources(s), 'project'], 'sizeRouteUnsettled'),
      ],
      unresolved: {
        id: 'mustSpaceExistAlready',
        because: ['size = protect', 'structuralWorkOkay', 'the size route has not been answered'],
        sources: ['dealbreaker', 'project'],
        priority: 2,
      },
    }),
  },
  {
    id: 'sizeExistingOnly',
    tier: 4,
    when: (s) => s.sizeRoute === 'existingOnly',
    emit: (s) => ({
      actions: [
        act('filterHard', 'reject.undersized', 'size',
          ['size = protect', 'sizeRoute = existingOnly', 'the space has to be there already'],
          [...sizeSources(s), 'sizeRoute'], 'sizeExistingOnly'),
        act('doNotFlex', 'hold.sizeRoute', 'sizeRoute',
          ['sizeRoute = existingOnly',
            'never kept as a candidate on the assumption it can be enlarged later'],
          ['sizeRoute'], 'sizeExistingOnly'),
      ],
    }),
  },
  {
    id: 'sizeAdditionOkay',
    tier: 4,
    when: (s) => s.sizeRoute === 'additionOkay',
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.smallerWithPotential', 'size',
          ['size = protect', 'sizeRoute = additionOkay', 'undersized may still be a candidate'],
          [...sizeSources(s), 'sizeRoute'], 'sizeAdditionOkay'),
        // The appetite is established. Whether THIS property can take an
        // addition is a fact about the property, and nothing here assumes it.
        act('showingTest', 'inspect.expansionFeasibility', 'size',
          ['sizeRoute = additionOkay', 'feasibility is a property fact, not an appetite'],
          [...sizeSources(s), 'sizeRoute'], 'sizeAdditionOkay'),
      ],
    }),
  },
  {
    id: 'sizeReconfigureOkay',
    tier: 4,
    when: (s) => s.sizeRoute === 'reconfigureOkay',
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.badlyArrangedNotSmall', 'size',
          ['size = protect', 'sizeRoute = reconfigureOkay',
            'the existing area may work when the problem is the arrangement'],
          [...sizeSources(s), 'sizeRoute'], 'sizeReconfigureOkay'),
        act('showingTest', 'inspect.areaCanBeRearranged', 'size',
          ['sizeRoute = reconfigureOkay', 'no addition wanted, so the question is the plan'],
          [...sizeSources(s), 'sizeRoute'], 'sizeReconfigureOkay'),
      ],
    }),
  },
  {
    id: 'sizePropertySpecific',
    tier: 4,
    when: (s) => s.sizeRoute === 'propertySpecific',
    emit: (s) => ({
      actions: [
        act('showingTest', 'inspect.sizeSolvableHere', 'size',
          ['size = protect', 'sizeRoute = propertySpecific',
            'not decidable from the listing, so the house and the site settle it'],
          [...sizeSources(s), 'sizeRoute'], 'sizePropertySpecific'),
      ],
    }),
  },
  {
    id: 'finishProtectedLowReno',
    tier: 4,
    when: (s) => s.protectedIn(FINISH).length > 0 && s.reno === 'no',
    emit: (s) => ({
      actions: s.protectedIn(FINISH).map((entry) =>
        act('filterHard', `reject.${entry.attribute.id}`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, band('renovation', s.reno)],
          [...entry.evidence.directSources, 'project'], 'finishProtectedLowReno'),
      ),
    }),
  },
  {
    id: 'persHighRenoLow',
    tier: 4,
    when: (s) => s.pers === 'yes' && s.reno === 'no',
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.cosmeticallyPlain', 'finishes',
          [band('cosmetic', s.pers), band('renovation', s.reno)], ['personalization', 'project'], 'persHighRenoLow'),
        ...(s.protectedIds.has('layout')
          ? [
              act('doNotSubstitute', 'noSub.newKitchenForGoodLayout', 'layout',
                ['layout = protect', band('cosmetic', s.pers), 'a renovated finish can mask an uncorrected plan'],
                ['dealbreaker', 'personalization'], 'persHighRenoLow'),
            ]
          : []),
      ],
    }),
  },
  {
    id: 'persHighRenoHigh',
    tier: 4,
    when: (s) => s.pers === 'yes' && s.reno === 'yes',
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.datedButSound', 'condition',
          [band('cosmetic', s.pers), band('renovation', s.reno)], ['personalization', 'project'], 'persHighRenoHigh'),
      ],
    }),
  },

  // --- tier 5: architecture x personalization ------------------------------
  {
    id: 'characterProtected',
    tier: 5,
    when: (s) => s.protectedIds.has('architecturalCharacter'),
    emit: (s) => ({
      actions: [
        act('filterHard', 'reject.lacksArchitecturalCharacter', 'architecturalCharacter',
          ['architecturalCharacter = protect', 'cannot be created'],
          [...(s.byId.get('architecturalCharacter')?.evidence.directSources ?? [])], 'characterProtected'),
        act('doNotSubstitute', 'noSub.stagingForArchitecture', 'architecturalCharacter',
          ['architecturalCharacter = protect', 'presentation and structure are different things'],
          ['architecture'], 'characterProtected'),
        act('showingTest', 'inspect.characterIsStructural', 'architecturalCharacter',
          ['architecturalCharacter = protect', 'only visible in person'],
          ['architecture'], 'characterProtected'),
      ],
    }),
  },
  {
    id: 'characterWithPersonalization',
    tier: 5,
    when: (s) => s.protectedIds.has('architecturalCharacter') && s.pers === 'yes',
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.architecturalButUnstyled', 'architecturalCharacter',
          ['architecturalCharacter = protect', band('cosmetic', s.pers)],
          ['architecture', 'personalization'], 'characterWithPersonalization'),
      ],
    }),
  },
  {
    id: 'characterWithoutPersonalization',
    tier: 5,
    when: (s) => s.protectedIds.has('architecturalCharacter') && (s.pers === 'no' || s.pers === 'conditional'),
    emit: (s) => ({
      actions: [
        act('doNotFlex', 'doNotFlex.architecturalCharacter', 'architecturalCharacter',
          ['architecturalCharacter = protect', band('cosmetic', s.pers), 'it has to arrive with both'],
          ['architecture', 'personalization'], 'characterWithoutPersonalization'),
      ],
    }),
  },
  {
    id: 'neutralWithPersonalization',
    tier: 5,
    when: (s) => s.stances.has('wantsNeutral') && s.pers === 'yes',
    emit: (s) => ({
      actions: [
        // The same operational instruction as persHighRenoLow reaches, so it
        // uses that id and merges into it. What this rule adds is the stronger
        // reason: plainness is wanted here, not merely tolerated, and that
        // survives in the evidence trail rather than as a second instruction.
        act('secondLook', 'secondLook.cosmeticallyPlain', 'finishes',
          ['wantsNeutral', band('cosmetic', s.pers), 'plainness is wanted, not tolerated'],
          ['architecture', 'personalization'], 'neutralWithPersonalization'),
      ],
    }),
  },

  // --- tier 6: operational burden ------------------------------------------
  {
    id: 'outdoorWithBurden',
    tier: 6,
    when: (s) => s.protectedIds.has('outdoor') && Boolean(s.qualifiers.upkeep),
    emit: (s) => {
      const qualifier = s.qualifiers.upkeep
      return {
        actions: [
          act('doNotSubstitute', 'noSub.sizeForUsableOutdoor', 'outdoor',
            ['outdoor = protect', `upkeep qualifier = ${qualifier}`, 'extent and usability are different things'],
            ['dealbreaker', 'daily'], 'outdoorWithBurden'),
          act('showingTest', 'inspect.outdoorUsability', 'outdoor',
            ['outdoor = protect', `upkeep qualifier = ${qualifier}`],
            ['dealbreaker', 'daily'], 'outdoorWithBurden'),
          act('showingTest', 'inspect.upkeep', 'upkeep',
            [`upkeep qualifier = ${qualifier}`, 'outdoor = protect'],
            ['daily', 'dealbreaker'], 'outdoorWithBurden', { qualifier }),
        ],
        tradeoff: {
          a: 'outdoor',
          b: 'upkeep',
          why: 'wantsTheOutsideButNotTheMaintenance',
          because: ['outdoor = protect', `upkeep qualifier = ${qualifier}`],
          sources: ['dealbreaker', 'daily'],
          priority: 4,
        },
      }
    },
  },
  {
    id: 'upkeepProtectedWithQualifier',
    tier: 6,
    when: (s) => s.protectedIds.has('upkeep') && Boolean(s.qualifiers.upkeep),
    emit: (s) => ({
      actions: [
        act('filterHard', `reject.upkeep.${s.qualifiers.upkeep}`, 'upkeep',
          ['upkeep = protect', `qualifier = ${s.qualifiers.upkeep}`],
          ['daily'], 'upkeepProtectedWithQualifier', { qualifier: s.qualifiers.upkeep }),
      ],
    }),
  },
  {
    id: 'operationalNeedsInspection',
    tier: 6,
    when: (s) => s.protectedIn(OPERATIONAL).length > 0,
    emit: (s) => ({
      actions: s.protectedIn(OPERATIONAL).map((entry) =>
        act('showingTest', `inspect.${entry.attribute.id}`, entry.attribute.id,
          [
            `${entry.attribute.id} = protect`,
            'verify per property',
            ...(entry.qualifier ? [`qualifier = ${entry.qualifier}`] : []),
          ],
          [...entry.evidence.directSources], 'operationalNeedsInspection',
          entry.qualifier ? { qualifier: entry.qualifier } : {}),
      ),
    }),
  },

  /*
   * THE SITE, IN PERSON.
   *
   * `site` is protect-at-purchase and had no showing test at all, which is odd
   * for the one attribute that is almost the definition of something a
   * photograph cannot carry.
   *
   * WHAT THE EVIDENCE LICENSES: this has to be looked at. Nothing more. It
   * does not license a claim that the slope is bad, that the neighbours are
   * too close, that the driveway is difficult or that the orientation is
   * wrong. Those are property facts and we have none. The qualifier only
   * narrows WHAT to look at, and `whole` stays one finding rather than
   * becoming four, because the buyer gave one answer.
   */
  {
    id: 'siteNeedsInspection',
    tier: 6,
    when: (s) => s.protectedIds.has('site'),
    emit: (s) => {
      const qualifier = s.qualifiers.site
      return {
        actions: [
          act('showingTest', 'inspect.siteFit', 'site',
            [
              'site = protect',
              ...(qualifier ? [`qualifier = ${qualifier}`] : ['no qualifier given']),
              SITE_FOCUS[qualifier ?? 'none'] ?? SITE_FOCUS.none,
              'this needs evaluating in person, and nothing here says a problem exists',
            ],
            [...(s.byId.get('site')?.evidence.directSources ?? [])], 'siteNeedsInspection',
            qualifier ? { qualifier } : {}),
        ],
      }
    },
  },

  // --- tier 7: nothing established -----------------------------------------
  {
    id: 'lowInformation',
    tier: 7,
    when: (s) => s.specificity === 0 && s.answered > 0,
    emit: () => ({
      actions: [
        act('showingTest', 'inspect.firstRejection', 'exposure',
          ['no protected criterion', 'a filter does not exist yet'], ['dealbreaker', 'daily'], 'lowInformation'),
      ],
      unresolved: {
        id: 'firstFilter',
        // Outranks an unresolved renovation band on purpose: a band with
        // nothing to apply it to changes no listing, whereas the absence of any
        // filter is the thing actually blocking the search.
        because: ['no protected criterion established'],
        sources: ['dealbreaker', 'daily'],
        priority: 0,
      },
    }),
  },
]

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/**
 * Deduplicate.
 *
 * Two rules reaching the same operational instruction produce one action with
 * both evidence trails merged, never two instructions saying the same thing.
 * Across kinds, a hard filter absorbs a do-not-flex on the same subject,
 * because eliminating a listing already implies not quietly compromising it.
 */
function collapse(actions: readonly AgentAction[]): AgentAction[] {
  const merged = new Map<string, AgentAction>()
  for (const action of actions) {
    const existing = merged.get(action.id)
    if (!existing) {
      merged.set(action.id, { ...action })
      continue
    }
    merged.set(action.id, {
      ...existing,
      because: [...new Set([...existing.because, ...action.because])],
      sources: [...new Set([...existing.sources, ...action.sources])],
      rules: [...new Set([...existing.rules, ...action.rules])],
      order: Math.min(existing.order ?? 99, action.order ?? 99),
      qualifier: existing.qualifier ?? action.qualifier,
    })
  }

  const all = [...merged.values()]
  const filtered = new Set(all.filter((a) => a.kind === 'filterHard').map((a) => a.subject))
  return all.filter((action) => !(action.kind === 'doNotFlex' && filtered.has(action.subject)))
}

export function strategyFor(result: Result): Strategy {
  const s = signalsOf(result)
  const fired: string[] = []
  const actions: AgentAction[] = []
  const vetoes = new Set<string>()
  let tradeoff: (ExpectedTradeoff & { priority: number }) | null = null
  let unresolved: (UnresolvedLever & { priority: number }) | null = null

  for (const rule of [...RULES].sort((a, b) => a.tier - b.tier)) {
    if (!rule.when(s)) continue
    fired.push(rule.id)
    const emission = rule.emit(s)
    for (const id of emission.veto ?? []) vetoes.add(id)
    actions.push(...(emission.actions ?? []))
    if (emission.tradeoff && (!tradeoff || emission.tradeoff.priority < tradeoff.priority)) {
      tradeoff = emission.tradeoff
    }
    if (emission.unresolved && (!unresolved || emission.unresolved.priority < unresolved.priority)) {
      unresolved = emission.unresolved
    }
  }

  let kept = collapse(actions).filter(
    (action) => !(action.kind === 'flexFirst' && vetoes.has(action.id)),
  )

  /*
   * LAST RESORT, DECIDED AFTER EVERY RULE HAS SPOKEN.
   *
   * When no concept lever survives, the softest protected criterion can still
   * be the first thing tested against real inventory. It must not be a
   * dealbreaker, must not be something a filter eliminates on, and must not be
   * an operational need. A Q8 loss makes it the obvious candidate and does NOT
   * demote it: it stays protected, and this is only about what to test first.
   *
   * If nothing qualifies, no lever is manufactured.
   */
  if (!kept.some((action) => action.kind === 'flexFirst')) {
    const lostQ8 = new Set(
      s.tradeoff?.winner
        ? s.tradeoff.pair.filter((side) => side !== s.tradeoff!.winner)
        : [],
    )
    const givable = [...s.protectedIds]
      .map((id) => s.byId.get(id)!)
      .filter(
        (entry) =>
          !OPERATIONAL.includes(entry.attribute.id) &&
          !s.hardFiltered.has(entry.attribute.id) &&
          !entry.evidence.directSources.includes('dealbreaker'),
      )
      .sort(
        (a, b) =>
          Number(lostQ8.has(b.attribute.id)) - Number(lostQ8.has(a.attribute.id)) ||
          a.evidence.direct - b.evidence.direct,
      )
    const weakest = givable[0]
    if (weakest) {
      kept = [
        ...kept,
        act('flexFirst', `flex.${weakest.attribute.id}`, weakest.attribute.id,
          [
            `${weakest.attribute.id} = protect`,
            'not a dealbreaker and nothing filters on it',
            ...(lostQ8.has(weakest.attribute.id) ? ['lost a forced choice but stays protected'] : []),
            'test it against real inventory first',
          ],
          [...weakest.evidence.directSources, ...(lostQ8.has(weakest.attribute.id) ? ['tradeoff'] : [])],
          'softestProtectedGive', { order: 40 }),
      ]
      fired.push('softestProtectedGive')
    }
  }
  const of = (kind: ActionKind) =>
    kept
      .filter((action) => action.kind === kind)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id))

  const protectedEntries = result.attributes.filter((entry) => entry.state === 'protect')

  return {
    buyerEvidence: {
      protect: protectedEntries.map((entry) => ({
        id: entry.attribute.id,
        qualifier: entry.qualifier,
        rank: entry.evidence.statedRank,
        repeated: entry.repeated,
      })),
      scrutinize: result.attributes
        .filter((entry) => entry.state === 'scrutinize')
        .map((entry) => entry.attribute.id),
      map: result.map,
      bands: {
        cosmetic: bandOf('personalizationAppetite', result),
        renovation: bandOf('renovationTolerance', result),
        dayOne: bandOf('dayOneReadiness', result),
      },
      stances: [...result.stances],
      tradeoff: result.tradeoff,
      notEstablished: result.unknowns.map((attribute) => attribute.id),
    },
    derived: {
      filterHard: of('filterHard'),
      flexFirst: of('flexFirst'),
      doNotFlex: of('doNotFlex'),
      secondLook: of('secondLook'),
      showingTests: of('showingTest'),
      doNotSubstitute: of('doNotSubstitute'),
      expectedTradeoff: tradeoff
        ? { a: tradeoff.a, b: tradeoff.b, why: tradeoff.why, because: tradeoff.because, sources: tradeoff.sources }
        : null,
      unresolvedLever: unresolved
        ? { id: unresolved.id, because: unresolved.because, sources: unresolved.sources }
        : null,
      lever: diagnoseLever(s),
    },
    /*
     * Factual, not analysis: the functional requirements, as a checklist.
     *
     * EVERY ESTABLISHED STATE, not just protect. This is the literal list
     * Danielle works from, so a secondary need belongs on it too: filtering to
     * protect level dropped `upkeep:pool` at scrutinize, which is exactly the
     * one-off practical signal this section exists to carry.
     *
     * A concept appearing here and as a non-negotiable is not duplication. The
     * two say different things, and `conceptIndex` records which one describes
     * it and which one refers to it.
     */
    practicalProgram: result.attributes
      .filter(
        (entry) =>
          (entry.state === 'protect' || entry.state === 'scrutinize') &&
          (OPERATIONAL.includes(entry.attribute.id) || Boolean(entry.qualifier)),
      )
      .map((entry) =>
        act('practicalProgram', `program.${entry.attribute.id}`, entry.attribute.id,
          [`${entry.attribute.id} = ${entry.state}`, ...(entry.qualifier ? [`qualifier = ${entry.qualifier}`] : [])],
          [...entry.evidence.directSources], 'practicalProgram',
          entry.qualifier ? { qualifier: entry.qualifier } : {}),
      ),
    market: [],
    firedRules: fired,
  }
}

/** Rule ids, exported so tests can assert every rule is reachable. */
export const RULE_IDS: readonly string[] = RULES.map((rule) => rule.id)
