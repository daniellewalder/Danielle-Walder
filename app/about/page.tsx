import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { aboutPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'About Danielle — Danielle Walder',
  description:
    'Danielle Walder, a Los Angeles real-estate agent and the person behind Overthinking Real Estate.',
}

/**
 * Butter owns this page. Every sentence here is Danielle's, supplied and
 * approved — no credentials, awards, years, brokerage, licence, figures, or
 * professional claims beyond this text.
 */
export default function AboutPage() {
  const [opening, ...rest] = aboutPage.sections

  return (
    <section aria-labelledby="about-heading" className="wrap pt-14 mobile:pt-10">
      <div className="grid grid-cols-[0.85fr_1.15fr] items-start gap-12 rounded-block bg-butter-field px-12 py-14 tablet:grid-cols-1 tablet:gap-8 mobile:gap-7 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
        <ImageSlot
          image={aboutPage.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="h-[460px] rounded-block tablet:h-[420px] mobile:h-[340px] mobile:rounded-[16px]"
        />

        <div className="flex min-w-0 flex-col gap-7 text-butter-text">
          <p className="text-[11.5px] font-bold uppercase tracking-attribution text-butter-bronze">
            {aboutPage.eyebrow}
          </p>

          <h1
            id="about-heading"
            className="font-mark text-[50px] font-semibold leading-[0.96] tracking-display tablet:text-[42px] mobile:text-[32px]"
          >
            {aboutPage.heading}
          </h1>

          <p className="max-w-about font-sans text-[18px] leading-[1.55]">{opening.body}</p>

          {rest.map((section) => (
            <div key={section.id} className="flex flex-col gap-3 border-t border-butter-rule pt-6">
              <h2 className="text-[11.5px] font-bold uppercase tracking-label text-butter-bronze">
                {section.label}
              </h2>
              <p className="max-w-about font-sans text-[18px] leading-[1.55]">{section.body}</p>
            </div>
          ))}

          <CtaLink href={aboutPage.cta.href} variant="primary" tone="butter" className="self-start">
            {aboutPage.cta.label}
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
