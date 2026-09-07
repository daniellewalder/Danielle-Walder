import type { EditorialNote, Provenance } from './types'

/**
 * LA, Actually — the area test-drive.
 *
 * An area guide is not a directory and not a facts page. It is the day
 * Danielle would tell someone to spend if they were seriously thinking about
 * moving somewhere: the smallest set of stops, drives and contrasts that gives
 * the broadest useful understanding of the place.
 *
 * The itinerary is the editorial spine. Verified facts still exist underneath
 * and still carry provenance, but the public page reads as a route, not as the
 * research database behind it.
 *
 * WHAT THIS MODEL WILL NOT HOLD, by construction: anything that sorts people
 * rather than places. There is no field for who an area suits, no schools
 * rating, no safety rating, no demographic character. The reader tests the
 * geography against priorities they choose themselves — see NormalLifeTest.
 */

/**
 * What a stop is for. Used to pick the right rendering, never shown raw: each
 * one has an editorial label in lib/content/areas.ts.
 */
export type StopKind =
  /** A residential pocket to drive slowly through. */
  | 'residential'
  /** A route between two places, where the change along the way is the point. */
  | 'drive'
  /** Somewhere to park and cover on foot. */
  | 'walk'
  /** A commercial, civic or landmark anchor. */
  | 'anchor'
  /** Somewhere the public route genuinely ends. */
  | 'showing'
  /** Testing the area against an ordinary weekday errand. */
  | 'normal-life'
  /** Two things placed side by side on purpose. */
  | 'comparison'

/**
 * How much of a place a reader can actually see for themselves.
 *
 * This is the honest handling of gated and private communities, which matter
 * across a lot of Los Angeles. `showing-required` states that the public route
 * ends — it never suggests entering private property, and it never promises
 * Danielle can obtain access to anywhere.
 */
export type AccessLevel =
  /** Public streets. Drive or walk it freely. */
  | 'public'
  /** Visible and legible from a public route; the interior is not. */
  | 'view-from-public-route'
  /** The public route ends at the gate. */
  | 'showing-required'

/** Editorial media attached to a stop. Always optional. */
export interface StopMedia {
  /** A key in the editorial media registry. */
  asset: string
  /**
   * Stock may illustrate a general character. It may NEVER stand in for a
   * specific street, development or gated community unless that exact location
   * has been verified — which, for every stock asset currently held, it has
   * not.
   */
  representsThisLocation: false
}

/** The route between two stops, where the transition is the content. */
export interface DriveDetail {
  from: string
  to: string
  /** Named roads. Verified — see the stop's provenance. */
  roads: string[]
  /** What changes as you cover it: terrain, density, built form, upkeep. */
  whatChanges: string
}

/**
 * One stop or segment on the day.
 *
 * Only `id`, `title` and `kind` are required. A guide with three rich stops is
 * better than one with nine thin ones, and nothing here forces a fixed shape.
 */
export interface ItineraryStop {
  id: string
  /** "9:00", "Mid-morning", or nothing at all. */
  time: string | null
  title: string
  kind: StopKind
  /** Where this is, in plain editorial words. Not an address to navigate to. */
  location: string | null

  /** Danielle's reason for sending someone here. Her words. */
  whySentHere: EditorialNote | null
  /** What the stop is supposed to teach. Her words. */
  whatThisTeaches: EditorialNote | null
  /** The specific things to look at. Her words. */
  whatToNotice: string[]
  /**
   * The honest guard against over-reading one stop — "this street is not the
   * whole area". Optional, and valuable exactly where a reader would
   * generalise.
   */
  whatNotToConclude: EditorialNote | null

  /** "About twenty minutes." Never a computed or promised travel time. */
  howLong: string | null
  /** Present only on a drive segment. */
  drive: DriveDetail | null
  access: AccessLevel
  /** Editorial framing for a gated or private stop. Her words. */
  accessNote: EditorialNote | null
  media: StopMedia | null

  /**
   * Facts inside this stop still carry sources and dates. The public page
   * does not print them; the report and the review cycle read them.
   */
  provenance: Provenance
}

/**
 * "Pretend you bought the house."
 *
 * The reader picks the pocket they liked, then tests the drive to whatever
 * parts of their own life actually matter. The prompts are supplied per area
 * and must stay about geography and the reader's own stated priorities —
 * never about who they are, who lives somewhere, or how anywhere is rated.
 */
export interface NormalLifeTest {
  intro: EditorialNote
  /** "Drive it at the hour you would actually drive it." Her words. */
  prompts: string[]
}

/**
 * The closing questions. Four to seven, written for THIS area — the point is
 * that they are specific, so boilerplate repeated across guides would defeat
 * them.
 */
export interface BeforeYouLeave {
  intro: EditorialNote | null
  questions: string[]
}

/**
 * The whole test-drive. Attached to an Area as `guide`, and entirely optional:
 * an area without one renders its factual guide exactly as before, and an area
 * with a half-written one renders nothing of it. See `isGuideRenderable`.
 */
export interface AreaGuide {
  /** "How I'd spend a day getting to know Calabasas." Per area, never global. */
  headline: string
  /** Sets expectations: representative, not exhaustive. Her words. */
  intro: EditorialNote
  /** What the day is designed to make clear. The editorial thesis. */
  pointOfTheDay: EditorialNote
  /** Hero media key from the editorial registry. Optional. */
  heroMedia: StopMedia | null
  stops: ItineraryStop[]
  normalLifeTest: NormalLifeTest | null
  beforeYouLeave: BeforeYouLeave | null
  /**
   * Where the showing handoff sits mid-route — the id of the stop it follows,
   * usually a gated one. The closing handoff is always rendered; this is the
   * single contextual extra, and null means only the closing one appears.
   */
  showingCtaAfterStopId: string | null
}
