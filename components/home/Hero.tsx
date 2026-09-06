import { SimpleSearch } from '@/components/realscout/RealScout'
import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { hero } from '@/lib/content/home'

/**
 * Hero A — Danielle-led. Her portrait, not a house.
 *
 * Composed as an opening spread rather than two columns of equal weight. The
 * type column is deliberately narrow so the headline wraps to three lines and
 * reads as a masthead; the portrait is a tall vertical slice bleeding to the
 * top, right and bottom edges of the block, so it reads as a crop rather than
 * a rectangle sitting in padding. Its corners come from the block's own radius.
 *
 * A blue-steel rule divides statement from utility: everything above is the
 * claim, everything below is the practical way in. The search field is
 * RealScout's — nothing here implies behaviour it does not have.
 *
 * The portrait aspect is roughly 2:3. That is the crop Danielle's real
 * photograph needs; the placeholder holds it exactly so the composition can be
 * judged before the photo exists.
 */
export function Hero() {
  return (
    <header className="wrap pt-[22px]">
      <div className="grid grid-cols-[1.34fr_0.66fr] items-stretch overflow-hidden rounded-block bg-blue-field tablet:grid-cols-1 mobile:rounded-[16px]">
        <div className="flex min-w-0 flex-col justify-between py-16 pl-[52px] pr-16 tablet:px-9 tablet:pb-12 tablet:pt-12 mobile:px-6 mobile:pb-10 mobile:pt-9">
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-attribution text-blue-deep">
              {hero.eyebrow}
            </p>

            <h1 className="mt-8 max-w-[13ch] font-mark text-hero font-semibold tracking-display text-blue-ink tablet:text-hero-tablet mobile:text-hero-mobile">
              {hero.headline}
            </h1>
          </div>

          <div className="mt-14 tablet:mt-10">
            <p className="max-w-[46ch] border-t border-blue-steel pt-8 font-sans text-[18px] leading-[1.55] text-blue-deep tablet:pt-7">
              {hero.intro}
            </p>

            <div className="mt-8">
              <SimpleSearch />
            </div>

            <CtaLink href={hero.secondaryCta.href} variant="editorial" className="mt-8">
              {hero.secondaryCta.label} &rarr;
            </CtaLink>
          </div>
        </div>

        <ImageSlot
          image={hero.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 34vw"
          className="h-full min-h-[620px] tablet:h-[440px] tablet:min-h-0 mobile:h-[380px]"
        />
      </div>
    </header>
  )
}
