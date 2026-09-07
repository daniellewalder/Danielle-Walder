import { EditorialImage } from '@/components/media/EditorialImage'
import { EditorialVideo } from '@/components/media/EditorialVideo'
import type { ItineraryStop as Stop } from '@/lib/areas'
import { editorialMedia } from '@/lib/content/editorialMedia'
import { accessLabels, itinerary, stopKindLabels } from '@/lib/content/areas'

/**
 * One stop, or one drive, on the day.
 *
 * Built for someone reading it on a phone while actually moving through an
 * area, so it is a compact scannable block rather than an editorial spread:
 * time and kind on one utility line, a 20-24px title, then short labelled
 * paragraphs. A stop reads as important through structure and rules, not
 * through 40px type.
 *
 * A drive is visually distinct by structure — a labelled from/to/roads block
 * on its own field — not by being louder.
 *
 * Every field below the title is optional and renders nothing when absent.
 */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-kicker text-taupe">{children}</p>
  )
}

function Block({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <Label>{heading}</Label>
      <p className="font-sans text-[16px] leading-[1.6] text-warmgray mobile:text-[15.5px]">
        {body}
      </p>
    </div>
  )
}

function StopMediaFrame({ stop }: { stop: Stop }) {
  if (!stop.media) return null

  const asset = editorialMedia[stop.media.asset as keyof typeof editorialMedia]
  if (!asset) return null

  const frame = 'h-[260px] rounded-block mobile:h-[210px]'
  const sizes = '(max-width: 1024px) 100vw, 46vw'

  return asset.kind === 'video' ? (
    <EditorialVideo asset={asset} sizes={sizes} className={frame} />
  ) : (
    <EditorialImage asset={asset} sizes={sizes} className={frame} />
  )
}

export function ItineraryStopBlock({ stop }: { stop: Stop }) {
  const accessLabel = accessLabels[stop.access]

  return (
    <article className="border-t border-hairline py-9 mobile:py-7">
      {/* Utility line: time and kind, scannable at a glance. */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {stop.time ? (
          <span className="font-sans text-[15px] font-semibold tabular-nums text-espresso">
            {stop.time}
          </span>
        ) : null}
        <Label>{stopKindLabels[stop.kind]}</Label>
      </div>

      <h3 className="mt-3 max-w-[26ch] font-display text-[23px] leading-[1.2] text-espresso mobile:text-[21px]">
        {stop.title}
      </h3>

      {stop.location ? (
        <p className="mt-2 font-sans text-[15px] leading-[1.5] text-taupe">{stop.location}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-[1fr_0.72fr] items-start gap-10 tablet:grid-cols-1 tablet:gap-7">
        <div className="flex min-w-0 flex-col gap-5">
          {/* A drive's content is the transition, so it gets its own field. */}
          {stop.drive ? (
            <dl className="rounded-field border border-hairline bg-paper px-5 py-5 mobile:px-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <Label>{itinerary.driveFrom}</Label>
                    <dd className="mt-1 font-sans text-[15.5px] text-espresso">
                      {stop.drive.from}
                    </dd>
                  </div>
                  <div>
                    <Label>{itinerary.driveTo}</Label>
                    <dd className="mt-1 font-sans text-[15.5px] text-espresso">{stop.drive.to}</dd>
                  </div>
                </div>

                {stop.drive.roads.length > 0 ? (
                  <div>
                    <Label>{itinerary.driveRoads}</Label>
                    <dd className="mt-1 font-sans text-[15.5px] leading-[1.5] text-espresso">
                      {stop.drive.roads.join(' · ')}
                    </dd>
                  </div>
                ) : null}

                <div>
                  <Label>{itinerary.driveChanges}</Label>
                  <dd className="mt-1 font-sans text-[15.5px] leading-[1.6] text-warmgray">
                    {stop.drive.whatChanges}
                  </dd>
                </div>
              </div>
            </dl>
          ) : null}

          {stop.whySentHere ? (
            <Block heading={itinerary.whyHeading} body={stop.whySentHere.body} />
          ) : null}
          {stop.whatThisTeaches ? (
            <Block heading={itinerary.teachesHeading} body={stop.whatThisTeaches.body} />
          ) : null}

          {stop.whatToNotice.length > 0 ? (
            <div className="flex flex-col gap-[6px]">
              <Label>{itinerary.noticeHeading}</Label>
              <ul className="flex flex-col gap-2">
                {stop.whatToNotice.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-sage-mid pl-4 font-sans text-[16px] leading-[1.55] text-espresso mobile:text-[15.5px]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/*
            The guard against over-reading one stop. Quiet, but present where a
            reader would otherwise generalise from a single street.
          */}
          {stop.whatNotToConclude ? (
            <div className="flex flex-col gap-[6px] border-t border-hairline pt-4">
              <Label>{itinerary.cautionHeading}</Label>
              <p className="font-sans text-[15.5px] leading-[1.6] text-warmgray">
                {stop.whatNotToConclude.body}
              </p>
            </div>
          ) : null}

          {/*
            Gated and private context. States where the public route ends. It
            never suggests entering private property and never claims Danielle
            can get anyone in.
          */}
          {accessLabel ? (
            <div className="rounded-field bg-butter-pale px-5 py-4 mobile:px-4">
              <p className="text-[11px] font-bold uppercase tracking-kicker text-butter-text">
                {accessLabel}
              </p>
              {stop.accessNote ? (
                <p className="mt-2 font-sans text-[15.5px] leading-[1.6] text-butter-text">
                  {stop.accessNote.body}
                </p>
              ) : null}
            </div>
          ) : null}

          {stop.howLong ? (
            <p className="font-sans text-[14px] text-taupe">{stop.howLong}</p>
          ) : null}
        </div>

        <StopMediaFrame stop={stop} />
      </div>
    </article>
  )
}
