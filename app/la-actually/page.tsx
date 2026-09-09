import type { Metadata } from 'next'
import { AreaIndex } from '@/components/areas/AreaIndex'
import { LaActuallyHero } from '@/components/areas/LaActuallyHero'
import { EditorialImage } from '@/components/media/EditorialImage'
import { CtaLink } from '@/components/ui/CtaLink'
import { getPublishedAreas } from '@/lib/areas'
import { editorialMedia } from '@/lib/content/editorialMedia'
import { laActuallyPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'LA, Actually — Danielle Walder',
  description:
    'Neighborhood intelligence about routines, access, tradeoffs, and housing across Los Angeles.',
}

/**
 * The LA, Actually hub, and the area-discovery index in Phase 1.
 *
 * The area section lists PUBLISHED guides only. Areas still being researched
 * are absent rather than stubbed — no placeholder rows, no "coming soon".
 *
 * Still no maps, commute times, school statements, rankings, or local factual
 * claims beyond what each guide verifies for itself.
 */
export default function LaActuallyPage() {
  const areas = getPublishedAreas()

  return (
    <>
      {/*
        The opening is the footage with the copy set into it — not a cream
        masthead with a picture underneath. Stock editorial media: not a
        listing, not a sale, and not captioned with a place name, because the
        location has not been verified.
      */}
      <LaActuallyHero />

      <AreaIndex areas={areas} />

      {/*
        The counterpoint, and the argument of the page: the coast at the top and
        inland hills cut by a freeway down here are not the same city, and the
        freeway is the thing you actually have to drive. Vertical media in a
        narrow column — never stretched into a horizontal hero.

        A still rather than the second video on purpose. Two ~10 MB loops on one
        page is a lot to ask of a phone, one moving element is more restrained
        than two, and this frame carries the argument better than palms do. The
        palm loop and the residential still stay in the registry, unused here.
      */}
      <section aria-label="Hills, houses and a freeway" className="wrap pt-14 mobile:pt-10">
        <div className="grid grid-cols-[0.42fr_1fr] items-end gap-12 border-t border-hairline pt-12 tablet:grid-cols-1 tablet:gap-8 mobile:pt-9">
          <EditorialImage
            asset={editorialMedia.hillsFreeway}
            sizes="(max-width: 1024px) 60vw, 30vw"
            className="h-[520px] tablet:h-[380px] mobile:h-[320px]"
          />
          <p className="max-w-[32ch] pb-2 font-serif text-[27px] leading-[1.25] text-espresso tablet:max-w-none tablet:pb-0 tablet:text-[24px] mobile:text-[21px]">
            {laActuallyPage.mediaCounterpoint}
          </p>
        </div>
      </section>

      <section aria-label="Where to go next" className="wrap pt-12 mobile:pt-8">
        <div className="flex flex-col items-start gap-8 rounded-block bg-sage-field px-12 py-14 mobile:rounded-[16px] mobile:px-6 mobile:py-9">
          <div className="flex flex-wrap gap-[10px]">
            <CtaLink href={laActuallyPage.ctas[0].href} variant="primary">
              {laActuallyPage.ctas[0].label}
            </CtaLink>
            <CtaLink href={laActuallyPage.ctas[1].href} variant="secondary">
              {laActuallyPage.ctas[1].label}
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  )
}
