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
 * Supplied and approved by Danielle's brokerage. Legally required on every
 * page and rendered VERBATIM — do not reword, re-case, reformat, abridge, or
 * split these strings, and do not update the copyright year by inference.
 *
 * Add NOTHING beyond what is here without new approved wording from her
 * brokerage: no office name or address, no logo, no additional Equal Housing
 * Opportunity or REALTOR(R) wording, no privacy policy, terms, or
 * accessibility statement. Supplied and verified, or absent.
 */
export const legal = {
  brokerageLine: 'COLDWELL BANKER RESIDENTIAL | CA DRE# 00616212',
  disclosure:
    'The property information herein is derived from various sources that may include, but not be limited to, county records and the Multiple Listing Service, and it may include approximations. Although the information is believed to be accurate, it is not warranted and you should not rely upon it without personal verification. Not intended as a solicitation if your property is already listed by another broker. Affiliated real estate agents are independent contractor sales associates, not employees. \u00a92026 Coldwell Banker. All Rights Reserved. Coldwell Banker and the Coldwell Banker logos are trademarks of Coldwell Banker Real Estate LLC. The Coldwell Banker\u00ae System is comprised of company owned offices which are owned by a subsidiary of Anywhere Advisors LLC and franchised offices which are independently owned and operated. The Coldwell Banker System fully supports the principles of the Fair Housing Act and the Equal Opportunity Act.',
}
