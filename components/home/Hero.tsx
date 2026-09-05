import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { hero } from '@/lib/content/home'

/**
 * Hero A — Danielle-led. Her portrait, not a house. That was a deliberate,
 * approved decision.
 *
 * There is no search field here. A text input that cannot search is fake
 * functionality, so the interaction is a primary CTA to /search instead. The
 * brown button treatment and the rest of the composition are unchanged.
 */
export function Hero() {
  return (
    <header className="wrap pt-[22px]">
      <div className="grid grid-cols-[1.04fr_0.96fr] items-center gap-[50px] rounded-block bg-blue-field px-[46px] py-[54px] tablet:grid-cols-1 tablet:gap-9 mobile:gap-8 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
        <div className="flex min-w-0 flex-col gap-[26px]">
          <p className="text-[11.5px] font-bold uppercase tracking-attribution text-blue-deep">
            {hero.eyebrow}
          </p>

          <h1 className="font-mark text-hero font-semibold tracking-display text-blue-ink tablet:text-hero-tablet mobile:text-hero-mobile">
            {hero.headline}
          </h1>

          <p className="max-w-intro font-sans text-[19px] leading-[1.45] text-blue-deep">
            {hero.intro}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <CtaLink href={hero.primaryCta.href} variant="primary">
              {hero.primaryCta.label}
            </CtaLink>
            <CtaLink href={hero.secondaryCta.href} variant="editorial">
              {hero.secondaryCta.label} &rarr;
            </CtaLink>
          </div>
        </div>

        <ImageSlot
          image={hero.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="h-[520px] rounded-[4px] tablet:h-[420px] mobile:h-[340px]"
        />
      </div>
    </header>
  )
}
