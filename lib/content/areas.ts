/**
 * Chrome copy for LA, Actually area guides.
 *
 * These are labels, not voice. The three factual headings and the verification
 * line are the approved strings and must not be replaced with cleverer ones.
 * Danielle's editorial modules are not here — they live on each area record
 * and render nothing while null.
 */
export const areaGuide = {
  eyebrow: 'la, actually',
  housingHeading: 'Housing and built environment',
  accessHeading: 'Getting around',
  placesHeading: 'Verified local places',
  /** Rendered as "Local details last verified September 5, 2026". */
  verifiedLabel: 'Local details last verified',
  /** Becomes "Search homes in Calabasas". Goes to /search, unfiltered. */
  searchCtaPrefix: 'Search homes in',
  searchHref: '/search',
}

/** Plain category labels for the places list. No marketing register. */
export const placeCategoryLabels = {
  'shopping-dining': 'shopping and dining',
  bookstore: 'bookstore',
  coffee: 'coffee',
  park: 'park',
  institution: 'community facility',
} as const

/** The area-discovery section on /la-actually. */
export const areaIndex = {
  heading: 'Area guides',
}
