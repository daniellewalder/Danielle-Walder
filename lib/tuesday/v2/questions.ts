import type { MapConstraint, ScaleId, StanceId } from './model.ts'

/**
 * The V2 question set.
 *
 * ONE CONDITIONAL, NOT TWO. V1 carried a contradiction follow-up for the buyer
 * who said both "I want it finished" and "I'd take the project on". In V2 both
 * positions arrive from `project`, which is single choice, so they can never
 * collide and the follow-up could never fire. It is removed rather than kept
 * alive by broadening what another answer means: a conditional exists because
 * the evidence can genuinely produce the state, not because we want it to be
 * reachable.
 *
 * COPY STATUS: approved wording. The weights and structure are product logic.
 *
 * NO OPTION MAY CARRY NEGATIVE IMPORTANCE. A position against something is
 * recorded as a STANCE, which is why "I'd rather it be plain" sets
 * `wantsNeutral` rather than a negative architecture score. Scales may go
 * negative; attributes never may.
 *
 * ORDERED MULTI-SELECT. Q2 and Q3 both take up to two answers, and the order
 * is recorded. They differ in what the order means:
 *
 *   Q2 asks about MEMBERSHIP of the dealbreaker set, which is binary, so both
 *   picks carry full strength and the rank is stored separately.
 *
 *   Q3 asks for a RANK, which is ordinal, so the second pick is genuinely
 *   weaker and lands in scrutinize rather than protect.
 */

export interface QuestionOption {
  id: string
  label: string
  /** Attribute id → direct importance at rank 1. Never negative. */
  attributes?: Readonly<Record<string, number>>
  /** Attribute id → direct importance at rank 2. Defaults to `attributes`. */
  attributesAtRankTwo?: Readonly<Record<string, number>>
  scales?: Readonly<Partial<Record<ScaleId, number>>>
  stances?: readonly StanceId[]
  mapConstraint?: MapConstraint
  /** Declines to resolve a forced choice. */
  unresolved?: boolean
  /** The attribute whose qualifier must be collected when this is chosen. */
  qualifies?: string
}

export interface Question {
  id: string
  kicker: string
  prompt: string
  /** Multiplies every attribute weight in this question's options. */
  weight: number
  /** How many options may be chosen. 1 unless stated. */
  choose?: number
  /** True when the second pick is explicitly optional and explicitly weaker. */
  ordered?: boolean
  options: readonly QuestionOption[]
  showWhen?: 'depends'
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 'tuesday',
    kicker: 'the tuesday test',
    prompt: 'It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?',
    // Context, not a verdict. Nothing here reaches the protect threshold, and
    // every attribute it touches has a full-strength source elsewhere.
    weight: 0.5,
    options: [
      {
        id: 'errands',
        label: 'Getting dinner, errands, and the rest of life done without making it a project.',
        attributes: { convenience: 3 },
      },
      {
        id: 'room',
        label: 'Having enough room to work, rest, host people, and occasionally avoid everyone.',
        attributes: { size: 2, separation: 2 },
      },
      {
        id: 'close',
        label: 'Being close to the places and people that make Los Angeles worth living in.',
        attributes: { proximity: 3 },
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
    prompt: 'You love the house. What still kills it?',
    weight: 1,
    choose: 2,
    ordered: true,
    options: [
      { id: 'dark', label: "It's dark.", attributes: { light: 3 } },
      { id: 'privacy', label: "There's no privacy.", attributes: { privacy: 3 } },
      { id: 'street', label: 'The street is too busy.', attributes: { street: 3 } },
      {
        id: 'outside',
        label: "There's nowhere I'd actually want to be outside.",
        attributes: { outdoor: 3 },
      },
      {
        id: 'site',
        label: 'The lot itself. The slope, the shape, or how the house sits on it.',
        attributes: { site: 3 },
        qualifies: 'site',
      },
      { id: 'far', label: "I'm too far from the people I see constantly.", attributes: { proximity: 3 } },
      { id: 'drive', label: 'Everything is a drive.', attributes: { convenience: 3 } },
      { id: 'layout', label: 'The layout fights how I live.', attributes: { layout: 3 } },
      { id: 'outgrow', label: "I'll outgrow it.", attributes: { size: 3 } },
      { id: 'none', label: 'None of these automatically kill it.' },
    ],
  },

  {
    id: 'daily',
    kicker: 'the daily tax',
    prompt: 'Which of these would wear on you first?',
    weight: 1,
    choose: 2,
    ordered: true,
    options: [
      {
        id: 'public',
        label: "The main rooms don't work for how I cook, eat and have people over.",
        attributes: { publicRooms: 3 },
        attributesAtRankTwo: { publicRooms: 2 },
      },
      {
        id: 'separation',
        label: "There's nowhere to close a door.",
        attributes: { separation: 3 },
        attributesAtRankTwo: { separation: 2 },
      },
      {
        id: 'stairs',
        label: 'Stairs, levels, getting around it.',
        attributes: { circulation: 3 },
        attributesAtRankTwo: { circulation: 2 },
      },
      {
        id: 'utility',
        label: 'Nowhere for everyday life to go.',
        attributes: { utility: 3 },
        attributesAtRankTwo: { utility: 2 },
        qualifies: 'utility',
      },
      {
        id: 'parking',
        label: 'Cars, arriving, getting in and out.',
        attributes: { parking: 3 },
        attributesAtRankTwo: { parking: 2 },
        qualifies: 'parking',
      },
      {
        id: 'upkeep',
        label: 'Keeping the outside up.',
        attributes: { upkeep: 3 },
        attributesAtRankTwo: { upkeep: 2 },
        qualifies: 'upkeep',
      },
      { id: 'unsure', label: "I'd want help thinking about this." },
    ],
  },

  {
    id: 'architecture',
    kicker: 'the house itself',
    prompt:
      'Some houses have something of their own. Others are just well built. Which matters to you?',
    weight: 1,
    options: [
      {
        id: 'alot',
        label: "A lot. If the house has no point of view, I'm not interested.",
        attributes: { architecturalCharacter: 3 },
      },
      {
        id: 'some',
        label: "Some. I'd take well proportioned and plain, but I'd rather have both.",
        attributes: { architecturalCharacter: 1 },
      },
      { id: 'notreally', label: 'Not really. I care how it works, not what period it is.' },
      {
        id: 'plain',
        label: "I'd rather it be plain, so nothing fights what I bring to it.",
        // A position, not a negative score. See the header.
        stances: ['wantsNeutral'],
      },
    ],
  },

  {
    id: 'personalization',
    kicker: 'the layer you add',
    prompt: 'Once you are in, how much of the look do you want to be yours?',
    weight: 1,
    options: [
      {
        id: 'all',
        label: 'All of it. Paint, paper, lighting, the lot.',
        scales: { personalizationAppetite: 3 },
      },
      {
        id: 'some',
        label: "Some. I'd change what bothers me and live with the rest.",
        scales: { personalizationAppetite: 1 },
      },
      {
        id: 'notmuch',
        label: "Not much. If it's done well I'd rather leave it alone.",
        scales: { personalizationAppetite: -2 },
      },
      {
        id: 'finished',
        label: "I'd rather buy it finished and not think about it.",
        attributes: { condition: 1 },
        // Low personalization appetite and some preference for day-one finish.
        // Deliberately NOT `wantsFinished`: preferring a finished-looking house
        // is not a refusal to renovate, and widening it to keep a conditional
        // reachable would be inventing a position the buyer never took.
        scales: { personalizationAppetite: -3, dayOneReadiness: 1 },
      },
    ],
  },

  {
    id: 'project',
    kicker: 'the 2007 kitchen',
    prompt: 'Great house. Very 2007 kitchen.',
    weight: 1,
    options: [
      {
        id: 'fixable',
        label: 'Who cares. That is fixable.',
        scales: { renovationTolerance: 2 },
        stances: ['willBuild'],
      },
      {
        id: 'further',
        label: "Honestly I'd go further. Walls, an addition, whatever the house needs.",
        // Establishes NO attribute. Willingness to do structural work is not a
        // desire for expansion potential, and scoring it as one would turn an
        // answer about appetite into a requirement nobody stated.
        scales: { renovationTolerance: 3, dayOneReadiness: -2 },
        stances: ['willBuild', 'structuralWorkOkay'],
      },
      {
        id: 'depends',
        label: 'Depends how much work we are talking about.',
        scales: { renovationTolerance: 1 },
      },
      {
        id: 'never',
        label: "I know myself. I'll never redo it.",
        attributes: { kitchen: 3 },
        scales: { renovationTolerance: -3 },
      },
      {
        id: 'done',
        label: 'No. I want to move in and be done.',
        attributes: { kitchen: 2, condition: 3 },
        scales: { dayOneReadiness: 3, renovationTolerance: -2 },
        stances: ['wantsFinished'],
      },
    ],
  },

  {
    id: 'location',
    kicker: 'the map',
    prompt: 'How much does the map actually move?',
    weight: 1,
    options: [
      {
        id: 'fixed',
        label: 'It does not. There is one area, and outside it does not work for my life.',
        mapConstraint: 'fixed',
      },
      {
        id: 'strong',
        label: 'I have a strong preference, but the right house nearby would get a look.',
        mapConstraint: 'strongPreference',
      },
      { id: 'few', label: 'There are a handful of areas that genuinely work.', mapConstraint: 'fewAreas' },
      {
        id: 'property',
        label: 'The right property could move me. How it lives matters more than where it is.',
        mapConstraint: 'propertyLed',
      },
    ],
  },

  // The tradeoff is question eight and is built at run time from what the
  // buyer established, so it has no fixed option list. See tradeoff.ts.

  {
    id: 'depends',
    kicker: 'one more',
    prompt: 'Depends on what, mostly?',
    weight: 1,
    showWhen: 'depends',
    options: [
      {
        id: 'money',
        label: "The money. If the numbers work, I'd take on a lot.",
        scales: { renovationTolerance: 2 },
        stances: ['budgetLed'],
      },
      {
        id: 'time',
        label: "The time. I can't live in a construction site.",
        scales: { renovationTolerance: 1, dayOneReadiness: 1 },
        stances: ['timeLed'],
      },
      {
        id: 'scale',
        label: 'The scale. Rooms, yes. Moving walls, no.',
        scales: { renovationTolerance: 1 },
        stances: ['scaleLimited'],
      },
      {
        id: 'house',
        label: "The house. For the right property I'd do a lot more.",
        scales: { renovationTolerance: 2 },
        stances: ['propertyGated'],
      },
    ],
  },

]

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id)
}

/** The questions everyone sees, in order. The tradeoff is appended at run time. */
export const BASE_QUESTIONS = QUESTIONS.filter((question) => !question.showWhen)

/**
 * The optional follow-up when the map is tight.
 *
 * FREE TEXT, AND IT NEVER REACHES THE MODEL. The model knows the STRENGTH of
 * the constraint, which is all it needs; the REASON goes only into the brief
 * Danielle reads and is scored, ranked and matched against nothing.
 */
export const MAP_NOTE = {
  shownWhen: { question: 'location', options: ['fixed', 'strong'] },
  label: 'What keeps the map tight?',
  hint: 'Optional, and only Danielle reads it.',
} as const
