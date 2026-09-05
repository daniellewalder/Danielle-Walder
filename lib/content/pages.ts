/**
 * Copy for every page beyond the homepage. All of it is Danielle's, supplied
 * and approved. Nothing here may be extended with claims she did not write —
 * no credentials, awards, years, brokerage, licence, statistics, or outcomes.
 */

/**
 * /read — the Overthinking Real Estate archive, set as an editorial front page.
 * All copy is Danielle's, verbatim from her design.
 */
export const readPage = {
  publicationName: 'Overthinking Real Estate',
  headline: 'Where every take gets a counter.',
  eyebrow: 'essays by danielle walder',
  intro:
    'Original essays about homes, money, Los Angeles, identity, class, status, technology, privacy, risk, behavioral economics, and the strange things people do around housing.',
  latestLabel: 'the latest',
  byline: 'By Danielle Walder',
  /** Publish dates come from the live feed or not at all — never invented. */
  essayKicker: 'essay',
  datePlaceholder: '[PUBLISH DATE]',
  readCta: 'Read on Substack',
  readOnSiteCta: 'Read the essay',

  /** Copy for an individual essay page. */
  essay: {
    originalCta: 'Read the original on Substack',
    truncatedNote:
      'This is a subscriber post, so only the opening appears here. The full essay is on Substack.',
  },

  moreLabel: 'More to overthink',

  /**
   * A recurring editorial feature. Danielle's own bracketed placeholder, kept
   * visible exactly as it appears in her design until she writes the first one.
   */
  counter: {
    label: 'the counter',
    body: '[A concise counterargument or complication of the featured essay goes here.]',
  },

  /** Blue owns this band. */
  helpBand: {
    heading: 'Need help with the real-life version?',
    body: 'Danielle is a Los Angeles real-estate agent. If you are looking for a home, deciding between neighborhoods, thinking about selling, or need a second opinion on a specific property, that is also part of the work',
    links: [
      { label: 'Search homes', href: '/search' },
      { label: 'How I work', href: '/about' },
      { label: 'Say hello', href: '/contact' },
    ],
  },

  /** The one dark band on this page. */
  subscribeBand: {
    heading: 'Get Overthinking Real Estate in your inbox.',
    body: 'Essays about homes, money, Los Angeles, technology, privacy, status, and the strange ways people make very expensive decisions.',
    cta: 'Subscribe on Substack',
    /** Shown instead of the button when no publication URL is configured. */
    pending:
      'Overthinking Real Estate is published on Substack. The subscribe link goes live as soon as the publication is connected.',
  },
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
  /** Screen-reader label for the embedded RealScout search. */
  searchLabel: 'Home search',
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
