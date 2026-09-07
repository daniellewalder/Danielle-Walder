import type { MetadataRoute } from 'next'
import { getPublishedAreas } from '@/lib/areas'
import { siteUrl } from '@/lib/config'

/**
 * Promoted routes only. `/homes` and `/sold` are intentional empty states that
 * exist so direct visitors do not hit a 404 — they are deliberately not
 * advertised here, in navigation, or on the homepage.
 *
 * ESSAY PAGES ARE DELIBERATELY ABSENT. Each /read/[slug] page canonicalises to
 * the original on Substack, which published it first. Listing a page here
 * while its canonical points somewhere else is a contradictory signal, so the
 * archive at /read is what gets advertised and the essays are reached through
 * it. Do not "fix" this by adding essay URLs — that would create the competing
 * canonical the current strategy exists to avoid.
 */
const routes = [
  '',
  '/read',
  '/search',
  '/home-valuation',
  '/tuesday-test',
  '/la-actually',
  '/about',
  '/contact',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '/read' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))

  /*
   * Area guides, derived. Unpublished areas produce no URL and therefore no
   * entry — the same gate that governs the route governs this.
   *
   * `lastModified` is the guide's own verification date rather than build
   * time, so the sitemap says when the content actually changed instead of
   * when the site last deployed.
   */
  const areaRoutes: MetadataRoute.Sitemap = getPublishedAreas().map((area) => ({
    url: `${siteUrl}/la-actually/areas/${area.slug}`,
    lastModified: area.provenance.lastVerified
      ? new Date(`${area.provenance.lastVerified}T00:00:00Z`)
      : lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...areaRoutes]
}
