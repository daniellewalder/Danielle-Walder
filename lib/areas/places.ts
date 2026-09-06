import type { Place, Source } from './types'

/**
 * Local places.
 *
 * Places have no routes. A place is content inside an area guide, and the
 * verification gates in ./index.ts decide whether it renders at all.
 *
 * RULES, not preferences:
 *   - No ratings, stars, reviews, prices, hours, or copied marketing language.
 *   - `officialUrl` is only ever a URL that was actually verified. A place
 *     whose first-party URL is unknown renders WITHOUT a link. It is never
 *     guessed — a plausible-looking wrong URL is worse than no link.
 *   - `description` carries at most one short factual line, and only where the
 *     research supports it. Most places have none.
 *   - Records on hold stay in this file with `hold: true` and a reason. They
 *     do not render, and keeping them here is what stops the same candidate
 *     being re-researched from scratch every cycle.
 */

const VERIFIED = '2026-09-05'
/** Private businesses get a shorter cycle than municipal facilities. */
const BUSINESS_REVIEW = '2026-10-05'
const CIVIC_REVIEW = '2026-12-05'

const commonsSite: Source = {
  kind: 'operator',
  label: 'The Commons at Calabasas',
  url: 'https://www.shopcommons.com/',
  sourceDate: null,
}

const commonsVisit: Source = {
  kind: 'operator',
  label: 'The Commons at Calabasas — Visit',
  url: 'https://www.shopcommons.com/visit/',
  sourceDate: null,
}

const commonsDining: Source = {
  kind: 'operator',
  label: 'The Commons at Calabasas — Dining directory',
  url: 'https://www.shopcommons.com/dining/',
  sourceDate: null,
}

const cityParks: Source = {
  kind: 'government',
  label: 'City of Calabasas — Parks, Trails and Facilities',
  url: 'https://www.cityofcalabasas.com/government/community-services-parks-recreation/parks-trails-and-facilities',
  sourceDate: null,
}

const cityTrolley: Source = {
  kind: 'government',
  label: 'City of Calabasas — Calabasas Trolley',
  url: 'https://www.cityofcalabasas.com/government/public-works/transportation-transit/public-transit-services/trolley/',
  sourceDate: null,
}

export const places: Place[] = [
  // ---------------------------------------------------------------- published

  {
    id: 'the-commons-at-calabasas',
    name: 'The Commons at Calabasas',
    category: 'shopping-dining',
    areaIds: ['calabasas'],
    address: '4799 Commons Way, Calabasas, CA 91302',
    officialUrl: 'https://www.shopcommons.com/',
    status: 'open',
    description: 'An open-air shopping, dining and entertainment center.',
    provenance: {
      sources: [commonsSite, commonsVisit, commonsDining],
      lastVerified: VERIFIED,
      nextReview: BUSINESS_REVIEW,
    },
    note: null,
  },

  {
    id: 'barnes-and-noble-calabasas',
    name: 'Barnes & Noble Calabasas',
    category: 'bookstore',
    areaIds: ['calabasas'],
    address: '4735 Commons Way, Calabasas, CA 91302',
    officialUrl: 'https://stores.barnesandnoble.com/store/2956',
    status: 'open',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'official-site',
          label: 'Barnes & Noble — Calabasas store page',
          url: 'https://stores.barnesandnoble.com/store/2956',
          sourceDate: null,
        },
      ],
      lastVerified: VERIFIED,
      nextReview: BUSINESS_REVIEW,
    },
    note: null,
  },

  {
    // No separate first-party café site was verified, so this record carries no
    // officialUrl. Do not point it at the bookstore's page or invent one.
    id: 'barnes-and-noble-cafe-calabasas',
    name: 'Barnes & Noble Café',
    category: 'coffee',
    areaIds: ['calabasas'],
    address: '4735 Commons Way, Calabasas, CA 91302',
    officialUrl: null,
    status: 'open',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'operator',
          label: 'The Commons at Calabasas — Barnes & Noble Café',
          url: 'https://www.shopcommons.com/dining/barnes-noble-cafe/',
          sourceDate: null,
        },
      ],
      lastVerified: VERIFIED,
      nextReview: BUSINESS_REVIEW,
    },
    note: null,
  },

  {
    id: 'calabasas-creekside-park',
    name: 'Calabasas Creekside Park',
    category: 'park',
    areaIds: ['calabasas'],
    address: '3655 Old Topanga Canyon Road, Calabasas, CA 90290',
    officialUrl:
      'https://www.cityofcalabasas.com/Home/Components/FacilityDirectory/FacilityDirectory/16/',
    status: 'open',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'government',
          label: 'City of Calabasas — Facility Directory: Calabasas Creekside Park',
          url: 'https://www.cityofcalabasas.com/Home/Components/FacilityDirectory/FacilityDirectory/16/',
          sourceDate: null,
        },
        cityParks,
      ],
      lastVerified: VERIFIED,
      nextReview: CIVIC_REVIEW,
    },
    note: null,
  },

  {
    // No park-detail URL was supplied in the research, so none is rendered.
    id: 'juan-bautista-de-anza-park',
    name: 'Juan Bautista de Anza Park',
    category: 'park',
    areaIds: ['calabasas'],
    address: '3701 Lost Hills Road, Calabasas, CA 91301',
    officialUrl: null,
    status: 'open',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'government',
          label: 'City of Calabasas — news item',
          url: 'https://www.cityofcalabasas.com/Home/Components/News/News/1391/15',
          sourceDate: null,
        },
        cityTrolley,
      ],
      lastVerified: VERIFIED,
      nextReview: CIVIC_REVIEW,
    },
    note: null,
  },

  {
    id: 'grape-arbor-park',
    name: 'Grape Arbor Park',
    category: 'park',
    areaIds: ['calabasas'],
    address: '5100 Parkville Road, Calabasas, CA 91301',
    officialUrl: null,
    status: 'open',
    description: null,
    provenance: {
      sources: [cityParks],
      lastVerified: VERIFIED,
      nextReview: CIVIC_REVIEW,
    },
    note: null,
  },

  {
    id: 'calabasas-community-center',
    name: 'Calabasas Community Center',
    category: 'institution',
    areaIds: ['calabasas'],
    address: '27040 Malibu Hills Road, Calabasas, CA 91301',
    officialUrl:
      'https://www.cityofcalabasas.com/government/community-services-parks-recreation/calabasas-community-center',
    status: 'open',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'government',
          label: 'City of Calabasas — Calabasas Community Center',
          url: 'https://www.cityofcalabasas.com/government/community-services-parks-recreation/calabasas-community-center',
          sourceDate: null,
        },
      ],
      lastVerified: VERIFIED,
      nextReview: CIVIC_REVIEW,
    },
    note: null,
  },

  {
    // Stated narrowly, as the access arrangement the city describes. This is
    // NOT an opening to say anything about gated living, prestige, privacy or
    // safety, none of which is established and none of which belongs here.
    id: 'freedom-park',
    name: 'Freedom Park',
    category: 'park',
    areaIds: ['calabasas'],
    address: '23050 Mulholland Highway, Calabasas, CA 91302',
    officialUrl: null,
    status: 'open',
    description:
      'A public park inside the gated Braewood community. The city describes public pedestrian access.',
    provenance: {
      sources: [cityParks],
      lastVerified: VERIFIED,
      nextReview: CIVIC_REVIEW,
    },
    note: null,
  },

  // --------------------------------------------------------------------- hold
  // Researched, not published. Each one needs a specific verification pass.
  // `hold: true` AND `lastVerified: null` — either alone stops the record
  // rendering; both together mean a future edit cannot re-publish one of these
  // by accident.

  {
    id: 'superba-food-and-bread-calabasas',
    name: 'Superba Food + Bread',
    category: 'shopping-dining',
    areaIds: ['calabasas'],
    address: null,
    officialUrl: null,
    status: 'unknown',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'operator',
          label: 'The Commons at Calabasas — Superba Food + Bread',
          url: 'https://www.shopcommons.com/dining/superba-food-bread/',
          sourceDate: null,
        },
      ],
      lastVerified: null,
      nextReview: BUSINESS_REVIEW,
      hold: true,
      holdReason:
        'Current Commons listing confirmed, but suite-level address and first-party business details need verification before publication.',
    },
    note: null,
  },

  {
    id: 'la-la-land-cafe-calabasas',
    name: 'La La Land Cafe',
    category: 'coffee',
    areaIds: ['calabasas'],
    address: null,
    officialUrl: null,
    status: 'unknown',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'operator',
          label: 'The Commons at Calabasas — La La Land Cafe',
          url: 'https://www.shopcommons.com/dining/la-la-land-cafe/',
          sourceDate: null,
        },
      ],
      lastVerified: null,
      nextReview: BUSINESS_REVIEW,
      hold: true,
      holdReason:
        'Current Commons listing exists; exact business-level address and first-party confirmation need a final verification pass.',
    },
    note: null,
  },

  {
    id: 'bacio-di-latte-calabasas',
    name: 'Bacio di Latte',
    category: 'shopping-dining',
    areaIds: ['calabasas'],
    address: null,
    officialUrl: null,
    status: 'unknown',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'operator',
          label: 'The Commons at Calabasas — Bacio di Latte',
          url: 'https://www.shopcommons.com/dining/bacio-di-latte/',
          sourceDate: null,
        },
      ],
      lastVerified: null,
      nextReview: BUSINESS_REVIEW,
      hold: true,
      holdReason:
        'Current Commons listing exists; exact business-level address and first-party confirmation need a final verification pass.',
    },
    note: null,
  },

  {
    id: 'trader-joes-calabasas',
    name: "Trader Joe's",
    category: 'shopping-dining',
    areaIds: ['calabasas'],
    address: '23741 Calabasas Road, Calabasas, CA 91302',
    officialUrl: null,
    status: 'unknown',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'operator',
          label: 'Courtyard at the Commons — directory',
          url: 'https://www.courtyardatthecommons.com/directory/',
          sourceDate: null,
        },
      ],
      lastVerified: null,
      nextReview: BUSINESS_REVIEW,
      hold: true,
      holdReason:
        'Current property-directory evidence exists, but first-party store confirmation was not in the approved research packet.',
    },
    note: null,
  },

  {
    id: 'calabasas-farmers-market',
    name: 'Calabasas Farmers Market',
    category: 'shopping-dining',
    areaIds: ['calabasas'],
    address: '23504 Calabasas Road',
    officialUrl: null,
    status: 'unknown',
    description: null,
    provenance: {
      sources: [
        {
          kind: 'government',
          label: 'City of Calabasas — news item',
          url: 'https://www.cityofcalabasas.com/Home/Components/News/News/1167/',
          sourceDate: null,
        },
      ],
      lastVerified: null,
      nextReview: BUSINESS_REVIEW,
      hold: true,
      holdReason:
        'Current operator and recurring schedule need re-verification before public inclusion.',
    },
    note: null,
  },
]
