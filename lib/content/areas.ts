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

/**
 * Public labels for the itinerary.
 *
 * The data uses short kind names; readers never see them. Nothing here names a
 * kind of person, and nothing rates a place.
 */
export const stopKindLabels = {
  residential: 'residential',
  drive: 'the drive',
  walk: 'on foot',
  anchor: 'anchor',
  showing: 'private',
  'normal-life': 'the normal-life test',
  comparison: 'side by side',
} as const

/** Access, in plain words. Never an instruction to enter private property. */
export const accessLabels = {
  public: null,
  'view-from-public-route': 'Visible from the public route',
  'showing-required': 'Public route ends here',
} as const

export const itinerary = {
  pointHeading: 'The point of the day',
  routeHeading: 'The route at a glance',
  routeIntro: 'The stops, in order.',
  whyHeading: 'Why here',
  teachesHeading: 'What this tells you',
  noticeHeading: 'What to notice',
  cautionHeading: "What this doesn't tell you",
  driveFrom: 'From',
  driveTo: 'To',
  driveRoads: 'Roads',
  driveChanges: 'What changes',
  normalLifeHeading: 'Pretend you bought the house',
  beforeYouLeaveHeading: 'Before you leave',
}
