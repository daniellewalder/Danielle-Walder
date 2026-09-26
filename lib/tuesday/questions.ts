import type { DimensionId } from './model.ts'

/**
 * The Tuesday Test question set.
 *
 * COPY STATUS: written to Danielle's brief and in her register, but it is a
 * DRAFT awaiting her line edit. The weights below are product logic and should
 * survive a copy pass; the wording should not be treated as final.
 *
 * Six decisions, each forcing a real choice rather than rating a list. Every
 * option carries what it actually implies — attribute points and dimension
 * deltas — so the model is readable as content rather than hidden in a scorer.
 *
 * Attribute points may be NEGATIVE. "Who cares, that's fixable" is a real
 * signal that a thing does not matter to this person, and it should be able to
 * pull an attribute down, not merely fail to push it up.
 */

export interface QuestionOption {
  id: string
  label: string
  /** Attribute id → points. Negative means actively does not care. */
  attributes?: Readonly<Record<string, number>>
  /** Dimension id → delta. */
  dimensions?: Readonly<Partial<Record<DimensionId, number>>>
}

export interface Question {
  id: string
  /** Small label above the question. */
  kicker: string
  prompt: string
  options: readonly QuestionOption[]
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 'tuesday',
    kicker: 'the tuesday test',
    // Kept from the original Tuesday Test. It is still the strongest opener:
    // it asks about an ordinary evening rather than an aspiration.
    prompt: 'It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?',
    options: [
      {
        id: 'errands',
        label: 'Getting dinner, errands, and the rest of life done without making it a project.',
        attributes: { convenience: 3 },
      },
      {
        id: 'room',
        label: 'Having enough room to work, rest, host people, and occasionally avoid everyone.',
        attributes: { size: 2, layout: 2 },
      },
      {
        id: 'close',
        label: 'Being close to the places and people that make Los Angeles worth living in.',
        attributes: { proximity: 2, convenience: 1 },
      },
      {
        id: 'quiet',
        label: "Closing the door and not hearing everyone else's life through the walls.",
        attributes: { privacy: 3, street: 1 },
      },
    ],
  },

  {
    id: 'dealbreaker',
    kicker: 'the dealbreaker',
    prompt: 'You love the house. Which one still kills it?',
    options: [
      { id: 'dark', label: 'It is dark.', attributes: { light: 3 } },
      { id: 'street', label: 'The street is too busy.', attributes: { street: 3 } },
      {
        id: 'outside',
        label: "There is nowhere I'd actually want to be outside.",
        attributes: { outdoor: 3 },
      },
      {
        id: 'far',
        label: 'I am too far from the people I see constantly.',
        attributes: { proximity: 3 },
        dimensions: { geographicRigidity: 1 },
      },
      { id: 'privacy', label: 'There is no privacy.', attributes: { privacy: 3 } },
      { id: 'layout', label: 'The layout fights how I live.', attributes: { layout: 3 } },
      { id: 'outgrow', label: 'I will outgrow it.', attributes: { size: 3, expansion: 1 } },
      {
        id: 'none',
        // A real answer, not a cop-out. Someone who weighs the whole package
        // rather than failing a house on one attribute deserves to be heard.
        label: 'None of these automatically kill it.',
      },
    ],
  },

  {
    id: 'inherit',
    kicker: 'the trade',
    prompt: 'Which would you rather inherit?',
    options: [
      {
        id: 'lot',
        label: 'A great lot and a dated house.',
        attributes: { lot: 3, condition: -1 },
        dimensions: { renovationTolerance: 2, turnkeyNeed: -1 },
      },
      {
        id: 'renovation',
        label: 'A beautiful renovation on a compromised lot.',
        attributes: { condition: 2, kitchen: 1, finishes: 1, lot: -1 },
        dimensions: { renovationTolerance: -2, turnkeyNeed: 2 },
      },
      {
        id: 'depends',
        // The sophisticated answer, and a genuine one — "compromised" covers
        // both a slope you can work with and a freeway you cannot.
        label: 'Depends entirely on what is compromised about the lot.',
        attributes: { lot: 2 },
        dimensions: { renovationTolerance: 1 },
      },
    ],
  },

  {
    id: 'whitehouse',
    kicker: 'the blank slate',
    prompt:
      'You walk into a beautifully proportioned house that is almost entirely white. Your first thought is…',
    options: [
      {
        id: 'mine',
        label: "Perfect. I'll make it mine.",
        attributes: { character: -1 },
        dimensions: { personalizationAppetite: 3, characterFromHouse: -2 },
      },
      {
        id: 'bones',
        label: 'Fine. If the bones are right, I can add the character.',
        attributes: { layout: 1 },
        dimensions: { personalizationAppetite: 2, characterFromHouse: -1 },
      },
      {
        id: 'personality',
        label: 'I want more personality from the house itself.',
        attributes: { character: 3 },
        dimensions: { characterFromHouse: 3 },
      },
      {
        id: 'finished',
        label: 'I do not want another project. I want it finished.',
        attributes: { condition: 2 },
        dimensions: { turnkeyNeed: 3, personalizationAppetite: -2 },
      },
    ],
  },

  {
    id: 'kitchen',
    kicker: 'the 2007 kitchen',
    prompt: 'Great house. Very 2007 kitchen.',
    options: [
      {
        id: 'fixable',
        label: 'Who cares? That is fixable.',
        attributes: { kitchen: -2 },
        dimensions: { renovationTolerance: 2, turnkeyNeed: -1 },
      },
      {
        id: 'depends',
        label: 'Depends how much work we are talking about.',
        dimensions: { renovationTolerance: 1 },
      },
      {
        id: 'never',
        // The most useful answer in the whole test. Self-knowledge, not
        // laziness — and it is what moves an "easy" attribute into PROTECT.
        label: 'I know myself. I will never redo it.',
        attributes: { kitchen: 3, condition: 2 },
        dimensions: { renovationTolerance: -3 },
      },
      {
        id: 'done',
        label: 'No. I want to move in and be done.',
        attributes: { condition: 3, kitchen: 2 },
        dimensions: { turnkeyNeed: 3, renovationTolerance: -2, personalizationAppetite: -1 },
      },
    ],
  },

  {
    id: 'location',
    kicker: 'the map',
    prompt: 'Which is closer to the truth?',
    options: [
      {
        id: 'neighborhood',
        label: 'I need to be in this neighborhood.',
        dimensions: { geographicRigidity: 3 },
      },
      {
        id: 'life',
        label: 'I need my life to feel a certain way. Where that happens is negotiable.',
        dimensions: { geographicRigidity: -2 },
      },
    ],
  },
]

/**
 * The optional follow-up when the map is tight.
 *
 * FREE TEXT ON PURPOSE, and it never reaches the model. The obvious design is
 * a row of chips — school, family, caregiving, commute — but familial status
 * is a protected class under the Fair Housing Act, and a tool that records
 * "needs a school nearby" and then lets that influence which neighborhoods
 * surface is a steering mechanism. So the constraint is captured in the
 * buyer's own words, goes only into the brief Danielle reads, and is scored,
 * stored and matched against exactly nothing.
 *
 * Do not turn this into options. Do not feed it to the scorer.
 */
export const MAP_NOTE = {
  shownWhen: { question: 'location', option: 'neighborhood' },
  label: 'What keeps the map tight?',
  hint: 'Optional, and only Danielle reads it.',
} as const

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id)
}
