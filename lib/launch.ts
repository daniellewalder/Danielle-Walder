/**
 * What is public on the live site.
 *
 * The site launches before every section is ready. A section switched off
 * here is hidden ON PRODUCTION ONLY: its routes 404, and every link to it —
 * header, drawer, both footers, the homepage, in-page link lists, the sitemap
 * — drops out. Preview deploys and local dev still show everything, so the
 * hidden sections can keep being built and reviewed.
 *
 * To launch a section, set it to true. That is the whole change.
 *
 * `LAUNCH_STAGE` is fixed at build time in next.config.ts from Vercel's own
 * VERCEL_ENV, so server and client agree.
 */
export const launched = {
  /**
   * The RealScout tools: /search, /home-valuation, /homes. Off until the
   * privacy policy exists and the widgets have been watched working in a real
   * browser — README launch blockers 1 and 2.
   */
  homeSearch: false,
  /** /la-actually and its area guides. Danielle: not ready yet. */
  laActually: false,
  /** /tuesday-test and its result page. Danielle: not ready yet. */
  tuesdayTest: false,
} as const

export type Section = keyof typeof launched

const routesBySection: Record<Section, readonly string[]> = {
  homeSearch: ['/search', '/home-valuation', '/homes'],
  laActually: ['/la-actually'],
  tuesdayTest: ['/tuesday-test'],
}

const isProduction = process.env.LAUNCH_STAGE === 'production'

/** Whether a section is visible in this build. */
export function isLive(section: Section): boolean {
  return launched[section] || !isProduction
}

/** Whether a link may be shown: false when it points into a hidden section. */
export function isLiveHref(href: string): boolean {
  const path = href.split(/[?#]/)[0]
  return (Object.keys(routesBySection) as Section[]).every(
    (section) =>
      isLive(section) ||
      !routesBySection[section].some((route) => path === route || path.startsWith(`${route}/`)),
  )
}

/** Drops links into hidden sections from a list. */
export function liveLinks<T extends { readonly href: string }>(links: readonly T[]): T[] {
  return links.filter((link) => isLiveHref(link.href))
}
