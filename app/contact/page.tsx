import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'
import { contactEmail } from '@/lib/config'
import { contactPage } from '@/lib/content/contact'

export const metadata: Metadata = {
  title: 'Say Hello — Danielle Walder',
  description: 'Get in touch with Danielle Walder about buying, selling, or a Los Angeles neighborhood.',
}

/**
 * Email is the contact method for launch. There is deliberately no form: an
 * unfinished one that says "delivery is being connected" is worse than an
 * address that works. Do not add a form, and do not pick a form provider —
 * that is Danielle's call. ContactForm.tsx is kept for when she does.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={contactPage.eyebrow}
        heading={contactPage.heading}
        intro={contactPage.intro}
      />

      {contactEmail ? (
        <section aria-label={contactPage.emailLabel} className="wrap pt-12 mobile:pt-8">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex border-b-2 border-sage-olive pb-1 font-sans text-[28px] font-medium text-sage-olive hover:border-sage-deep hover:text-sage-deep tablet:text-[24px] mobile:text-[20px]"
          >
            {contactEmail}
          </a>
        </section>
      ) : null}
    </>
  )
}
