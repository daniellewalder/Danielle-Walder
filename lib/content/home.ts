import type { Essay, Quiz, Stat, Testimonial } from '@/lib/types'

/**
 * Homepage copy. Everything bracketed is placeholder and stays bracketed until
 * Danielle supplies real text — never write filler in her voice.
 */

export const hero = {
  headline: '[HERO HEADLINE]',
  intro: '[INTRO COPY]',
  searchPlaceholder: 'where are you looking?',
  searchCta: 'search homes',
  portrait: {
    label: 'Danielle',
    alt: 'Danielle Walder — hero portrait',
    src: null,
  },
}

export const about = {
  headline: "hi, I'm Danielle",
  copy: "[ABOUT COPY — two or three sentences on how you work and what you're actually good at]",
  portrait: {
    label: 'Danielle',
    alt: 'Danielle Walder — portrait',
    src: null,
  },
  stats: [
    { value: '[SALES VOLUME]', label: 'closed' },
    { value: '[TRANSACTIONS]', label: 'homes' },
    { value: '[YEARS]', label: 'years in LA' },
  ] satisfies Stat[],
  primaryCta: { label: '[CTA]', href: '/contact' },
  secondaryCta: { label: 'more about me', href: '/about' },
}

export const leadEssay: Essay = {
  slug: 'the-cost-per-tuesday',
  title: 'The Cost Per Tuesday',
  standfirst: '[STANDFIRST]',
  kicker: 'essay',
  image: {
    label: 'Essay',
    alt: 'The Cost Per Tuesday — essay image',
    src: null,
  },
}

export const essayList: Essay[] = [
  {
    slug: 'everybody-says-they-want-a-deal',
    title: 'Everybody Says They Want a Deal.',
    kicker: 'essay',
  },
  {
    slug: 'who-actually-has-access-to-your-transaction',
    title: 'Who Actually Has Access to Your Transaction?',
    kicker: 'essay',
  },
  {
    slug: 'is-the-kitchen-actually-outdated',
    title: 'Is the Kitchen Actually Outdated, or Are You Just Tired of Looking at It?',
    kicker: 'essay',
  },
]

export const homepageQuiz: Quiz = {
  slug: 'what-kind-of-buyer-are-you',
  title: '[QUIZ TITLE]',
  intro: '[QUIZ INTRO]',
  questions: [
    {
      id: 'q1',
      label: '[QUESTION 1]',
      answers: [
        { id: 'a', label: '[ANSWER A]' },
        { id: 'b', label: '[ANSWER B]' },
        { id: 'c', label: '[ANSWER C]' },
        { id: 'd', label: '[ANSWER D]' },
      ],
    },
  ],
}

export const testimonial: Testimonial = {
  quote: '[CLIENT QUOTE]',
  client: '[CLIENT]',
  neighborhood: '[NEIGHBORHOOD]',
}

export const newsletter = {
  /** Mixed-typeface headline is intentional — keep the two halves separate. */
  headlineMark: 'one letter, twice a month.',
  headlineSerif: 'occasionally a house.',
  placeholder: 'your email',
  cta: 'subscribe',
  success: "You're in. First letter lands in a couple of weeks.",
  invalid: 'That email does not look right — check it and try again.',
  failure: 'Something went wrong on our end. Try again in a moment.',
}
