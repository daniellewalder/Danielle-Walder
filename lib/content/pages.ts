/**
 * Copy for every page beyond the homepage. All of it is Danielle's, supplied
 * and approved. Nothing here may be extended with claims she did not write —
 * no credentials, awards, years, brokerage, licence, statistics, or outcomes.
 */

export const readPage = {
  eyebrow: 'the reading part',
  title: 'Overthinking Real Estate',
  /** Live feed: each title below is a real permalink. */
  intro:
    'Long-form essays on how real estate actually works. Published on Substack — every piece below opens there.',
  /**
   * Feed unavailable but the publication URL is known, so titles link to the
   * publication rather than to a specific piece. The wording must not promise
   * otherwise.
   */
  fallbackIntro: 'Long-form essays on how real estate actually works. Published on Substack — open the publication to read them.',
  /** No publication URL at all: titles render as plain text. */
  offlineNote: 'Essays are published on Substack. The link goes live as soon as the publication is connected.',
  subscribeCta: 'Subscribe on Substack',
}

export const aboutPage = {
  eyebrow: 'about danielle',
  heading: "hi, I'm Danielle",
  portrait: {
    label: '[ADD DANIELLE PHOTO]',
    alt: 'Danielle Walder',
    src: null,
  },
  sections: [
    {
      id: 'opening',
      body: "I'm Danielle Walder, a Los Angeles real-estate agent and the person behind Overthinking Real Estate. I help people make big housing decisions with local context, honest analysis, and the recognition that buying a home is never only about the house.",
    },
    {
      id: 'how-i-work',
      label: 'How I work',
      body: 'Before real estate, I worked in cybersecurity and third-party risk management. That means I care about price, timing, negotiation, and neighborhoods—and also the less glamorous parts: clear information, useful process, privacy, and the moments when a transaction becomes harder than it needs to be.',
    },
    {
      id: 'what-i-care-about',
      label: 'What I care about',
      body: 'I will absolutely tell you when a kitchen is beautiful. I will also ask whether you are going to enjoy your commute, your monthly payment, and the fact that the primary bedroom shares a wall with a bus route.',
    },
  ],
  cta: { label: "Tell me what you're trying to figure out", href: '/contact' },
}

export const searchPage = {
  eyebrow: 'search homes',
  heading: 'Start with what you know.',
  intro:
    'A neighborhood, a budget, a non-negotiable, or a vague feeling that you need more trees. The search gets more useful once you know what you are actually trying to solve for.',
  placeholderLabel: 'future mls / idx search',
  placeholderNote: 'Full property search will be powered by an MLS/IDX provider.',
  links: [
    { label: 'The Tuesday Test', href: '/tuesday-test' },
    { label: 'LA, Actually', href: '/la-actually' },
    { label: 'Need a second opinion?', href: '/contact' },
  ],
}

export const tuesdayTestPage = {
  eyebrow: 'the tuesday test',
  heading: 'Will you actually like living there?',
  intro:
    'A short home-and-neighborhood reflection tool about routine, space, location, quiet, and the particular inconveniences you are least willing to call "part of the charm."',
  /**
   * A static editorial preview. These options are text — never buttons, links,
   * inputs, or focusable elements — and nothing is scored, saved, or returned.
   */
  preview: {
    label: 'question 01',
    question: 'It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?',
    options: [
      'Getting dinner, errands, and the rest of life done without making it a project.',
      'Having enough room to work, rest, host people, and occasionally avoid everyone.',
      'Being close to the places and people that make Los Angeles worth living in.',
      "Closing the door and not hearing everyone else's life through the walls.",
    ],
  },
  closing: {
    body: "The full version is coming. In the meantime, tell me what you're trying to figure out.",
    cta: { label: "Tell me what you're trying to figure out", href: '/contact' },
  },
}

export const laActuallyPage = {
  eyebrow: 'la, actually',
  heading: 'The city is bigger than the listing description.',
  intro:
    'Neighborhood intelligence about routines, access, tradeoffs, housing, and the reality behind "it\'s only twenty minutes away."',
  ctas: [
    { label: "Tell me what you're trying to solve for", href: '/contact' },
    { label: 'Read Overthinking Real Estate', href: '/read' },
  ],
}

export const homesPage = {
  eyebrow: 'homes',
  heading: 'Worth seeing.',
  intro: 'Selected homes and useful context, when there is something specific to say.',
  ctas: [
    { label: 'Start a home search', href: '/search' },
    { label: 'Ask about a specific home', href: '/contact' },
  ],
}

export const soldPage = {
  eyebrow: 'sold',
  heading: 'More context, less trophy case.',
  intro:
    "Homes I've helped move through Los Angeles. The useful part is rarely just the final number.",
  ctas: [{ label: 'Thinking about selling?', href: '/contact' }],
}

export const notFoundPage = {
  eyebrow: 'page not found',
  heading: 'That page moved, or never existed.',
  intro: "Here is everything that does exist, which is a shorter list and an honest one.",
  links: [
    { label: 'Home', href: '/' },
    { label: 'Read', href: '/read' },
    { label: 'Search Homes', href: '/search' },
    { label: 'Say Hello', href: '/contact' },
  ],
}
