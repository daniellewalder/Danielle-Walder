/**
 * Site chrome and legal.
 *
 * Every href here must resolve to a real page. Nothing goes in this file until
 * its destination exists.
 */

/** The footer lockup and page titles. */
export const siteName = 'danielle walder'

/** The nav wordmark carries the full mark. */
export const navWordmark = 'danielle walder real estate'

/**
 * Primary navigation — Danielle's labels, lowercase, in her order.
 *
 * Labels and routes are deliberately different things. The public route
 * vocabulary stays /read, /search, /tuesday-test, /homes, /sold, /about and
 * /contact; the nav calls them what she calls them.
 *
 * Every destination is a real page with real content.
 *
 * `sold` is deliberately NOT here. /sold still exists as a route so links to
 * it do not break, but it has no verified sold data, and the Your Listings
 * widget on /homes already includes Sold and Rented. Do not add it back to the
 * nav, do not redirect it to /homes, and do not invent sold data to justify
 * it.
 */
export const navLinks = [
  { label: 'search', href: '/search' },
  { label: 'listings', href: '/homes' },
] as const

/** Sits mid-row, set in Kalnia and wine — it reads as a voice, not a nav item. */
export const readLink = { label: 'overthinking real estate', href: '/read' }

/** The rest of the row, after the publication. */
export const navLinksAfter = [
  { label: 'quizzes', href: '/tuesday-test' },
  { label: 'about', href: '/about' },
] as const

/** The publication wordmark in the footer, always lowercase. */
export const publicationWordmark = { label: 'overthinking real estate', href: '/read' }

export const navCta = { label: 'say hello', href: '/contact' }

export const startHereLinks = [
  { label: 'search homes', href: '/search' },
  { label: 'take the tuesday test', href: '/tuesday-test' },
  { label: 'explore la, actually', href: '/la-actually' },
  { label: "what's my home worth?", href: '/home-valuation' },
] as const

export const footerGroups = [
  {
    heading: 'Explore',
    links: [
      { label: 'overthinking real estate', href: '/read' },
      { label: 'la, actually', href: '/la-actually' },
      { label: 'quizzes', href: '/tuesday-test' },
    ],
  },
  {
    heading: 'Work with me',
    links: [
      { label: 'search', href: '/search' },
      { label: 'listings', href: '/homes' },
      { label: 'about', href: '/about' },
      { label: 'say hello', href: '/contact' },
    ],
  },
] as const

/**
 * Supplied by Danielle and approved by her brokerage. Legally required on
 * every page and rendered VERBATIM — do not reword, re-case, reformat,
 * abridge, or split these strings, and do not update the copyright year by
 * inference.
 *
 * Two licence numbers, and they are not interchangeable: 02253356 is
 * Danielle's own agent licence, 00616212 is the responsible brokerage's.
 *
 * Add NOTHING beyond what is here without new approved wording from her
 * brokerage: no office name or address, no logo, no additional Equal Housing
 * Opportunity or REALTOR(R) wording, no privacy policy, terms, or
 * accessibility statement. Supplied and verified, or absent.
 */
export const legal = {
  /** Danielle's own California licence, supplied by her. */
  agentLine: 'Danielle Walder | CA DRE# 02253356',
  /** The responsible broker. CA DRE# 00616212 is the brokerage's licence. */
  brokerageLine: 'COLDWELL BANKER RESIDENTIAL | CA DRE# 00616212',
  disclosure:
    'The property information herein is derived from various sources that may include, but not be limited to, county records and the Multiple Listing Service, and it may include approximations. Although the information is believed to be accurate, it is not warranted and you should not rely upon it without personal verification. Not intended as a solicitation if your property is already listed by another broker. Affiliated real estate agents are independent contractor sales associates, not employees. \u00a92026 Coldwell Banker. All Rights Reserved. Coldwell Banker and the Coldwell Banker logos are trademarks of Coldwell Banker Real Estate LLC. The Coldwell Banker\u00ae System is comprised of company owned offices which are owned by a subsidiary of Anywhere Advisors LLC and franchised offices which are independently owned and operated. The Coldwell Banker System fully supports the principles of the Fair Housing Act and the Equal Opportunity Act.',
}
