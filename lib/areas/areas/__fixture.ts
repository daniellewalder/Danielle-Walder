import type { Area } from '../types'

/**
 * A LAYOUT FIXTURE. Not a place. Not research. Never published.
 *
 * The real itineraries are being researched separately and must not be
 * invented here, but the components still have to be provable. So this area is
 * deliberately fictional and says so in every visible string: "Fixtureville" is
 * not a Los Angeles neighborhood and its roads do not exist. Nobody reading it
 * could mistake it for a recommendation.
 *
 * `published: false` means:
 *   - `generateStaticParams` never emits it, so it has no built page,
 *   - the sitemap never lists it,
 *   - the /la-actually index never links it,
 *   - `getArea` returns null for it in production.
 *
 * It resolves ONLY with AREA_PREVIEW=1 in a developer's own shell. To look at
 * it: AREA_PREVIEW=1 npm run dev, then /la-actually/areas/fixtureville.
 *
 * Delete this the day a real approved itinerary exists to lay out against.
 */
const note = (body: string) => ({ body, written: null })

const provenance = {
  sources: [
    {
      kind: 'government' as const,
      label: 'FIXTURE — not a real source',
      url: 'https://example.com/fixture',
      sourceDate: null,
    },
  ],
  lastVerified: '2026-09-07',
  nextReview: '2026-12-07',
}

export const fixtureArea: Area = {
  id: 'fixtureville',
  slug: 'fixtureville',
  name: 'Fixtureville (layout fixture)',
  region: 'west-valley',
  clusterIds: [],
  compareWith: [],

  facts: {
    orientation: {
      body: [
        'FIXTURE CONTENT. Fixtureville is not a real place and none of this describes anywhere in Los Angeles. This record exists so the itinerary layout can be reviewed before real research is approved.',
      ],
      provenance,
    },
    housing: null,
    access: null,
  },

  editorial: { shortVersion: null, tuesday: null, tradeoffs: null, note: null },
  provenance,
  published: false,
  currentConditionsFlag: null,
  metaDescription: null,

  guide: {
    headline: "How I'd spend a day getting to know Fixtureville",
    intro: note(
      'FIXTURE. This is not a route and Fixtureville is not a place. The text below exists only to prove the components render, wrap and stack correctly at every width.',
    ),
    pointOfTheDay: note(
      'FIXTURE. In a real guide this paragraph would say what the day is designed to make clear — which contrasts the route exposes, and what someone should understand by the end of it.',
    ),
    heroMedia: null,

    stops: [
      {
        id: 'fixture-stop-one',
        time: '9:00',
        title: 'Start somewhere that frames the rest of the day',
        kind: 'anchor',
        location: 'FIXTURE — not a real location',
        whySentHere: note('FIXTURE. Danielle’s reason for starting here would go in this field.'),
        whatThisTeaches: note('FIXTURE. What the stop is supposed to teach would go here.'),
        whatToNotice: [
          'FIXTURE — a specific thing to look at.',
          'FIXTURE — a second specific thing, long enough to check that a multi-line item still wraps cleanly on a narrow phone screen.',
        ],
        whatNotToConclude: null,
        howLong: 'About 30 minutes',
        drive: null,
        access: 'public',
        accessNote: null,
        media: null,
        provenance,
      },
      {
        id: 'fixture-drive',
        time: '10:15',
        title: 'The drive that shows the change',
        kind: 'drive',
        location: null,
        whySentHere: note('FIXTURE. A drive is content in its own right, not a gap between stops.'),
        whatThisTeaches: null,
        whatToNotice: ['FIXTURE — what shifts along the way.'],
        whatNotToConclude: null,
        howLong: null,
        drive: {
          from: 'FIXTURE — starting point',
          to: 'FIXTURE — ending point',
          roads: ['Fixture Road', 'Fixture Boulevard'],
          whatChanges:
            'FIXTURE. This field describes what changes as you cover the route — terrain, density, built form, upkeep.',
        },
        access: 'public',
        accessNote: null,
        media: null,
        provenance,
      },
      {
        id: 'fixture-gated',
        time: '11:30',
        title: 'Where the public route ends',
        kind: 'showing',
        location: 'FIXTURE — not a real community',
        whySentHere: note('FIXTURE. Why this contrast matters would go here.'),
        whatThisTeaches: null,
        whatToNotice: ['FIXTURE — what is legible from the public road.'],
        whatNotToConclude: note(
          'FIXTURE. This field guards against generalising from one street to a whole area.',
        ),
        howLong: null,
        drive: null,
        access: 'showing-required',
        accessNote: note(
          'FIXTURE. In a real guide this would say plainly that the public route stops at the gate — without suggesting anyone enter private property, and without promising access can be arranged.',
        ),
        media: null,
        provenance,
      },
    ],

    normalLifeTest: {
      intro: note(
        'FIXTURE. Pick the pocket you liked most, then drive to whichever parts of your own week actually matter. The point is to test the geography against your priorities, not anyone else’s.',
      ),
      prompts: [
        'FIXTURE — drive to wherever you go most often on a weekday.',
        'FIXTURE — find the freeway entrance you would actually use, in the direction you would actually go.',
        'FIXTURE — do the grocery run you would really do, at the hour you would really do it.',
      ],
    },

    beforeYouLeave: {
      intro: note('FIXTURE. Closing questions are written per area, never reused as boilerplate.'),
      questions: [
        'FIXTURE — which residential setting did you actually prefer?',
        'FIXTURE — were the houses you saved online in that part?',
        'FIXTURE — did you like the house, or the street around it?',
        'FIXTURE — which route would you repeat most often?',
      ],
    },

    showingCtaAfterStopId: 'fixture-gated',
  },
}
