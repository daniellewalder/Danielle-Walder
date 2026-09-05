export const contactPage = {
  eyebrow: 'say hello',
  heading: 'Say hello.',
  intro:
    "Tell me what you're trying to figure out. A neighborhood, a timeline, a number that does not work yet, or a question you are not sure how to ask.",
  /** Exact required sentence. Do not reword. */
  notice:
    'I’ll get back to you directly. Please do not send sensitive financial or identity information through this form.',
  /**
   * Shown in place of a submit button until CONTACT_FORM_ENDPOINT is set. The
   * form must never appear to send when it cannot — no fake success state.
   */
  deliveryPending: 'Message delivery is being connected. Until it is, email is the reliable way to reach me.',
  deliveryPendingNoEmail:
    'Message delivery is being connected. This form is not sending yet, so please check back shortly.',
  fields: {
    name: { label: 'Name', required: true },
    email: { label: 'Email', required: true },
    phone: { label: 'Phone', required: false, hint: 'Optional' },
    topic: { label: 'Topic', required: true },
    message: { label: 'Message', required: true },
  },
  topics: [
    'Buying',
    'Selling',
    'A neighborhood',
    'A specific home',
    'Something else',
  ] as const,
  submitLabel: 'Send message',
  submitting: 'Sending',
  success: 'Thank you — your message is on its way. I’ll come back to you directly.',
  failure: 'That did not send. Email is the reliable way to reach me in the meantime.',
  invalid: 'Please complete the required fields so I can reply.',
}
