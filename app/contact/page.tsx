import type { Metadata } from 'next'
import { ShowingForm } from '@/components/contact/ShowingForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { contactEmail, contactFormEndpoint } from '@/lib/config'
import { parseArea, parseIntent } from '@/lib/contact/intent'
import { contactPage, showingInquiry } from '@/lib/content/contact'

/**
 * Metadata is static, so every query-param state canonicalises to /contact.
 * `?intent=showing` is a mode of this page, not a page of its own, and there
 * is deliberately no separate "request a showing" URL to index.
 */
export const metadata: Metadata = {
  title: 'Say Hello — Danielle Walder',
  description: 'Get in touch with Danielle Walder about buying, selling, or a Los Angeles neighborhood.',
  alternates: { canonical: '/contact' },
}

interface Props {
  searchParams: Promise<{ intent?: string | string[]; area?: string | string[] }>
}

/**
 * Two states, one page.
 *
 * DEFAULT — unchanged from launch. Email is the contact method: no form, no
 * provider, no fake submit. An unfinished form that says "delivery is being
 * connected" is worse than an address that works. The dormant general
 * ContactForm stays dormant until Danielle picks a provider.
 *
 * ?intent=showing — the property state. Someone found a house somewhere and
 * wants to see it, so the page becomes about that house. Unknown, missing or
 * malformed intent values fall back to the default state rather than erroring.
 *
 * Reading searchParams makes this route server-rendered rather than
 * prerendered. That is the trade for having the showing copy present in the
 * HTML instead of appearing after hydration.
 */
export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams
  const intent = parseIntent(params.intent)
  const area = parseArea(params.area)

  if (intent === 'showing') {
    return (
      <>
        <PageHeader
          eyebrow={showingInquiry.eyebrow}
          heading={showingInquiry.heading}
          intro={showingInquiry.intro}
          headingFont="mark"
        />

        <section aria-label={showingInquiry.heading} className="wrap pt-12 mobile:pt-8">
          <div className="max-w-[720px]">
            <ShowingForm
              deliveryEnabled={Boolean(contactFormEndpoint)}
              contactEmail={contactEmail}
              area={area}
            />
          </div>
        </section>

        {contactEmail ? (
          <section aria-label={contactPage.emailLabel} className="wrap pt-12 mobile:pt-8">
            <div className="border-t border-hairline pt-8">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex border-b-2 border-sage-olive pb-1 font-sans text-[20px] font-medium text-sage-olive hover:border-sage-deep hover:text-sage-deep mobile:text-[17px]"
              >
                {contactEmail}
              </a>
            </div>
          </section>
        ) : null}
      </>
    )
  }

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
