import { EditorialVideo } from '@/components/media/EditorialVideo'
import { editorialMedia } from '@/lib/content/editorialMedia'
import { laActuallyPage } from '@/lib/content/pages'

/**
 * The LA, Actually opening.
 *
 * The footage is the page's first argument, not decoration under a headline:
 * a wide aerial of coast, houses, a highway and the hills behind them, with
 * the copy set into its lower left. Full-bleed, no cream block above it, and
 * the h1 lives here rather than in a PageHeader.
 *
 * OVERLAY. One flat espresso wash, no gradient, no shadow, no blur. Its
 * opacity is measured rather than chosen: this clip is bright — sky, sand and
 * open water — and cream type over the untreated frame sits at about 2.4:1.
 * At the value used here the eyebrow, headline and intro all clear 4.5:1
 * against the brightest tenth of the pixels behind them, at every crop this
 * hero ships. Lowering it is a readability regression, not a style tweak; if
 * it ever moves, re-measure the composite rather than eyeballing it.
 *
 * CROP. The container is wider than the 16:9 source at every desktop height,
 * so the frame is cut top and bottom there and only the vertical position
 * matters. `38%` holds the mountains and the far coastline — the geography the
 * page is about — above the copy instead of letting them slide out of frame.
 * On a phone the crop turns hard horizontal, and `78%` puts the houses, the
 * highway and the bluff behind the text rather than centring on open sand,
 * which is what the measured contrast asked for: centred needs 64-65% of
 * overlay to clear AA, this crop needs 57-59%. It costs the ocean on a phone.
 * (Tablet widths crop horizontally too, but the beach runs diagonally across
 * the whole frame there, so shifting it sideways buys nothing.)
 *
 * The poster carries the meaning and the alt text; the video is aria-hidden,
 * muted, looping and inline, and a reader on reduced motion or a slow
 * connection gets the still with this exact composition over it.
 */
export function LaActuallyHero() {
  return (
    <section aria-labelledby="la-actually-title" className="relative pt-6 mobile:pt-4">
      <EditorialVideo
        asset={editorialMedia.coastalAerial}
        sizes="100vw"
        priority
        rounded="rounded-none"
        className="h-[clamp(460px,70vh,720px)] tablet:h-[clamp(460px,64vh,700px)] mobile:h-[clamp(430px,76svh,620px)]"
        mediaClassName="object-[50%_38%] mobile:object-[78%_42%]"
      />

      {/* One flat wash. See the note above before changing this number. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-6 bg-espresso/65 mobile:top-4"
      />

      <div className="wrap pointer-events-none absolute inset-x-0 bottom-0 flex justify-start pb-[72px] tablet:pb-14 mobile:pb-10">
        <div className="pointer-events-auto max-w-[600px] tablet:max-w-[520px] mobile:max-w-none">
          <p className="font-sans text-[11.5px] font-bold uppercase tracking-attribution text-onbrown">
            {laActuallyPage.eyebrow}
          </p>

          <h1
            id="la-actually-title"
            className="mt-4 font-display text-section leading-none text-onbrown tablet:mt-3 tablet:text-section-tablet mobile:text-section-mobile"
          >
            {laActuallyPage.heading}
          </h1>

          <p className="mt-5 max-w-[500px] font-sans text-[18px] leading-[1.5] text-onbrown tablet:mt-4 mobile:max-w-none mobile:text-[17px]">
            {laActuallyPage.intro}
          </p>
        </div>
      </div>
    </section>
  )
}
