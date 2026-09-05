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
 * Verified and supplied by Danielle. Legally required on every page.
 *
 * `license` carries its own label exactly as supplied — do not prefix it with
 * "DRE" or reformat it.
 *
 * LAUNCH BLOCKER: no brokerage disclosure language has been supplied. Do not
 * draft or infer any fair-housing, privacy, accessibility, licensing, terms,
 * or brokerage wording — it is supplied and verified, or it is absent. When
 * Danielle provides approved text, add it here verbatim and render it in the
 * footer.
 */
export const legal = {
  brokerage: 'Coldwell Banker',
  license: 'CalRE # 02253356',
}
