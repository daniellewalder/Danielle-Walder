import { type MapConstraint, type StanceId } from './model.ts'
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
    when: (s) => s.map === 'strongPreference' || s.map === 'fewAreas' || s.map === 'propertyLed',
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
    when: (s) => s.protectedIds.has('size') && s.stances.has('structuralWorkOkay'),
    emit: (s) => ({
      actions: [
        // The ROUTE to the required size, not the size. Size stays protected;
        // what can move is whether it already exists.
        act('flexFirst', 'flex.sizeRoute', 'sizeRoute',
          ['size = protect', 'structuralWorkOkay', 'the size may be created rather than found'],
          [...(s.byId.get('size')?.evidence.directSources ?? []), 'project'], 'sizeRouteLever', { order: 25 }),
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
        // `sizeStructural` asks the same question about size, and asks it more
        // precisely, so the general check stands aside rather than duplicating.
        .filter((entry) => !(entry.attribute.id === 'size' && s.stances.has('structuralWorkOkay')))
        .map((entry) =>
        act('showingTest', `inspect.${entry.attribute.id}.correctable`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, band('renovation', s.reno), 'correctable in principle, so the question is whether it is correctable here'],
          [...entry.evidence.directSources, 'project'], 'spatialHighReno'),
      ),
    }),
  },
  {
    id: 'sizeStructural',
    tier: 4,
    when: (s) => s.protectedIds.has('size') && s.stances.has('structuralWorkOkay'),
    emit: (s) => ({
      actions: [
        act('secondLook', 'secondLook.smallerWithPotential', 'size',
          ['size = protect', 'structuralWorkOkay'], [...(s.byId.get('size')?.evidence.directSources ?? []), 'project'], 'sizeStructural'),
        act('showingTest', 'inspect.expansionFeasibility', 'size',
          ['size = protect', 'structuralWorkOkay', 'expansion potential is a property fact, not a buyer priority'],
          [...(s.byId.get('size')?.evidence.directSources ?? []), 'project'], 'sizeStructural'),
      ],
      unresolved: {
        id: 'mustSpaceExistAlready',
        because: ['size = protect', 'structuralWorkOkay'],
        sources: ['dealbreaker', 'project'],
        priority: 2,
      },
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
    // Factual, not analysis: the qualifiers and operational needs as a checklist.
    practicalProgram: protectedEntries
      .filter((entry) => OPERATIONAL.includes(entry.attribute.id) || entry.qualifier)
      .map((entry) =>
        act('practicalProgram', `program.${entry.attribute.id}`, entry.attribute.id,
          [`${entry.attribute.id} = protect`, ...(entry.qualifier ? [`qualifier = ${entry.qualifier}`] : [])],
          [...entry.evidence.directSources], 'practicalProgram',
          entry.qualifier ? { qualifier: entry.qualifier } : {}),
      ),
    market: [],
    firedRules: fired,
  }
}

/** Rule ids, exported so tests can assert every rule is reachable. */
export const RULE_IDS: readonly string[] = RULES.map((rule) => rule.id)
