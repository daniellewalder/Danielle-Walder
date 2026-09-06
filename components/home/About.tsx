import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { about } from '@/lib/content/home'

/**
 * A profile feature, not an agent bio card — and a quiet beat after the dark
 * quiz section, so the heading stays at its approved scale rather than
 * competing with the hero.
 *
 * The composition does the work instead: the portrait is a full-height slice
 * bleeding off the block's left, top and bottom edges, taking its 20px corners
 * from the block, and the heading, copy and actions sit together in the open
 * right column with room around them. No stat row — sales volume, transaction
 * counts and years are unverified and stay unrendered until Danielle supplies
 * real figures. No second image.
 *
 * Type roles are the handoff's About roles, unchanged: the heading is
 * Unbounded 600 at 50px / 0.96 / -0.055em in butter ink, the copy Figtree 18px
 * at 1.55 on a 470px measure.
 *
 * PHOTOGRAPHY: the portrait column is an upright ~6:7 editorial crop bleeding
 * to three block edges — a waist-up frame with room above the head, not a
 * headshot. The placeholder holds that shape at every width so the composition
 * does not move when the real photograph lands.
 */
export function About() {
  return (
    <section aria-labelledby="about" className="wrap pt-20 mobile:pt-14">
      <div className="overflow-hidden rounded-block bg-butter-field mobile:rounded-[16px]">
        <div className="grid grid-cols-[0.55fr_1fr] items-stretch tablet:grid-cols-1">
          <div className="min-h-[560px] tablet:h-[420px] tablet:min-h-0 mobile:h-[340px]">
            <ImageSlot
              image={about.portrait}
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="h-full"
            />
          </div>

          <div className="flex min-w-0 flex-col items-start justify-center gap-6 px-14 py-14 tablet:gap-5 tablet:p-9 mobile:gap-5 mobile:p-6">
            <h2
              id="about"
              className="font-mark text-[50px] font-semibold leading-[0.96] tracking-display text-butter-text tablet:text-[42px] mobile:text-[32px]"
            >
              {about.headline}
            </h2>

            <p className="max-w-about font-sans text-[18px] leading-[1.55] text-butter-text">
              {about.copy}
            </p>

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
      </div>
    </section>
  )
}
