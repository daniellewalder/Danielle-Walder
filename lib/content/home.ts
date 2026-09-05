import { tuesdayTestPage } from '@/lib/content/pages'

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
  intro:
    'It is a commute, a Tuesday night, a monthly payment, a neighborhood, a negotiation, and the particular life you want to have once the keys are yours.',
  primaryCta: { label: 'Search Homes', href: '/search' },
  secondaryCta: { label: 'Read Overthinking Real Estate', href: '/read' },
  portrait: {
    label: '[ADD DANIELLE PHOTO]',
    alt: 'Danielle Walder',
    src: null,
  },
}

export const about = {
  headline: "hi, I'm Danielle",
  copy: "I'm a Los Angeles real-estate agent and the person behind Overthinking Real Estate. I help people make big housing decisions with local context, honest analysis, and the recognition that buying a home is never only about the house.",
  portrait: {
    label: '[ADD DANIELLE PHOTO]',
    alt: 'Danielle Walder',
    src: null,
  },
  primaryCta: { label: "Tell me what you're trying to figure out", href: '/contact' },
  secondaryCta: { label: 'More about me', href: '/about' },
}

export const overthinking = {
  eyebrow: 'the reading part',
  title: 'Overthinking Real Estate',
  moreLabel: 'Read everything',
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

export const newsletter = {
  /** Mixed-typeface headline is intentional — keep the two halves separate. */
  headlineMark: 'one letter, twice a month.',
  headlineSerif: 'occasionally a house.',
  body: 'Overthinking Real Estate is published on Substack.',
  cta: 'Subscribe on Substack',
  /** Shown until SUBSTACK_URL is set. No email field, no fake form. */
  pending: 'Overthinking Real Estate is published on Substack. The subscribe link goes live as soon as the publication is connected.',
}
