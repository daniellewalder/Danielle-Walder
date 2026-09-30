import type { V2Answers } from './answers.ts'
import { candidatesFrom, selectPair, type Preconditions } from './tradeoff.ts'
import { bandOf, score } from './score.ts'

/**
 * Sixteen answer paths that between them exercise every mechanism in the V2
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
  contradictionOpen: {
    why: 'wants it finished AND would do the work: the contradiction, unresolved',
    answers: V({
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      // wantsFinished from personalization, willBuild from project: two
      // different questions, which is the only way this can collide.
      personalization: 'finished',
      project: 'fixable',
      location: 'fixed',
    }),
  },
  contradictionResolved: {
    why: 'the same contradiction, settled by the follow-up so it stops reading as open',
    answers: V({
      dealbreaker: [{ option: 'outgrow' }],
      architecture: 'some',
      personalization: 'finished',
      project: 'fixable',
      location: 'fixed',
      clarify: 'cosmetic',
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
  out.push(
    `conflict       present=${result.conflict.present} resolvedBy=${result.conflict.resolvedBy ?? 'none'}` +
      `   needsFollowUp=${result.needs ?? 'none'}`,
  )
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
