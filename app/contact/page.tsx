import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { contactEmail, contactFormEndpoint } from '@/lib/config'
import { contactPage } from '@/lib/content/contact'

export const metadata: Metadata = {
  title: 'Say Hello — Danielle Walder',
  description: 'Get in touch with Danielle Walder about buying, selling, or a Los Angeles neighborhood.',
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={contactPage.eyebrow}
        heading={contactPage.heading}
        intro={contactPage.intro}
      >
        {/* A real mailto only when a verified address exists. Never invented. */}
        {contactEmail ? (
          <a
            href={`mailto:${contactEmail}`}
            className="more-link inline-flex text-[16px]"
          >
            {contactEmail}
          </a>
        ) : null}
      </PageHeader>

      <section aria-label="Contact form" className="wrap pt-12 mobile:pt-8">
        <div className="max-w-[720px]">
          <ContactForm
            deliveryEnabled={Boolean(contactFormEndpoint)}
            contactEmail={contactEmail}
          />
        </div>
      </section>
    </>
  )
}
