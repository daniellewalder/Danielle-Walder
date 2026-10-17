import {
  homeValuationPage,
  laActuallyPage,
  searchPage,
  tuesdayTestPage,
} from '@/lib/content/pages'

/**
 * Homepage copy.
 *
 * No statistics, testimonials, listings, or transaction outcomes appear on the
 * homepage until Danielle supplies verified figures — those sections are not
 * rendered rather than filled with placeholders.
 */

export const hero = {
  eyebrow: 'Los Angeles real estate, with a counterpoint',
  headline: 'A home is never just a home.',
  /**
   * The headline set as the hero's two display lines. Same words as
   * `headline`, only broken for the composition.
   */
  headlineLines: ['A home is never', 'just a home.'],
  intro:
    'It is a commute, a Tuesday night, a monthly payment, a neighborhood, a negotiation, and the particular life you want to have once the keys are yours.',
  primaryCta: { label: 'Search Homes', href: '/search' },
  secondaryCta: { label: 'Read Overthinking Real Estate', href: '/read' },
  portrait: {
    label: '[ADD DANIELLE PHOTO]',
    alt: 'Danielle Walder',
    src: null,
  },
  /**
   * Optional cut-out of the same photograph with the background removed, so
   * the subject stands in front of the headline. Only rendered when supplied —
   * it must be cut from the real portrait above, never a different image.
   */
  cutout: { src: null as string | null },
  /** The hero clock. Danielle works in Los Angeles. */
  clock: { label: 'LA', timeZone: 'America/Los_Angeles' },
}

export const about = {
  headline: "hi, I'm Danielle",
  copy: "I'm a Los Angeles real-estate agent and the person behind Overthinking Real Estate. I help people make big housing decisions with local context, honest analysis, and the recognition that buying a home is never only about the house.",
  portrait: {
    label: '[ADD DANIELLE PHOTO]',
    alt: 'Danielle Walder, smiling, in front of a wall of green leaves',
    src: '/media/danielle/portrait.webp',
  },
  primaryCta: { label: "Tell me what you're trying to figure out", href: '/contact' },
  secondaryCta: { label: 'More about me', href: '/about' },
}

export const overthinking = {
  eyebrow: 'the reading part',
  title: 'Overthinking Real Estate',
  /** Masthead dek. Danielle's, from her /read design. */
  dek: 'Original essays about homes, money, Los Angeles, identity, class, status, technology, privacy, risk, behavioral economics, and the strange things people do around housing.',
  moreLabel: 'Explore all essays',
  leadLabel: 'the latest',
  readCta: 'Read the essay',
}

/**
 * The homepage Tuesday Test block. Copy comes from the page itself so the two
 * never drift. The preview options are styled text — never interactive.
 */
export const tuesdayTest = {
  badge: 'the tuesday test',
  heading: tuesdayTestPage.heading,
  intro: tuesdayTestPage.intro,
  cta: { label: 'Take the Tuesday Test', href: '/tuesday-test' },
  preview: tuesdayTestPage.preview,
}

/**
 * Subscribing to Overthinking Real Estate — the same publication as the
 * editorial section above, not a second newsletter product. Copy is Danielle's,
 * taken from her approved /read design so the two surfaces agree.
 *
 * The heading is split so the publication name can carry its own typeface: the
 * mixed-typeface treatment the handoff asks to keep, now naming the thing it is
 * actually selling.
 *
 * Subscribing happens on Substack. There is no email form here and there must
 * not be a fake one.
 */
export const subscribe = {
  headingBefore: 'Get',
  headingPublication: 'Overthinking Real Estate',
  headingAfter: 'in your inbox.',
  body: 'Essays about homes, money, Los Angeles, technology, privacy, status, and the strange ways people make very expensive decisions.',
  cta: 'Subscribe on Substack',
  /** Shown until SUBSTACK_URL is set. No email field, no fake form. */
  pending:
    'Overthinking Real Estate is published on Substack. The subscribe link goes live as soon as the publication is connected.',
}

/** The homepage section labels, in page order. Nav anchors use the same ids. */
export const homeNav = [
  { label: 'about', href: '#about' },
  { label: 'overthinking real estate', href: '#read' },
  { label: 'the tuesday test', href: '#tuesday-test' },
  { label: 'contact', href: '#contact' },
] as const

export const aboutSection = {
  label: 'about danielle',
}

/**
 * "Start here" — the practical ways in, numbered. Every title is a real route
 * and every line under it is that page's own approved copy, so the two never
 * drift. The heading is the hero eyebrow Danielle approved.
 *
 * `note` is the justified paragraph beside the grid. It stays null — and is
 * not rendered — until Danielle writes one.
 */
export const startHere = {
  label: 'start here',
  heading: hero.eyebrow,
  features: [
    { label: 'search homes', href: '/search', body: searchPage.heading },
    { label: "what's my home worth?", href: '/home-valuation', body: homeValuationPage.followUp.body },
    { label: 'la, actually', href: '/la-actually', body: laActuallyPage.heading },
    {
      label: 'send me a house',
      href: '/contact?intent=showing',
      body: searchPage.showingHandoff.heading,
    },
  ],
  note: null as string | null,
}

/** The closing contact block. Heading and action are approved copy. */
export const contactSection = {
  label: 'contact',
  headingLines: ["Tell me what", "you're trying", 'to figure out'],
  cta: { label: 'Say hello', href: '/contact' },
  photo: {
    label: '[ADD CONTACT PHOTO]',
    alt: 'Danielle Walder',
    src: null,
  },
}
