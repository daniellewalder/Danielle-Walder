import { ItineraryStopBlock } from '@/components/areas/ItineraryStop'
import { EditorialImage } from '@/components/media/EditorialImage'
import { EditorialVideo } from '@/components/media/EditorialVideo'
import { PropertyShowingCta } from '@/components/ui/PropertyShowingCta'
import type { AreaGuide } from '@/lib/areas'
import { itinerary } from '@/lib/content/areas'
import { editorialMedia } from '@/lib/content/editorialMedia'

/**
 * The test-drive: the whole day, rendered.
 *
 * Composed as a field guide rather than a magazine spread, because the reader
 * may well be holding a phone in an unfamiliar area while using it. Times and
 * titles are scannable, the route summary is a single list, and the heaviest
 * typographic moment on the page is still the page title above it.
 *
 * Every module below the route is optional. A guide with stops and nothing
 * else renders stops and nothing else.
 */
function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="font-display text-[26px] leading-[1.15] text-espresso mobile:text-[22px]"
    >
      {children}
    </h2>
  )
}

export function AreaGuideRoute({ guide, areaName }: { guide: AreaGuide; areaName: string }) {
  const hero = guide.heroMedia
    ? editorialMedia[guide.heroMedia.asset as keyof typeof editorialMedia]
    : null

  return (
    <>
      {/* Opening: the headline is the area's own, never a global template. */}
      <section aria-labelledby="test-drive" className="wrap pt-11 mobile:pt-8">
        <div className="border-t border-hairline pt-9 mobile:pt-7">
          <h2
            id="test-drive"
            className="max-w-[24ch] font-display text-[30px] leading-[1.16] text-espresso mobile:text-[24px]"
          >
            {guide.headline}
          </h2>
          <p className="mt-5 max-w-measure font-sans text-[17px] leading-[1.6] text-warmgray mobile:text-[16px]">
            {guide.intro.body}
          </p>
        </div>
      </section>

      {hero ? (
        <section aria-label={hero.alt} className="wrap pt-9 mobile:pt-7">
          {hero.kind === 'video' ? (
            <EditorialVideo asset={hero} sizes="100vw" className="h-[380px] mobile:h-[230px]" />
          ) : (
            <EditorialImage asset={hero} sizes="100vw" className="h-[380px] mobile:h-[230px]" />
          )}
        </section>
      ) : null}

      {/* The thesis. What the day is designed to make clear. */}
      <section aria-labelledby="point-of-day" className="wrap pt-11 mobile:pt-8">
        <div className="border-t border-hairline pt-9 mobile:pt-7">
          <SectionHeading id="point-of-day">{itinerary.pointHeading}</SectionHeading>
          <p className="mt-5 max-w-measure font-sans text-[17px] leading-[1.6] text-warmgray mobile:text-[16px]">
            {guide.pointOfTheDay.body}
          </p>
        </div>
      </section>

      {/* The route at a glance: the whole day in one scannable list. */}
      <section aria-labelledby="route-glance" className="wrap pt-11 mobile:pt-8">
        <div className="border-t border-hairline pt-9 mobile:pt-7">
          <SectionHeading id="route-glance">{itinerary.routeHeading}</SectionHeading>

          <ol className="mt-6 flex flex-col">
            {guide.stops.map((stop) => (
              <li
                key={stop.id}
                className="grid grid-cols-[80px_1fr] items-baseline gap-4 border-b border-hairline py-[13px] mobile:grid-cols-[64px_1fr] mobile:gap-3"
              >
                <span className="font-sans text-[14px] font-semibold tabular-nums text-taupe">
                  {stop.time ?? ''}
                </span>
                <a
                  href={`#${stop.id}`}
                  className="font-sans text-[16px] leading-[1.4] text-espresso hover:text-wine mobile:text-[15.5px]"
                >
                  {stop.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The day itself. */}
      <section aria-label="The route" className="wrap pt-11 mobile:pt-8">
        {guide.stops.map((stop) => (
          <div key={stop.id} id={stop.id} className="scroll-mt-8">
            <ItineraryStopBlock stop={stop} />

            {/*
              The single contextual showing handoff, placed after the stop the
              guide names — usually the one where the public route ends. The
              closing handoff is separate; between them that is two on the page,
              not one after every stop.
            */}
            {guide.showingCtaAfterStopId === stop.id ? (
              <div className="border-t border-hairline py-9 mobile:py-7">
                <PropertyShowingCta area={areaName} />
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {/*
        "Pretend you bought the house." The reader tests the geography against
        priorities they pick themselves — this module never assumes anything
        about who they are or who lives anywhere.
      */}
      {guide.normalLifeTest ? (
        <section aria-labelledby="normal-life" className="wrap pt-12 mobile:pt-9">
          <div className="rounded-block bg-blue-field px-10 py-10 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
            <h2
              id="normal-life"
              className="font-display text-[26px] leading-[1.15] text-blue-ink mobile:text-[22px]"
            >
              {itinerary.normalLifeHeading}
            </h2>
            <p className="mt-4 max-w-measure font-sans text-[17px] leading-[1.6] text-blue-deep mobile:text-[16px]">
              {guide.normalLifeTest.intro.body}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {guide.normalLifeTest.prompts.map((prompt) => (
                <li
                  key={prompt}
                  className="border-l-2 border-blue-steel pl-4 font-sans text-[16px] leading-[1.55] text-blue-ink mobile:text-[15.5px]"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Closing questions, written for this area. */}
      {guide.beforeYouLeave ? (
        <section aria-labelledby="before-you-leave" className="wrap pt-12 mobile:pt-9">
          <div className="border-t border-hairline pt-9 mobile:pt-7">
            <SectionHeading id="before-you-leave">
              {itinerary.beforeYouLeaveHeading}
            </SectionHeading>
            {guide.beforeYouLeave.intro ? (
              <p className="mt-4 max-w-measure font-sans text-[16.5px] leading-[1.6] text-warmgray">
                {guide.beforeYouLeave.intro.body}
              </p>
            ) : null}
            <ul className="mt-6 flex flex-col">
              {guide.beforeYouLeave.questions.map((question) => (
                <li
                  key={question}
                  className="border-b border-hairline py-[15px] font-sans text-[16.5px] leading-[1.5] text-espresso mobile:text-[16px]"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  )
}
