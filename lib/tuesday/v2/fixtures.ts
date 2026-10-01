import type { V2Answers } from './answers.ts'
import { candidatesFrom, selectPair, type Preconditions } from './tradeoff.ts'
import { bandOf, score } from './score.ts'

/**
 * Answer paths that between them exercise every mechanism in the V2
 * engine. They exist to be read, not just to pass: the dump alongside them
 * prints evidence, provenance, ordering and state so the model can be audited
 * without reading a line of result copy.
 */

const V = (partial: Omit<V2Answers, 'version'>): V2Answers => ({ version: 2, ...partial })

export const FIXTURES: Readonly<Record<string, { why: string; answers: V2Answers }>> = {
  twoDealbreakers: {
    why: 'two full-strength dealbreakers, ranked, from one provenance source',
    answers: V({
      tuesday: 'quiet',
      dealbreaker: [{ option: 'dark' }, { option: 'privacy' }],
      location: 'few',
    }),
  },
  dailyPrimaryAndSecondary: {
    why: 'Q3 primary at 3 and secondary at 2',
    answers: V({
      daily: [{ option: 'separation' }, { option: 'stairs' }],
      location: 'few',
    }),
  },
  twoBundledQualifiers: {
    why: 'two bundled Q3 picks, each carrying its own qualifier',
    answers: V({
      daily: [
        { option: 'utility', qualifier: 'storage' },
        { option: 'upkeep', qualifier: 'pool' },
      ],
      location: 'few',
    }),
  },
  architectureAndPersonalization: {
    why: 'architecture high AND personalization high, reachable in one pass',
    answers: V({
      dealbreaker: [{ option: 'dark' }],
      architecture: 'alot',
      personalization: 'all',
      project: 'never',
      location: 'few',
    }),
  },
  neutralAndPersonalization: {
    why: 'architecture low (wantsNeutral) with personalization high',
    answers: V({
      dealbreaker: [{ option: 'layout' }],
      architecture: 'plain',
      personalization: 'all',
      project: 'never',
      location: 'few',
    }),
  },
  turnkey: {
    why: 'turnkey, low renovation tolerance',
    answers: V({
      tuesday: 'errands',
      dealbreaker: [{ option: 'layout' }],
      daily: [{ option: 'public' }],
      architecture: 'notreally',
      personalization: 'finished',
      project: 'done',
      location: 'fixed',
    }),
  },
  structuralBuilder: {
    why: 'major structural work, and no expansion attribute is created by it',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }, { option: 'site', qualifier: 'land' }],
      daily: [{ option: 'separation' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'property',
    }),
  },
  fixedMap: {
    why: 'fixed map: never offered as movable',
    answers: V({ dealbreaker: [{ option: 'dark' }], project: 'done', location: 'fixed' }),
  },
  strongPreferenceMap: {
    why: 'strong preference: the map is a live tradeoff candidate',
    answers: V({ dealbreaker: [{ option: 'privacy' }], project: 'never', location: 'strong' }),
  },
  fewAreasMap: {
    why: 'a handful of areas: also movable',
    answers: V({ dealbreaker: [{ option: 'outside' }], project: 'depends', location: 'few' }),
  },
  propertyLedMap: {
    why: 'property led: the map question is already answered, so it is not re-asked',
    answers: V({ dealbreaker: [{ option: 'site', qualifier: 'sits' }], project: 'fixable', location: 'property' }),
  },
  tradeoffTwoProperties: {
    why: 'adaptive pair between two protected property attributes',
    answers: V({
      dealbreaker: [{ option: 'dark' }, { option: 'privacy' }],
      location: 'fixed',
      tradeoff: { pair: ['light', 'privacy'], winner: 'light', family: 'setting' },
    }),
  },
  tradeoffAgainstMap: {
    why: 'adaptive pair involving movable geography',
    answers: V({
      dealbreaker: [{ option: 'outside' }],
      location: 'strong',
      tradeoff: { pair: ['MAP', 'outdoor'], winner: 'outdoor', family: 'propertyVsPlace' },
    }),
  },
  protectedLoser: {
    why: 'a protected attribute loses the tradeoff and stays protected',
    answers: V({
      dealbreaker: [{ option: 'dark' }, { option: 'privacy' }],
      location: 'fixed',
      tradeoff: { pair: ['light', 'privacy'], winner: 'light', family: 'setting' },
    }),
  },
  lowInformation: {
    why: 'almost nothing established: the engine must not invent a verdict',
    answers: V({
      tuesday: 'errands',
      dealbreaker: [{ option: 'none' }],
      daily: [{ option: 'unsure' }],
      architecture: 'notreally',
      personalization: 'some',
      project: 'depends',
      location: 'strong',
    }),
  },
  projectUnresolved: {
    why: 'the one real unresolved state: depends how much work, before the follow-up',
    answers: V({
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'finished',
      project: 'depends',
      location: 'fixed',
    }),
  },
  projectResolved: {
    why: 'the same buyer, after the follow-up settles what it depends on',
    answers: V({
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'finished',
      project: 'depends',
      location: 'fixed',
      depends: 'money',
    }),
  },

  // --- targeted: the ten cases Danielle asked to see explicitly ------------
  t1_strongMapLowRenoCosmetic: {
    why: 'strong map + low renovation + cosmetic flexibility',
    answers: V({
      dealbreaker: [{ option: 'dark' }],
      daily: [{ option: 'public' }],
      architecture: 'notreally',
      personalization: 'all',
      project: 'never',
      location: 'strong',
    }),
  },
  t2_fixedMapHighReno: {
    why: 'fixed map + high renovation',
    answers: V({
      dealbreaker: [{ option: 'layout' }],
      daily: [{ option: 'separation' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'fixed',
    }),
  },
  t3_outdoorPoolConcern: {
    why: 'outdoor protected + pool-specific upkeep concern',
    answers: V({
      dealbreaker: [{ option: 'outside' }],
      daily: [{ option: 'upkeep', qualifier: 'pool' }],
      project: 'depends',
      location: 'few',
    }),
  },
  t4_outdoorPlantingConcern: {
    why: 'outdoor protected + planting-specific upkeep concern: must never mention a pool',
    answers: V({
      dealbreaker: [{ option: 'outside' }],
      daily: [{ option: 'upkeep', qualifier: 'planting' }],
      project: 'depends',
      location: 'few',
    }),
  },
  t5_evQualifier: {
    why: 'EV charging qualifier',
    answers: V({
      dealbreaker: [{ option: 'drive' }],
      daily: [{ option: 'parking', qualifier: 'charging' }],
      project: 'done',
      location: 'fixed',
    }),
  },
  t6_pantryQualifier: {
    why: 'pantry qualifier',
    answers: V({
      dealbreaker: [{ option: 'layout' }],
      daily: [{ option: 'utility', qualifier: 'pantry' }],
      project: 'never',
      location: 'strong',
    }),
  },
  t7_characterAndPersonalization: {
    why: 'architectural character + high personalization',
    answers: V({
      dealbreaker: [{ option: 'dark' }],
      architecture: 'alot',
      personalization: 'all',
      project: 'fixable',
      location: 'few',
    }),
  },
  t8_sizeAndStructural: {
    why: 'size protected + structural work okay',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'few',
    }),
  },
  t9_rankOneWinsQ8: {
    why: 'two protected dealbreakers, the FIRST-ranked one wins Q8',
    answers: V({
      dealbreaker: [{ option: 'dark' }, { option: 'outside' }],
      project: 'never',
      location: 'fixed',
      tradeoff: { pair: ['light', 'outdoor'], winner: 'light', family: 'setting' },
    }),
  },
  t10_rankTwoWinsQ8: {
    why: 'the same two, but the SECOND-ranked one wins Q8',
    answers: V({
      dealbreaker: [{ option: 'dark' }, { option: 'outside' }],
      project: 'never',
      location: 'fixed',
      tradeoff: { pair: ['light', 'outdoor'], winner: 'outdoor', family: 'setting' },
    }),
  },
  t11_declinedTradeoff: {
    why: 'declined the forced choice: no ordering established',
    answers: V({
      dealbreaker: [{ option: 'dark' }, { option: 'outside' }],
      project: 'never',
      location: 'fixed',
      tradeoff: { pair: ['light', 'outdoor'], winner: null, family: 'setting' },
    }),
  },
  t12_characterWithoutPersonalization: {
    why: 'architectural character protected AND low personalization: it has to arrive with both',
    answers: V({
      dealbreaker: [{ option: 'dark' }],
      architecture: 'alot',
      personalization: 'notmuch',
      project: 'never',
      location: 'few',
    }),
  },
  // --- the size route: the four answers to the second conditional ---------
  r1_sizeExistingOnly: {
    why: 'size protected, structural work accepted, but the space has to exist already',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'few',
      sizeRoute: 'existing',
    }),
  },
  r2_sizeAdditionOkay: {
    why: 'the same buyer, willing to add on if the property makes sense',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'few',
      sizeRoute: 'addition',
    }),
  },
  r3_sizeReconfigureOkay: {
    why: 'the same buyer, reworking the existing space but not adding on',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'few',
      sizeRoute: 'reconfigure',
    }),
  },
  r4_sizePropertySpecific: {
    why: 'the same buyer, who would have to see the actual house first',
    answers: V({
      tuesday: 'room',
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'some',
      project: 'further',
      location: 'few',
      sizeRoute: 'seeit',
    }),
  },
  r5_someChangesOnly: {
    why: 'personalization "some": the middle band, which must not read as high',
    answers: V({
      dealbreaker: [{ option: 'dark' }],
      daily: [{ option: 'public' }],
      architecture: 'notreally',
      personalization: 'some',
      project: 'never',
      location: 'strong',
    }),
  },
  r6_siteQualifiers: {
    why: 'site protected with a specific qualifier, for the in-person check',
    answers: V({
      dealbreaker: [{ option: 'site', qualifier: 'land' }],
      project: 'never',
      location: 'few',
    }),
  },
  r7_siteWhole: {
    why: 'site protected with the bundled "whole thing": one finding, never four',
    answers: V({
      dealbreaker: [{ option: 'site', qualifier: 'whole' }],
      project: 'never',
      location: 'few',
    }),
  },
  r8_siteNoQualifier: {
    why: 'site protected with the qualifier skipped: overall site fit, no problem implied',
    answers: V({
      dealbreaker: [{ option: 'site' }],
      project: 'never',
      location: 'few',
    }),
  },

  t13_leverNotEstablished: {
    why: 'fixed map and nothing else established: we never found what could move',
    answers: V({
      tuesday: 'errands',
      dealbreaker: [{ option: 'none' }],
      daily: [{ option: 'unsure' }],
      architecture: 'notreally',
      personalization: 'notmuch',
      project: 'depends',
      location: 'fixed',
    }),
  },
}

/** A plain-text dump of everything the engine established. No result copy. */
export function dump(name: string, answers: V2Answers): string {
  const result = score(answers)
  const out: string[] = []
  const pad = (value: string, width: number) => (value + ' '.repeat(width)).slice(0, width)

  out.push('='.repeat(78))
  out.push(name)
  out.push('='.repeat(78))
  out.push(`answers        ${JSON.stringify(answers)}`)
  out.push(
    `map            ${result.map ?? 'not established'}` +
      `   answered=${result.answered}   questions=[${result.answeredQuestionIds.join(',')}]`,
  )
  out.push(
    `project        cosmetic=${bandOf('personalizationAppetite', result)}` +
      `  renovation=${bandOf('renovationTolerance', result)}` +
      `  dayOne=${bandOf('dayOneReadiness', result)}`,
  )
  out.push(`stances        ${[...result.stances].join(', ') || 'none'}`)
  out.push(`followUp       ${result.needs ?? 'none outstanding'}`)
  out.push(
    `tradeoff       ${
      result.tradeoff
        ? `${result.tradeoff.pair.join(' vs ')} -> ${result.tradeoff.winner ?? 'declined'} (${result.tradeoff.family})`
        : 'not asked'
    }`,
  )

  out.push('')
  out.push(
    `  ${pad('STATE', 18)}${pad('ATTRIBUTE', 26)}${pad('DIRECT', 8)}${pad('DIRECT SRC', 26)}${pad('CORROBORATION', 34)}${pad('RANK', 6)}${pad('QUALIFIER', 11)}ORDERING`,
  )
  for (const entry of result.attributes) {
    out.push(
      '  ' +
        pad(entry.state, 18) +
        pad(entry.attribute.id, 26) +
        pad(String(entry.evidence.direct), 8) +
        pad(`[${entry.evidence.directSources.join(',')}]`, 26) +
        pad(`[${entry.evidence.corroboration.join(',')}]${entry.repeated ? ' REPEATED' : ''}`, 34) +
        pad(String(entry.evidence.statedRank ?? '-'), 6) +
        pad(entry.qualifier ?? '-', 11) +
        (entry.evidence.ordering.map((o) => `${o.outcome} vs ${o.against}`).join('; ') || '-'),
    )
  }
  out.push(`  not established (${result.unknowns.length}): ${result.unknowns.map((a) => a.id).join(', ')}`)

  // What question eight would ask, from this evidence alone.
  const pre: Preconditions = {
    map: result.map,
    projectIsMajor: result.stances.has('structuralWorkOkay'),
    wantsNeutral: result.stances.has('wantsNeutral'),
    qualified: new Set(
      result.attributes.filter((entry) => entry.qualifier).map((entry) => entry.attribute.id),
    ),
  }
  const evidence = new Map(result.attributes.map((entry) => [entry.attribute.id, entry.evidence]))
  const selected = selectPair(candidatesFrom(evidence, result.map), pre)
  out.push(`  Q8 would ask   ${selected.pair.join(' vs ')}  (${selected.family})`)
  return out.join('\n')
}
