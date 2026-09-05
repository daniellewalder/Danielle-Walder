/**
 * Site chrome and legal. Small local content files so Danielle can edit copy
 * without touching components.
 */

export const siteName = 'danielle walder'

export const navLinks = [
  { label: 'search', href: '/search' },
  { label: 'listings', href: '/listings' },
  { label: 'sold', href: '/sold' },
  { label: 'quizzes', href: '/quizzes' },
  { label: 'about', href: '/about' },
] as const

/** Set in Kalnia and wine — it reads as a voice, not a nav item. */
export const overthinkingLink = { label: 'overthinking real estate', href: '/overthinking-real-estate' }

export const navCta = { label: 'say hello', href: '/contact' }

export const startHereLinks = [
  { label: 'map search', href: '/search?view=map' },
  { label: 'new this week', href: '/listings?new=week' },
  { label: 'open houses', href: '/listings?open-house=true' },
  { label: "what I've sold", href: '/sold' },
  { label: "what's my home worth", href: '/home-valuation' },
] as const

export const footerLinks = [
  { label: 'search', href: '/search' },
  { label: 'listings', href: '/listings' },
  { label: 'sold', href: '/sold' },
  { label: 'overthinking real estate', href: '/overthinking-real-estate' },
  { label: 'quizzes', href: '/quizzes' },
  { label: 'about', href: '/about' },
  { label: 'contact', href: '/contact' },
] as const

/**
 * Legally required on every page. Non-negotiable — do not remove, and replace
 * the placeholders with the real brokerage name and DRE number before launch.
 */
export const legal = {
  brokerage: '[BROKERAGE]',
  dreNumber: '[DRE NUMBER]',
}
