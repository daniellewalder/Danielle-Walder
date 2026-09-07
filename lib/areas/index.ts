import { fixtureArea } from './areas/__fixture'
import { calabasas } from './areas/calabasas'
import { places } from './places'
import type { Area, Place, PlaceCategory } from './types'
import {
  isGuideRenderable,
  isPublishable,
  publishedAreas,
  renderableFact,
  renderablePlaces,
} from './verify'

/**
 * The area registry — the one place the app asks for area content.
 *
 * Every accessor here goes through the gates in ./verify.ts, so a component
 * cannot reach an unverified record even by accident. Adding an area is one
 * import and one array entry.
 *
 * Nothing in the app should import ./areas/* or ./places directly.
 */

export type { Area, Place, PlaceCategory } from './types'
export type { AreaGuide, ItineraryStop, StopKind, AccessLevel } from './itinerary'

/**
 * Every area we hold research for, published or not.
 *
 * The fixture is `published: false`, so it produces no static param, no
 * sitemap entry and no index link, and getArea returns null for it unless
 * AREA_PREVIEW=1 is set locally. It is a layout harness, not a place.
 */
export const allAreas: Area[] = [calabasas, fixtureArea]

export const allPlaces: Place[] = places

/** Areas that may have a URL. Drives the route AND the sitemap. */
export function getPublishedAreas(): Area[] {
  return publishedAreas(allAreas)
}

/**
 * Slugs for `generateStaticParams`. An unpublished area produces no param,
 * therefore no page, therefore a 404 — the gate is structural rather than a
 * runtime check somebody could forget.
 */
export function getPublishedAreaSlugs(): string[] {
  return getPublishedAreas().map((area) => area.slug)
}

/**
 * One area by slug, or null. Unpublished areas are not findable.
 *
 * In DEVELOPMENT ONLY, AREA_PREVIEW=1 additionally resolves unpublished areas,
 * so an itinerary can be laid out and reviewed before its research is
 * approved. Both conditions are required: a production build ignores the flag
 * entirely, so an unpublished area cannot become a real page even if the
 * variable is set on a deployment by accident. Unpublished areas also produce
 * no static param, no sitemap entry and no index link regardless.
 */
export function getArea(slug: string): Area | null {
  const area = allAreas.find((candidate) => candidate.slug === slug)
  if (!area) return null
  if (isPublishable(area)) return area
  const previewing =
    process.env.NODE_ENV !== 'production' && process.env.AREA_PREVIEW === '1'
  return previewing ? area : null
}

/** The verified places for a guide, in the order they are authored. */
export function getAreaPlaces(areaId: string): Place[] {
  return renderablePlaces(allPlaces, areaId)
}

export { isGuideRenderable, isPublishable, renderableFact, renderablePlaces }
