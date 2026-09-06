import { CtaLink } from '@/components/ui/CtaLink'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { about } from '@/lib/content/home'

/**
 * A profile feature, not an agent bio card.
 *
 * The name runs the full width of the butter block as its own band, with the
 * portrait bleeding off the block's left and bottom edges underneath it and
 * the copy set narrow in the open right column. Scale, crop and negative space
 * carry the section — there is no second image, no stat row and no proof
 * device to lean on.
 *
 * The stats row from the approved design is still not rendered: sales volume,
 * transaction counts, and years are unverified. It returns when Danielle
 * supplies real figures, not before.
 *
 * PHOTOGRAPHY: the portrait column is an upright ~6:7 editorial crop bleeding
 * to the block's left and bottom edges — a waist-up frame with room above the
 * head, not a headshot. The placeholder holds that shape at every width so the
 * composition does not move when the real photograph lands.
 */
export function About() {
  return (
    <section aria-labelledby="about" className="wrap pt-20 mobile:pt-14">
      <div className="overflow-hidden rounded-block bg-butter-field px-14 pt-16 tablet:px-9 tablet:pt-12 mobile:rounded-[16px] mobile:px-6 mobile:pt-9">
        {/*
          The rule bleeds the full width of the block so it meets the portrait
          below it rather than stopping 56px short of it. The name stays inset.
        */}
        <h2
          id="about"
          className="-mx-14 border-b border-butter-rule px-14 pb-10 font-mark text-[80px] font-semibold leading-[0.92] tracking-display text-butter-text tablet:-mx-9 tablet:px-9 tablet:pb-8 tablet:text-[52px] mobile:-mx-6 mobile:px-6 mobile:pb-7 mobile:text-[34px]"
        >
          {about.headline}
        </h2>

        <div className="grid grid-cols-[0.68fr_1fr] items-stretch gap-14 tablet:grid-cols-1 tablet:gap-0">
          {/*
            The portrait bleeds back through the block's padding to sit on its
            left and bottom edges, picking up the 20px corner from the block
            itself. Danielle and editorial photography take soft corners.
          */}
          <div className="-ml-14 min-h-[560px] tablet:-mx-9 tablet:h-[420px] tablet:min-h-0 mobile:-mx-6 mobile:h-[340px]">
            <ImageSlot
              image={about.portrait}
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="h-full"
            />
          </div>

          <div className="flex min-w-0 flex-col items-start justify-center gap-9 py-14 tablet:gap-7 tablet:py-10 mobile:gap-6 mobile:py-9">
            <p className="max-w-[46ch] font-sans text-[19px] leading-[1.55] text-butter-text tablet:text-[17.5px]">
              {about.copy}
            </p>

            {/*
              One confident action, one quieter one. Two filled buttons side by
              side read as a conversion panel; this reads as an invitation.
            */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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
