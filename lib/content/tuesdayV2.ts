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
      openNote: 'This opens your email app with the brief ready to send. Nothing is sent until you press send there.',
      tooLong: 'That is too long for an email link to carry safely. The whole brief has been copied instead, so you can paste it into a new email.',
      trimmedNote: 'Your closing note was too long to carry in the email link, so the brief went without it. It is in the copied version if you would rather paste that.',
      preview: 'What Danielle will get',
      clarify: 'One thing to clarify with Danielle',

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
