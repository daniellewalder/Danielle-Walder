import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/config'

/**
 * Promoted routes only. `/homes` and `/sold` are intentional empty states that
 * exist so direct visitors do not hit a 404 — they are deliberately not
 * advertised here, in navigation, or on the homepage.
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

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '/read' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
