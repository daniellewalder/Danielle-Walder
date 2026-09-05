/**
 * Site chrome and legal.
 *
 * Every href here must resolve to a real page. Nothing goes in this file until
 * its destination exists.
 */

export const siteName = 'danielle walder'

/**
 * Primary navigation. `Read` keeps the editorial treatment from the approved
 * design — Kalnia, wine — because it is the way into Overthinking Real Estate.
 */
export const navLinks = [
  { label: 'Search Homes', href: '/search' },
  { label: 'The Tuesday Test', href: '/tuesday-test' },
  { label: 'About Danielle', href: '/about' },
] as const

export const readLink = { label: 'Read', href: '/read' }

/** The publication wordmark, always lowercase — it reads as a voice. */
export const publicationWordmark = { label: 'overthinking real estate', href: '/read' }

export const navCta = { label: 'Say Hello', href: '/contact' }

export const startHereLinks = [
  { label: 'Search Homes', href: '/search' },
  { label: 'Take the Tuesday Test', href: '/tuesday-test' },
  { label: 'Explore LA, Actually', href: '/la-actually' },
  { label: "What's My Home Worth?", href: '/contact' },
] as const

export const footerGroups = [
  {
    heading: 'Explore',
    links: [
      { label: 'Read', href: '/read' },
      { label: 'LA, Actually', href: '/la-actually' },
      { label: 'The Tuesday Test', href: '/tuesday-test' },
    ],
  },
  {
    heading: 'Work with me',
    links: [
      { label: 'Search Homes', href: '/search' },
      { label: 'About Danielle', href: '/about' },
      { label: 'Say Hello', href: '/contact' },
    ],
  },
] as const

/**
 * LAUNCH BLOCKER. Brokerage name and DRE licence number are legally required
 * on every page and are placeholders until Danielle supplies verified details.
 * Do not invent these, and do not add equal-housing, privacy, or any other
 * disclosure language that has not been supplied and verified.
 */
export const legal = {
  brokerage: '[BROKERAGE — TO BE SUPPLIED]',
  dreNumber: '[DRE # — TO BE SUPPLIED]',
}
