import { calabasas } from './areas/calabasas'
import { places } from './places'
import type { Area, Place, PlaceCategory } from './types'
import { isPublishable, publishedAreas, renderableFact, renderablePlaces } from './verify'

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

/** Every area we hold research for, published or not. */
export const allAreas: Area[] = [calabasas]

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

/** One area by slug, or null. Unpublished areas are not findable. */
export function getArea(slug: string): Area | null {
  const area = allAreas.find((candidate) => candidate.slug === slug)
  if (!area || !isPublishable(area)) return null
  return area
}

/** The verified places for a guide, in the order they are authored. */
export function getAreaPlaces(areaId: string): Place[] {
  return renderablePlaces(allPlaces, areaId)
}

export { isPublishable, renderableFact, renderablePlaces }
