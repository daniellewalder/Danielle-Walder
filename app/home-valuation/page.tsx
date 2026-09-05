import type { Metadata } from 'next'
import { HomeValue } from '@/components/realscout/RealScout'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { homeValuationPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: "What's My Home Worth? — Danielle Walder",
  description: 'An automated home value estimate for Los Angeles homes.',
}

/** Blue owns tools. The widget's own title is off; this page sets its own. */
export default function HomeValuationPage() {
  return (
    <>
      <PageHeader
        eyebrow={homeValuationPage.eyebrow}
        heading={homeValuationPage.heading}
        intro={homeValuationPage.note}
      />

      <section aria-label="Home value estimate" className="wrap pt-12 mobile:pt-8">
        <div className="rounded-block bg-blue-field px-10 py-12 mobile:px-5 mobile:py-8">
          <HomeValue className="max-w-search" />
        </div>
      </section>

      <section aria-label="What an estimate does not tell you" className="wrap pt-12 mobile:pt-8">
        <div className="flex flex-col items-start gap-6 border-t border-hairline pt-10">
          <p className="max-w-measure font-sans text-[19px] leading-[1.5] text-warmgray mobile:text-[17px]">
            {homeValuationPage.followUp.body}
          </p>
          <CtaLink href={homeValuationPage.followUp.cta.href} variant="primary">
            {homeValuationPage.followUp.cta.label}
          </CtaLink>
        </div>
      </section>
    </>
  )
}
