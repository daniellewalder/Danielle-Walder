import type { MapConstraint, ScaleId } from './model.ts'

/**
 * The Tuesday Test question set.
 *
 * COPY STATUS: a draft in Danielle's register, awaiting her line edit. The
 * weights and structure are product logic and should survive a copy pass.
 *
 * NO OPTION MAY CARRY NEGATIVE IMPORTANCE. Choosing privacy over light says
 * privacy > light in one constrained comparison. It does not say light stopped
 * mattering, and a model that records `light: -1` has invented a finding the
 * buyer never made. Relative priority is expressed with `beats`, which credits
 * the winner and leaves the loser untouched.
 *
 * Question weights are not equal. The 7:14 opener is CONTEXT — it earns its
 * place by getting someone thinking about an ordinary Tuesday before they
 * start declaring nonnegotiables — and it is deliberately quiet in the model.
 */

export interface QuestionOption {
  id: string
  label: string
  /** Attribute id → direct importance evidence. Never negative. */
  attributes?: Readonly<Record<string, number>>
  /** Scale id → delta. */
  scales?: Readonly<Partial<Record<ScaleId, number>>>
  /** Relative priority: these win, and nothing loses importance for it. */
  beats?: { winners: readonly string[]; losers: readonly string[] }
  /** Set by the map question only. */
  mapConstraint?: MapConstraint
  /** Marks an option that declines to resolve a tension. */
  unresolved?: boolean
  /**
   * Named stances, used for conflict detection. Deliberately explicit rather
   * than inferred from a normalised scale: "I want it finished" plus "I'd
   * gladly redo the kitchen" is a contradiction you can point at, and reading
   * it off a blended number was unreliable in both directions.
   */
  signals?: readonly ('wantsFinished' | 'willBuild')[]
}

export interface Question {
  id: string
  kicker: string
  prompt: string
  /** Multiplies every attribute weight in this question's options. */
  weight: number
  /** Up to how many options may be chosen. 1 unless stated. */
  choose?: number
  options: readonly QuestionOption[]
  /** Rendered only when this predicate holds. */
  showWhen?: 'conflict'
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 'tuesday',
    kicker: 'the tuesday test',
    prompt: 'It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?',
    // Context, not a verdict. Kept for its brand value and because it puts
    // someone in an ordinary evening before they start ranking absolutes.
    weight: 0.5,
    options: [
      { id: 'errands', label: 'Getting dinner, errands, and the rest of life done without making it a project.', attributes: { convenience: 3 } },
      { id: 'room', label: 'Having enough room to work, rest, host people, and occasionally avoid everyone.', attributes: { size: 2, separation: 2 } },
      { id: 'close', label: 'Being close to the places and people that make Los Angeles worth living in.', attributes: { proximity: 3 } },
      { id: 'quiet', label: "Closing the door and not hearing everyone else's life through the walls.", attributes: { privacy: 3, street: 1 } },
    ],
  },

  {
    id: 'dealbreaker',
    kicker: 'the dealbreaker',
    prompt: 'You love the house. Which one still kills it?',
    weight: 1,
    options: [
      { id: 'dark', label: 'It is dark.', attributes: { light: 3 } },
      { id: 'street', label: 'The street is too busy.', attributes: { street: 3 } },
      { id: 'outside', label: "There is nowhere I'd actually want to be outside.", attributes: { outdoor: 3 } },
      { id: 'far', label: 'I am too far from the people I see constantly.', attributes: { proximity: 3 } },
      { id: 'privacy', label: 'There is no privacy.', attributes: { privacy: 3 } },
      { id: 'layout', label: 'The layout fights how I live.', attributes: { layout: 3 } },
      { id: 'outgrow', label: 'I will outgrow it.', attributes: { size: 3 } },
      { id: 'none', label: 'None of these automatically kill it.' },
    ],
  },

  {
    id: 'daily',
    kicker: 'the daily tax',
    // The category the first model could not see: a house can have every right
    // headline feature and still irritate you every single day.
    prompt:
      'Which part of a house is most likely to become a daily frustration if it does not work for you?',
    weight: 1,
    choose: 2,
    options: [
      { id: 'dark', label: 'Dark interior. Not enough meaningful natural light.', attributes: { light: 3 } },
      { id: 'outdoor', label: 'No real connection to usable outdoor space.', attributes: { outdoor: 3 } },
      { id: 'public', label: 'Public rooms that do not work for the way I live, host and cook.', attributes: { publicRooms: 3 } },
      { id: 'separation', label: 'Not enough separation — an office, a den, a guest room, somewhere to close a door.', attributes: { separation: 3 } },
      { id: 'stairs', label: 'Too many stairs, or awkward circulation.', attributes: { circulation: 3 } },
      { id: 'utility', label: 'Laundry, storage and pantry that create constant friction.', attributes: { utility: 3 } },
      {
        id: 'upkeep',
        label: 'Pool, landscape or property maintenance that feels like too much.',
        attributes: { upkeep: 3 },
        // Wanting a patio is not wanting acreage. This is the difference.
        scales: { operationalBurdenTolerance: -3 },
      },
      { id: 'parking', label: 'Parking, garage, driveway or charging that does not work.', attributes: { parking: 3 } },
      { id: 'unsure', label: 'I need help thinking about this.' },
    ],
  },

  {
    id: 'inherit',
    kicker: 'the trade',
    prompt: 'Which would you rather inherit?',
    weight: 1,
    options: [
      {
        id: 'lot',
        label: 'A great lot and a dated house.',
        attributes: { lot: 3 },
        beats: { winners: ['lot'], losers: ['condition', 'kitchen'] },
        scales: { renovationTolerance: 2, dayOneReadiness: -1 },
        signals: ['willBuild'],
      },
      {
        id: 'renovation',
        label: 'A beautiful renovation on a compromised lot.',
        attributes: { condition: 3 },
        // The lot loses a comparison. It is NOT marked unimportant — see header.
        beats: { winners: ['condition'], losers: ['lot'] },
        scales: { renovationTolerance: -2, dayOneReadiness: 2 },
      },
      {
        id: 'both',
        label: 'Neither. I would keep looking.',
        // A real answer from someone with narrow criteria, and worth flagging
        // rather than forcing into a hierarchy that was never expressed.
        unresolved: true,
      },
    ],
  },

  {
    id: 'whitehouse',
    kicker: 'the blank slate',
    prompt:
      'You walk into a beautifully proportioned house that is almost entirely white. Your first thought is…',
    weight: 1,
    options: [
      { id: 'mine', label: "Perfect. I'll make it mine.", scales: { personalizationAppetite: 3 } },
      { id: 'bones', label: 'Fine. If the bones are right, I can add the character.', attributes: { layout: 1 }, scales: { personalizationAppetite: 2, architecturalRequirement: 1 } },
      {
        id: 'personality',
        label: 'I want more personality from the house itself.',
        attributes: { character: 3 },
        // Architecture mattering does NOT imply they will not also layer. Both
        // can be high; nothing here suppresses personalization.
        scales: { architecturalRequirement: 3 },
      },
      { id: 'finished', label: 'I do not want another project. I want it finished.', attributes: { condition: 2 }, scales: { dayOneReadiness: 3, personalizationAppetite: -2 }, signals: ['wantsFinished'] },
    ],
  },

  {
    id: 'kitchen',
    kicker: 'the 2007 kitchen',
    prompt: 'Great house. Very 2007 kitchen.',
    weight: 1,
    options: [
      { id: 'fixable', label: 'Who cares? That is fixable.', scales: { renovationTolerance: 3 }, signals: ['willBuild'] },
      { id: 'depends', label: 'Depends how much work we are talking about.', scales: { renovationTolerance: 1 } },
      { id: 'never', label: 'I know myself. I will never redo it.', attributes: { kitchen: 3 }, scales: { renovationTolerance: -3 } },
      { id: 'done', label: 'No. I want to move in and be done.', attributes: { kitchen: 2, condition: 3 }, scales: { dayOneReadiness: 3, renovationTolerance: -2 }, signals: ['wantsFinished'] },
    ],
  },

  {
    id: 'location',
    kicker: 'the map',
    prompt: 'How much does the map actually move?',
    weight: 1,
    options: [
      { id: 'fixed', label: 'It does not. There is one area, and outside it does not work for my life.', mapConstraint: 'fixed' },
      { id: 'strong', label: 'I have a strong preference, but the right house nearby would get a look.', mapConstraint: 'strongPreference' },
      { id: 'few', label: 'There are a handful of areas that genuinely work.', mapConstraint: 'fewAreas' },
      { id: 'property', label: 'The right property could move me. How it lives matters more than where it is.', mapConstraint: 'propertyLed' },
    ],
  },

  {
    id: 'clarify',
    kicker: 'one more',
    // Shown ONLY when the answers genuinely conflict. Contradictions are not
    // averaged away and they are not interrogated either — one question.
    prompt: 'You said two things that pull against each other. Which is closer to the truth?',
    weight: 1,
    showWhen: 'conflict',
    options: [
      { id: 'cosmetic', label: 'I enjoy cosmetic changes, not construction.', scales: { personalizationAppetite: 3, renovationTolerance: -3 } },
      { id: 'exceptional', label: 'I would renovate, but only for an exceptional lot, light or property.', scales: { renovationTolerance: 1, architecturalRequirement: 1 } },
      { id: 'major', label: 'I am genuinely open to a major project if the economics work.', scales: { renovationTolerance: 3, dayOneReadiness: -2 } },
      { id: 'finished', label: 'I mostly want the house finished when I buy it.', attributes: { condition: 2 }, scales: { dayOneReadiness: 3, renovationTolerance: -2 } },
    ],
  },
]

/**
 * The optional follow-up when the map is tight.
 *
 * FREE TEXT, AND IT NEVER REACHES THE MODEL. The obvious design is a row of
 * chips — school, family, caregiving, commute — but familial status is
 * protected under the Fair Housing Act, and a tool that records "needs a
 * school nearby" and lets it influence which areas surface is a steering
 * mechanism. The model knows the STRENGTH of the constraint, which is all it
 * needs; the REASON goes only into the brief Danielle reads and is scored,
 * ranked and matched against nothing.
 */
export const MAP_NOTE = {
  shownWhen: { question: 'location', options: ['fixed', 'strong'] },
  label: 'What keeps the map tight?',
  hint: 'Optional, and only Danielle reads it.',
} as const

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id)
}

/** The questions everyone sees, in order. */
export const BASE_QUESTIONS = QUESTIONS.filter((question) => !question.showWhen)
