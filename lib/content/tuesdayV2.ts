/**
 * Copy for the V2 Tuesday Test flow.
 *
 * The questions, the options and every word of the result come from the frozen
 * engine. What lives here is the small amount of screen furniture the frozen
 * layers do not own: the forced choice's framing, which the instrument
 * specifies but which has no fixed option list because the pair is built at
 * run time, and the "which part" screen's heading.
 *
 * No reader-facing em dash anywhere.
 */

export const tuesdayV2 = {
  /**
   * Question eight, exactly as the instrument specifies it. The two options
   * are the pair the engine selected, so only the framing is written here.
   */
  tradeoff: {
    kicker: 'the one that survives',
    prompt: 'Two of these came up. If you had to pick one, which survives?',
    decline: "I'd keep looking.",
    /** Said once, because the answer is a real one and not a cop-out. */
    note: 'Both still matter. This only records which one survives a forced choice.',
  },

  /** The bundled "which part" screen. One tap per selection, never a new round. */
  qualifier: {
    kicker: 'which part',
    one: 'Which part of that did you mean?',
    many: 'Which part of each of those did you mean?',
  },

  /**
   * How the map reads as a side of the forced choice.
   *
   * Every other concept uses the model's own label, so this is the one side
   * that needs writing: the engine stores the map as a constraint rather than
   * as an attribute with a label.
   */
  mapSide: 'Staying inside the area you want',

  ordered: {
    dealbreaker: {
      help: 'Choose up to two. Both count the same.',
      rank: ['First', 'Second'],
      /** Read out to assistive tech, so the order is not carried by a badge. */
      announce: ['chosen first', 'chosen second'],
    },
    daily: {
      help: 'Choose up to two. The first one counts for more.',
      rank: ['First', 'Second'],
      announce: ['chosen first, and weighted higher', 'chosen second'],
    },
  },

  result: {
    eyebrow: 'the tuesday test',
    /** The link back, for a buyer who wants to start over. */
    retake: 'Take it again',
    /** The two agent-facing actions land in the next phase, not this one. */
    pending: {
      heading: 'Sending this to Danielle',
      body: 'The version of this that goes to Danielle is being built now. For the moment, the link in your address bar is the whole result, and it will still work later.',
    },
    empty: {
      heading: 'There is nothing to read yet.',
      body: 'This link does not carry a finished test. Take it and it will.',
      cta: 'Take the Tuesday Test',
    },
    unfinished: {
      heading: 'This one is not finished.',
      body: 'The link carries some answers but not all of them. Pick up where it stops.',
      cta: 'Carry on',
    },
  },
} as const
