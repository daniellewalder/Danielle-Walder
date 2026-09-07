export const contactPage = {
  eyebrow: 'say hello',
  heading: 'Say hello.',
  intro:
    "Tell me what you're trying to figure out. A neighborhood, a timeline, a number that does not work yet, or a question you are not sure how to ask.",
  emailLabel: 'Email me directly',

  /**
   * DORMANT. The contact form is not rendered at launch.
   *
   * It was removed rather than shipped in a state where it could not send: no
   * form provider has been chosen, and choosing one is Danielle's decision.
   * Email is the contact method for now.
   *
   * Everything below is preserved so ContactForm.tsx still compiles and can be
   * switched back on in one line once she picks a provider and sets
   * CONTACT_FORM_ENDPOINT. Do not install a provider without asking her, and
   * do not delete this — it is not dead code, it is deferred.
   */
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
    phone: { label: 'Phone', required: false, hint: 'Optional' },
    topic: { label: 'Topic', required: true },
    message: { label: 'Message', required: true },
  },
  topics: ['Buying', 'Selling', 'A neighborhood', 'A specific home', 'Something else'] as const,
  /** Exact required sentence for the form. Do not reword. */
  notice:
    'I’ll get back to you directly. Please do not send sensitive financial or identity information through this form.',
  deliveryPending:
    'Message delivery is being connected. Until it is, email is the reliable way to reach me.',
  deliveryPendingNoEmail:
    'Message delivery is being connected. This form is not sending yet, so please check back shortly.',
  submitLabel: 'Send message',
  submitting: 'Sending',
  success: 'Thank you — your message is on its way. I’ll come back to you directly.',
  failure: 'That did not send. Email is the reliable way to reach me in the meantime.',
  invalid: 'Please complete the required fields so I can reply.',
}

/**
 * The showing / property inquiry state — /contact?intent=showing.
 *
 * The same page in a different mode, not a second contact page and not a lead
 * funnel. The listing link is the point of the whole thing, so it is the first
 * and most prominent field; everything else is what Danielle needs to reply.
 *
 * The copy is conditional on purpose: "if a showing is available". Nothing here
 * promises access to every listing, because that is not something the site can
 * promise. Nothing here is scraped or fetched either — a pasted link is stored
 * as text and read by a person.
 */
export const showingInquiry = {
  eyebrow: 'send me a house',
  heading: 'Send me the house.',
  intro:
    "If there's a property you want to see, send it over. If a showing is available, I'll set it up — and we can use the appointment to look at the surrounding streets and the rest of the neighborhood, so you're evaluating more than the listing.",

  fields: {
    listingUrl: {
      label: 'Listing link',
      hint: 'Zillow, Redfin, the brokerage site — wherever you found it. Paste the address instead if that is easier.',
      required: false,
    },
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
    phone: { label: 'Phone', required: false, hint: 'Optional' },
    area: { label: 'Area', required: false, hint: 'Optional' },
    message: {
      label: 'Message',
      hint: "Anything you want me to know about the house, or what you're looking for.",
      required: false,
    },
  },

  submitLabel: 'Send it over',
  submitting: 'Sending',
  /** Reuses the approved contact notice verbatim. Do not reword. */
  success: "Got it — I'll come back to you directly about this one.",
  invalid: 'Please add your name and email so I can reply.',
}
