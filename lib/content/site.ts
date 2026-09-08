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

export type NavVoice = 'publication' | 'plain' | 'action'

export type NavLink = {
  label: string
  href: string
  voice: NavVoice
}

export type MenuGroup = {
  heading: string
  links: readonly NavLink[]
}

/**
 * The visible header navigation — four things, in Danielle's order and her
 * words. Everything else lives in the menu.
 *
 * Labels and routes are deliberately different things. The public route
 * vocabulary stays /read, /la-actually, /tuesday-test, /search, /home-valuation,
 * /homes, /sold, /about and /contact; the nav calls them what she calls them.
 *
 * `voice` is how a link is set, not what it is: the publication takes Kalnia
 * and wine because it is a masthead, the showing handoff takes wine and a
 * heavier weight because it is the one real-estate action in the header. It is
 * still text — it is not a filled button, and it must not become one.
 *
 * Deliberately NOT here:
 *
 * - `search`. Danielle's objection is that the bare word reads as a site-wide
 *   search box. Wherever the home-search tool is named in navigation it is
 *   "search homes"; the route stays /search.
 * - `/homes`. The route and the page are intact, but its public-facing label
 *   is undecided — "listings" is out and nothing has replaced it. It stays out
 *   of the header and out of the menu until Danielle approves a name. Do not
 *   invent one.
 * - `/sold`. Still a route so links to it do not break, but there is no
 *   verified sold data and the Your Listings widget on /homes already includes
 *   Sold and Rented.
 */
export const primaryNav: readonly NavLink[] = [
  { label: 'overthinking real estate', href: '/read', voice: 'publication' },
  { label: 'la, actually', href: '/la-actually', voice: 'plain' },
  { label: 'quizzes', href: '/tuesday-test', voice: 'plain' },
  { label: 'send me a house', href: '/contact?intent=showing', voice: 'action' },
]

/**
 * The rest of the menu behind the hamburger, grouped and labelled.
 *
 * `primaryNav` leads the panel above these, in its own column — someone who
 * opens the menu should not have to close it again to reach the thing they
 * came for.
 *
 * Privacy, terms and accessibility pages do not exist. When they do they
 * belong in a restrained secondary area at the foot of the panel, not as a
 * third group here. Nothing goes in this file until its destination exists.
 */
export const menuGroups: readonly MenuGroup[] = [
  {
    heading: 'Real estate',
    links: [
      { label: 'search homes', href: '/search', voice: 'plain' },
      { label: 'home valuation', href: '/home-valuation', voice: 'plain' },
    ],
  },
  {
    heading: 'Danielle',
    links: [
      { label: 'about', href: '/about', voice: 'plain' },
      { label: 'contact', href: '/contact', voice: 'plain' },
    ],
  },
]

/** The publication wordmark in the footer, always lowercase. */
export const publicationWordmark = { label: 'overthinking real estate', href: '/read' }

export const startHereLinks = [
  { label: 'search homes', href: '/search' },
  { label: 'take the tuesday test', href: '/tuesday-test' },
  { label: 'explore la, actually', href: '/la-actually' },
  { label: "what's my home worth?", href: '/home-valuation' },
] as const

/**
 * The footer follows the header's vocabulary: "search homes", not "search";
 * "contact", not "say hello". `/homes` is out of the footer too until its
 * public-facing label is approved — the route is untouched, only the word for
 * it is unsettled, and "listings" is not it.
 *
 * Otherwise left alone. "send me a house" is deliberately not added here: the
 * footer was not part of this pass beyond the three label corrections.
 */
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
      { label: 'search homes', href: '/search' },
      { label: 'about', href: '/about' },
      { label: 'contact', href: '/contact' },
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
