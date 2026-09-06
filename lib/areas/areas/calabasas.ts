import type { Area, Source } from '../types'

/**
 * Calabasas — the first area guide, and the record that proves the model.
 *
 * SCOPE: the incorporated City of Calabasas. Nearby unincorporated places and
 * adjacent communities are NOT folded in because they are colloquially or
 * commercially described as "Calabasas". Edge addresses get checked against
 * official municipal/GIS information before they are added.
 *
 * Every string below comes from the approved research packet. Nothing is
 * supplemented from memory and no inference is presented as fact. In
 * particular this guide does NOT claim: a dominant housing form, a citywide
 * architectural style, a density characterisation, walkability in either
 * direction, lot sizes, quiet, parking, commute times or ease, safety, schools,
 * or any comparison to a neighbouring area. None of those is established.
 *
 * INTERNAL BACKGROUND — NOT FOR PUBLICATION:
 * The 2014–2021 Housing Element reported roughly 76% single-family (attached or
 * detached) and 21% apartments and condominiums. Those are HISTORICAL PLANNING
 * FIGURES from that document. They are not established as current 2026 housing
 * composition and are deliberately not rendered: at best they add technical
 * clutter, at worst a reader takes them as current. If they are ever published
 * they must carry their own date in the sentence that states them.
 *
 * The editorial modules — the short version, the Tuesday module, the tradeoffs
 * module and Danielle's note — are null. They stay null until she writes them.
 * They render nothing at all while null: no heading, no placeholder.
 */

const VERIFIED = '2026-09-05'
const NEXT_REVIEW = '2026-12-05'

const cityMaps: Source = {
  kind: 'government',
  label: 'City of Calabasas — Maps and Directions',
  url: 'https://www.cityofcalabasas.com/our-city/about-us/maps-and-directions',
  sourceDate: null,
}

const cityGis: Source = {
  kind: 'government',
  label: 'City of Calabasas — Property Info / GIS',
  url: 'https://www.cityofcalabasas.com/government/community-development/planning-division/property-info-gis',
  sourceDate: null,
}

const stateBoundaries: Source = {
  kind: 'government',
  label: 'California City Boundaries and Identifiers',
  url: 'https://data.ca.gov/dataset/california-city-boundaries-and-identifiers',
  sourceDate: null,
}

const cityHistory: Source = {
  kind: 'government',
  label: 'City of Calabasas — History',
  url: 'https://www.cityofcalabasas.com/our-city/about-us/history',
  sourceDate: null,
}

const cityLandmarks: Source = {
  kind: 'government',
  label: 'City of Calabasas — Historic Landmarks',
  url: 'https://www.cityofcalabasas.com/our-city/about-us/history/historic-landmarks',
  sourceDate: null,
}

const cityPlans: Source = {
  kind: 'government',
  label: 'City of Calabasas — City and Regional Plans',
  url: 'https://www.cityofcalabasas.com/government/community-development/planning-division/city-and-regional-plans',
  sourceDate: null,
}

const cityHousing: Source = {
  kind: 'government',
  label: 'City of Calabasas — Housing',
  url: 'https://www.cityofcalabasas.com/government/community-development/planning-division/housing',
  sourceDate: null,
}

const cityHousingElement: Source = {
  kind: 'government',
  label: 'City of Calabasas — 2021–2029 Housing Element Update',
  url: 'https://www.cityofcalabasas.com/government/community-development/2021-2029-housing-element-update',
  sourceDate: null,
}

const hcdHousingElement: Source = {
  kind: 'government',
  label: 'California HCD — archived Calabasas Housing Element',
  url: 'https://www.hcd.ca.gov/housing-elements/docs/calabasas-5th-adopted092613.pdf',
  sourceDate: null,
}

const cityTransit: Source = {
  kind: 'government',
  label: 'City of Calabasas — Public Transit Services',
  url: 'https://www.cityofcalabasas.com/government/public-works/transportation-transit/public-transit-services',
  sourceDate: null,
}

const cityTrolley: Source = {
  kind: 'government',
  label: 'City of Calabasas — Calabasas Trolley',
  url: 'https://www.cityofcalabasas.com/government/public-works/transportation-transit/public-transit-services/trolley/',
  sourceDate: null,
}

const commonsSite: Source = {
  kind: 'operator',
  label: 'The Commons at Calabasas',
  url: 'https://www.shopcommons.com/',
  sourceDate: null,
}

export const calabasas: Area = {
  id: 'calabasas',
  slug: 'calabasas',
  name: 'Calabasas',
  region: 'west-valley',
  /** The cluster set is authored with the quiz. Empty is correct for now. */
  clusterIds: [],
  /** No second guide is published, so there is nothing honest to compare to. */
  compareWith: [],

  facts: {
    orientation: {
      body: [
        'Calabasas is an incorporated city in Los Angeles County. This guide covers the incorporated city, which is narrower than the way the name is sometimes used.',
        'Its commercial and civic destinations are distributed across several distinct nodes: the Commons and the Civic Center area, Old Town along Calabasas Road, and the Agoura Road and Las Virgenes Road area.',
      ],
      provenance: {
        sources: [cityMaps, cityGis, stateBoundaries, cityHistory, cityPlans, commonsSite],
        lastVerified: VERIFIED,
        nextReview: NEXT_REVIEW,
      },
    },

    housing: {
      body: [
        'City housing materials identify a range of housing forms in Calabasas: detached and attached single-family homes, apartments, condominiums, and manufactured and mobile-home housing. Calabasas Village Mobile Estates is identified in current city housing materials.',
        'The city also identifies historic buildings along Calabasas Road in Old Town, and publishes a list of designated historic landmarks.',
      ],
      provenance: {
        sources: [
          cityHousing,
          cityHousingElement,
          hcdHousingElement,
          cityHistory,
          cityLandmarks,
          cityPlans,
        ],
        lastVerified: VERIFIED,
        nextReview: NEXT_REVIEW,
      },
    },

    access: {
      body: [
        'Major routes identified in city materials include the Ventura Freeway (US 101) and its interchange, Las Virgenes Road, Calabasas Road, Agoura Road, Mulholland Highway, Lost Hills Road, Old Topanga Canyon Road, Park Sorrento and Malibu Hills Road.',
        'The city operates fare-free municipal transit, including Line 1 and the Calabasas Trolley. Published stops connect the Civic Center, Old Town, the Calabasas Tennis and Swim Center, Las Virgenes and Mureau, the Agoura and Las Virgenes area, Lost Hills and de Anza Park, and the Calabasas Community Center.',
      ],
      provenance: {
        sources: [cityTransit, cityTrolley, cityMaps, cityPlans],
        lastVerified: VERIFIED,
        nextReview: NEXT_REVIEW,
      },
    },
  },

  editorial: {
    shortVersion: null,
    tuesday: null,
    tradeoffs: null,
    note: null,
  },

  provenance: {
    sources: [cityMaps, cityGis, stateBoundaries],
    lastVerified: VERIFIED,
    nextReview: NEXT_REVIEW,
  },

  published: true,
  currentConditionsFlag: null,

  metaDescription:
    'An area guide to the incorporated city of Calabasas in Los Angeles County: housing forms, getting around, and verified local places.',
}
