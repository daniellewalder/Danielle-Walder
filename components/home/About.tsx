import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { about } from '@/lib/content/home'

/**
 * Butter owns this section. The portrait takes 20px soft corners — Danielle,
 * not property.
 *
 * The stats row from the approved design is not rendered: sales volume,
 * transaction counts, and years are unverified. It returns when Danielle
 * supplies real figures, not before.
 */
export function About() {
  return (
    <section aria-labelledby="about" className="wrap pt-20 mobile:pt-14">
      <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-12 rounded-block bg-butter-field px-12 py-14 tablet:grid-cols-1 tablet:gap-8 mobile:gap-7 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
        <ImageSlot
          image={about.portrait}
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="h-[420px] rounded-block mobile:h-[340px] mobile:rounded-[16px]"
        />

        <div className="flex min-w-0 flex-col gap-6 text-butter-text">
          <h2
            id="about"
            className="font-mark text-[50px] font-semibold leading-[0.96] tracking-display tablet:text-[42px] mobile:text-[32px]"
          >
            {about.headline}
          </h2>

          <p className="max-w-about font-sans text-[18px] leading-[1.55]">{about.copy}</p>

          {/*
            One confident action, one quieter one. Two filled buttons side by
            side read as a conversion panel; this reads as an invitation.
          */}
          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            <CtaLink href={about.primaryCta.href} variant="primary" tone="butter">
              {about.primaryCta.label}
            </CtaLink>
            <CtaLink
              href={about.secondaryCta.href}
              variant="editorial"
              className="border-butter-rule text-butter-text hover:border-butter-text hover:text-butter-text"
            >
              {about.secondaryCta.label} &rarr;
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}
