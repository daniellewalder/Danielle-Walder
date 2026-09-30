import type { Handoff } from './handoff.ts'

/**
 * Seven handoff scenarios.
 *
 * They exist to prove the brief keeps supplied search facts apart from
 * measured evidence, and that a discrepancy is only ever reported when the two
 * make an explicitly incompatible pair.
 *
 * NOTHING HERE IS EVIDENCE. Every one of these can change the search Danielle
 * runs and none of them may change a band, a state or the shared result.
 */
export const HANDOFFS: Readonly<Record<string, { why: string; handoff: Handoff }>> = {
  A_fullySpecified: {
    why: 'a fully specified active buyer: every field populated, no contradiction',
    handoff: {
      price: { targetMin: 1_600_000, targetMax: 2_100_000, hardCeiling: 2_250_000 },
      timing: { posture: 'active', note: 'Lease ends in March and we would rather not renew.' },
      geography: {
        considering: ['Mar Vista', 'Culver City', 'Playa del Rey'],
        ruledOut: ['anything east of La Brea'],
      },
      destinations: ['my office in El Segundo'],
      propertyBasics: { types: ['single family'], minBeds: 3, minBaths: 2, minSqft: 1600 },
      hardFilters: { parking: 'required', stairs: 'preferMinimal', pool: 'noPreference', ev: 'preferred' },
      buyerNote: 'We have looked at about fifteen houses in person already.',
    },
  },
  B_schoolBoundary: {
    why: 'a school boundary, recorded verbatim, with no reason asked and none inferable',
    handoff: {
      schoolBoundary: 'Needs to stay inside the Westwood Charter attendance boundary.',
      geography: { considering: ['Westwood', 'Century City adjacent'] },
    },
  },
  C_regularDestination: {
    why: 'a regular destination as free text, with no category and no reason',
    handoff: {
      destinations: ['the dialysis centre on Sawtelle', 'my mother in Sherman Oaks'],
      timing: { posture: 'thisYear' },
    },
  },
  D_poolDiscrepancy: {
    why: 'named pool upkeep as a burden in the test, then required a pool here',
    handoff: {
      hardFilters: { pool: 'required' },
      propertyBasics: { minBeds: 4 },
    },
  },
  E_silentOnPool: {
    why: 'the same test answers with the handoff silent on pools: absence is never a conflict',
    handoff: {
      propertyBasics: { minBeds: 4 },
      hardFilters: { pool: 'noPreference' },
    },
  },
  F_severalAreas: {
    why: 'a fixed map in the test and several areas listed here: NOT a discrepancy',
    handoff: {
      geography: {
        considering: ['Silver Lake', 'Los Feliz', 'Atwater Village', 'Echo Park', 'Highland Park'],
      },
    },
  },
  G_projectNote: {
    why: 'a settled no-renovation posture and a note that explicitly mentions gutting it',
    handoff: {
      buyerNote: 'Honestly if the price were right we would consider gutting the kitchen.',
      timing: { posture: 'casual' },
    },
  },
}
