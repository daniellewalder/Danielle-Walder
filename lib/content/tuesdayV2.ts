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
    prompt: 'If you had to pick one, which survives?',
    decline: "I'd keep looking.",
    /** Said once, because the answer is a real one and not a cop-out. */
    note: 'Both still matter. This only records which one survives a forced choice.',
  },

  /** The bundled "which part" screen. One tap per selection, never a new round. */
  qualifier: {
    kicker: 'which part',
    one: 'Which part of that did you mean?',
    many: 'Which part of each of those did you mean?',
    /*
     * Two answers, two groups, one Continue. Without this the button simply
     * stayed inert after the first group, with nothing on screen saying why.
     */
    manyHelp: 'Choose one for each answer above.',
  },

  /**
   * How the map reads as a side of the forced choice.
   *
   * Every other concept uses the model's own label, so this is the one side
   * that needs writing: the engine stores the map as a constraint rather than
   * as an attribute with a label.
   */
  mapSide: 'Staying inside the area you want',

  /**
   * The two questions that take two answers.
   *
   * THEY ARE NOT THE SAME MECHANIC, AND THEY MUST NOT LOOK ALIKE. On the
   * dealbreaker question both answers count the same; on the daily question
   * the first is weighted higher. Both used to print an identical numbered
   * badge, so the only thing telling them apart was a sentence that reads
   * almost the same two screens apart. The marks now say which rule is in
   * force, and `weighted` is what makes the first one louder.
   */
  ordered: {
    dealbreaker: {
      help: 'Choose up to two. Both count the same.',
      /** Equal weight, equal emphasis: neither of these outranks the other. */
      marks: ['first pick', 'second pick'],
      weighted: false,
      /** Read out to assistive tech, so the order is not carried by a badge. */
      announce: ['chosen first', 'chosen second'],
      full: 'Two selected. Remove one to choose something else.',
    },
    daily: {
      help: 'Choose up to two. The first one counts for more.',
      marks: ['most', 'second'],
      weighted: true,
      announce: ['chosen first, and weighted higher', 'chosen second'],
      full: 'Two selected. Remove one to choose something else.',
    },
  },

  result: {
    eyebrow: 'the tuesday test',
    /** The link back, for a buyer who wants to start over. */
    retake: 'Take it again',
    /** The handoff, which is where the result turns into something she can use. */
    cta: {
      heading: 'Want me to use this?',
      body: 'Send it over and I will search against it. You can add what the test could not ask about, or send it as it is.',
      send: 'Send Danielle my brief',
      copy: 'Copy my brief',
      copied: 'Copied',
      copyFailed: 'Copying did not work here. Select the brief below and copy it.',
      copyLink: 'Copy the link to this result',
      linkCopied: 'Link copied',
    },
    empty: {
      heading: 'There is nothing to read yet.',
      body: 'This link does not carry a finished test. Take it and it will.',
      cta: 'Take the Tuesday Test',
    },
    /**
     * The optional search details.
     *
     * RECORD THE CONSTRAINT, NEVER THE REASON. Not one of these asks why. No
     * field asks about schools beyond the boundary the buyer names, none asks
     * who the bedrooms are for, and none asks why a destination matters or why
     * stairs are a problem. The frozen handoff rule governs every word here.
     */
    handoff: {
      heading: 'A few search details',
      body: 'All optional. The test already did the hard part, so add only what is useful and leave the rest.',
      back: 'Back to the result',
      open: 'Open email to Danielle',
      openNote: "You'll review the email before anything sends.",
      tooLong: 'Your brief is too detailed for a reliable email draft, so I copied the full version instead. Paste it into an email to Danielle.',
      preview: 'What Danielle will get',
      /*
       * The preview was a 320px scroll box inside a page thousands of pixels
       * long, showing under half of what it was previewing. Now it opens in
       * the page, like anything else you are asked to read before sending.
       */
      previewMore: 'Read the whole brief',
      previewLess: 'Hide the whole brief',
      clarify: 'One thing to clarify with Danielle',

      /*
       * ONE DISCLOSURE, NOT A FORM FULL OF THEM.
       *
       * "All optional" was true in the copy and contradicted by the layout:
       * eight groups and fourteen fields, equally weighted, with the send
       * action five screens down. The basics are the ones most people have,
       * and everything else is one tap away with whatever was typed intact.
       */
      more: 'Add more search details',
      less: 'Hide the extra details',
      moreHelp: 'Boundaries, places you need to get to, stairs, a pool, anything else.',

      price: {
        legend: 'Price',
        min: 'Target minimum',
        max: 'Target maximum',
        ceiling: 'Hard ceiling',
        help: 'Any one of these is useful. You do not need all three.',
      },
      timing: {
        legend: 'Timing',
        options: [
          { id: 'casual', label: 'Just looking' },
          { id: 'thisYear', label: 'Sometime this year' },
          { id: 'active', label: 'Actively looking' },
          { id: 'specific', label: 'Specific timing' },
        ],
        note: 'What is driving the timing',
      },
      where: {
        legend: 'Where',
        considering: "Areas I'm considering",
        ruledOut: "Areas I've ruled out",
        note: 'Anything I should know about the map',
        help: 'One per line, or however you like to write them.',
      },
      school: {
        legend: 'School or district boundary',
        field: 'A specific school or district boundary I need respected',
        help: 'Written down exactly as you put it, and used as a boundary. Nothing is rated or ranked.',
      },
      destinations: {
        legend: 'Regular destinations',
        field: 'Places I regularly need to get to',
        help: 'One per line.',
      },
      property: {
        legend: 'Property basics',
        types: 'Property type',
        beds: 'Minimum bedrooms',
        baths: 'Minimum bathrooms',
        sqft: 'Minimum square footage',
        /* Asked with the basics, because most buyers have an answer to it. */
        parking: 'Parking or garage',
      },
      physical: {
        legend: 'Physical requirements',
        parking: 'Parking or garage',
        stairs: 'Stairs',
        pool: 'Pool',
        ev: 'EV charging',
        other: 'Anything else the house has to have',
        requirement: [
          { id: 'required', label: 'Required' },
          { id: 'preferred', label: 'Preferred' },
          { id: 'noPreference', label: 'No preference' },
        ],
        stairsOptions: [
          { id: 'stepFreeNeeded', label: 'Needs to be step free' },
          { id: 'preferMinimal', label: 'Prefer minimal' },
          { id: 'noPreference', label: 'No preference' },
        ],
        poolOptions: [
          { id: 'required', label: 'Required' },
          { id: 'no', label: 'Would rather not' },
          { id: 'noPreference', label: 'No preference' },
        ],
      },
      anythingElse: {
        legend: 'Anything else',
        field: 'Anything else I should know',
      },
    },

    unfinished: {
      heading: 'This one is not finished.',
      body: 'The link carries some answers but not all of them. Pick up where it stops.',
      cta: 'Carry on',
    },
  },
} as const
