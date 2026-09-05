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
 * LAUNCH BLOCKER. Legally required on every page, and deliberately still
 * placeholders.
 *
 * Danielle's affiliation is Coldwell Banker Realty, but the name that must
 * appear here is the responsible broker's licensed name, and the licence
 * number shown must be her confirmed California DRE number. Both have to be
 * confirmed with her office and compliance team before they are displayed, so
 * neither is rendered yet.
 *
 * When those are confirmed, replace these two values verbatim. `license` is
 * rendered exactly as supplied and must carry its own label (for example
 * "DRE #01234567") — do not prefix or reformat it in the footer.
 *
 * Add NOTHING else here without approved wording from her brokerage: no office
 * name or address, no broker licence number, no logo, no Equal Housing
 * Opportunity or REALTOR® wording, no privacy policy, terms, accessibility
 * statement, or any other legal disclosure. Supplied and verified, or absent.
 */
export const legal = {
  brokerage: '[BROKERAGE — TO BE SUPPLIED]',
  license: '[DRE # — TO BE SUPPLIED]',
}
