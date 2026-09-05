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
      <div className="grid grid-cols-[1.12fr_0.88fr] items-stretch gap-[56px] overflow-hidden rounded-block bg-blue-field pl-[52px] tablet:grid-cols-1 tablet:gap-9 tablet:px-9 tablet:pb-0 tablet:pt-12 mobile:gap-8 mobile:rounded-[16px] mobile:px-6 mobile:pt-8">
        <div className="flex min-w-0 flex-col justify-center gap-7 py-16 tablet:py-0 mobile:py-0">
          <p className="text-[11.5px] font-bold uppercase tracking-attribution text-blue-deep">
            {hero.eyebrow}
          </p>

          <h1 className="font-mark text-hero font-semibold tracking-display text-blue-ink tablet:text-hero-tablet mobile:text-hero-mobile">
            {hero.headline}
          </h1>

          <p className="max-w-[40ch] font-sans text-[19px] leading-[1.5] text-blue-deep">
            {hero.intro}
          </p>

          {/*
            The search field the approved hero always had. It was removed while
            it could not search; RealScout makes it real, so it is back.
          */}
          <SimpleSearch className="mt-1 pr-2" />

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <CtaLink href={hero.secondaryCta.href} variant="editorial">
              {hero.secondaryCta.label} &rarr;
            </CtaLink>
          </div>
        </div>

        {/*
          Danielle anchors the block. The portrait bleeds to the right and
          bottom edges rather than floating inside padding — the opening spread
          should feel composed, not like an image dropped in a box. 20px soft
          corners on the outer edge, per the photography rule: soft is Danielle
          and editorial, square is property.
        */}
        <ImageSlot
          image={hero.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="h-full min-h-[540px] tablet:h-[440px] tablet:min-h-0 mobile:h-[360px]"
        />
      </div>
    </header>
  )
}
