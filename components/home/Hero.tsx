import { SimpleSearch } from '@/components/realscout/RealScout'
import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { hero } from '@/lib/content/home'

/**
 * Hero A — Danielle-led. Her portrait, not a house. That was a deliberate,
 * approved decision.
 *
 * The search field is RealScout's, so it genuinely searches. It sat empty
 * through the earlier builds precisely because a box that cannot search is
 * fake functionality.
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

          {/*
            The search field the approved hero always had. It was removed while
            it could not search; RealScout makes it real, so it is back.
          */}
          <SimpleSearch />

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
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
