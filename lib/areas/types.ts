/**
 * LA, Actually — area guide content model.
 *
 * Four things are kept deliberately separate and must never be blended:
 *
 *   1. VERIFIED FACT      — `FactBlock`, `Place`. Every one carries sources and
 *                           a verification date, and renders only through the
 *                           gates in ./index.ts.
 *   2. DANIELLE EDITORIAL — `EditorialNote`. Her words, or null. Never written
 *                           by anyone else, never generated to fill a module.
 *   3. TECHNICAL METADATA — `published`, `metaDescription`, route and sitemap
 *                           concerns.
 *   4. PROVENANCE         — `Provenance`. Sources, dates, holds, suppression.
 *
 * Quiz attributes are deliberately ABSENT from this file. The AttributeId
 * vocabulary is not frozen — it needs several contrasting area dossiers before
 * it can be committed to — and putting provisional attributes on `Area` now
 * would make them production data by accident. They arrive in their own module
 * when the vocabulary is settled.
 */

/** Where a claim came from. Never a search-results page, never a guess. */
export type SourceKind =
  /** A city, county, state or federal body publishing about itself. */
  | 'government'
  /** The operator of the place, or the property it sits in. */
  | 'operator'
  /** A business's own first-party site. */
  | 'official-site'
  /** A publication. */
  | 'publisher'

export interface Source {
  kind: SourceKind
  /** Human label, e.g. "City of Calabasas — Parks, Trails and Facilities". */
  label: string
  url: string
  /** ISO date the source itself states, when it states one. */
  sourceDate: string | null
}

/**
 * Verification metadata. Attached to every factual record.
 *
 * `lastVerified` is the load-bearing field: a record without one does not
 * render, whatever else it carries. Staleness is surfaced by the report in
 * ./verify.ts and reviewed by a human — a record is never auto-removed for
 * passing `nextReview`.
 */
export interface Provenance {
  sources: Source[]
  /** ISO yyyy-mm-dd. Null means never verified, which means never rendered. */
  lastVerified: string | null
  /** ISO yyyy-mm-dd. When this record must be re-checked. */
  nextReview: string | null
  /** Reviewer's kill switch. Suppressed records never render. */
  suppressed?: boolean
  /**
   * Researched but deliberately not published yet — awaiting a final
   * verification pass. Held records never render and must say why.
   */
  hold?: boolean
  holdReason?: string
}

/**
 * A block of verified factual copy. `body` is paragraphs, so a block can be
 * two sentences or two paragraphs without the component guessing.
 */
export interface FactBlock {
  body: string[]
  provenance: Provenance
}

/** Danielle's words. Null until she writes them. Never filled by anyone else. */
export interface EditorialNote {
  body: string
  /** ISO date, when she dates it. */
  written: string | null
}

/**
 * The editorial modules. Every one is nullable and every one renders nothing
 * while null — no heading, no placeholder, no "coming soon".
 */
export interface AreaEditorial {
  /** "The short version". */
  shortVersion: EditorialNote | null
  /** "What your Tuesday might actually look like". */
  tuesday: EditorialNote | null
  /** "What you trade for what". */
  tradeoffs: EditorialNote | null
  /** "Danielle's note". */
  note: EditorialNote | null
}

/**
 * The factual modules, in the approved public order. Each is independently
 * gated: a guide renders the blocks that pass and omits the rest.
 */
export interface AreaFacts {
  /** Concise orientation. Renders with no section heading of its own. */
  orientation: FactBlock | null
  /** "Housing and built environment". */
  housing: FactBlock | null
  /** "Getting around". */
  access: FactBlock | null
}

export type PlaceCategory =
  | 'shopping-dining'
  | 'bookstore'
  | 'coffee'
  | 'park'
  | 'institution'

export type OperatingStatus =
  | 'open'
  | 'temporarily-closed'
  | 'permanently-closed'
  | 'unknown'

/**
 * A local place.
 *
 * Places have no routes and never will — a place is content inside a guide.
 * They carry no ratings, stars, reviews, prices, hours, or copied marketing
 * language, by rule.
 *
 * `areaIds` is an array because a place on a boundary can genuinely serve two
 * areas. Membership is authored, not derived from coordinates: there is no
 * geocoding here and none is planned.
 */
export interface Place {
  id: string
  name: string
  category: PlaceCategory
  areaIds: string[]
  address: string | null
  /**
   * First-party URL, and only when it has actually been verified. A missing
   * URL renders the place without a link. It is never guessed.
   */
  officialUrl: string | null
  status: OperatingStatus
  /** One short factual line, only where the research supports one. */
  description: string | null
  provenance: Provenance
  note: EditorialNote | null
}

/**
 * A comparison set used to explain quiz results.
 *
 * Clusters are internal authored constructs. They may overlap, they never
 * enter scoring, they are not personality labels, and `hasPublicPage` is typed
 * as the literal `false` so giving one a URL is a deliberate type change
 * somebody has to argue for rather than a drift.
 *
 * No instances exist yet — the cluster set is authored with the quiz.
 */
export interface Cluster {
  id: string
  /** Internal working label. Not rendered to readers. */
  label: string
  rationale: EditorialNote
  hasPublicPage: false
}

/** Loose grouping for the discovery index only. Not a cluster, not a route. */
export type AreaRegion =
  | 'west-valley'
  | 'central-valley'
  | 'westside'
  | 'hills-central'
  | 'central-east'
  | 'coastal'

export interface Area {
  id: string
  /** URL segment under /la-actually/areas/. */
  slug: string
  name: string
  region: AreaRegion
  /** Overlap is expected. Empty until the cluster set is authored. */
  clusterIds: string[]
  /** Curated by Danielle, never computed by proximity. */
  compareWith: string[]

  facts: AreaFacts
  editorial: AreaEditorial
  provenance: Provenance

  /**
   * Gates the route AND the sitemap. An unpublished area has no URL at all —
   * `generateStaticParams` never emits it, so it 404s rather than existing in
   * a half-written state.
   */
  published: boolean

  /**
   * For areas whose current conditions are changing faster than the review
   * cycle. The statement is Danielle's or the brokerage's wording, never
   * drafted here. Null for areas that do not need one.
   */
  currentConditionsFlag: {
    active: boolean
    statement: EditorialNote
  } | null

  /**
   * Concise factual meta description. Null falls back to the site default
   * rather than inventing marketing copy.
   */
  metaDescription: string | null
}
