import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { overthinking } from '@/lib/content/home'
import { getEssays, type EssayEntry } from '@/lib/essays'

/**
 * Overthinking Real Estate as a publication front, not a blog module: a
 * masthead column, a lead story, and supporting stories that each carry their
 * real Substack cover image.
 *
 * Every title, dek, date and image comes from the feed or Danielle's curated
 * list. Nothing here is invented to fill the composition — a story without a
 * dek or a cover simply shows neither.
 */
function EssayLink({
  entry,
  className,
  children,
}: {
  entry: EssayEntry
  className: string
  children: React.ReactNode
}) {
  if (entry.slug) {
    return (
      <Link href={`/read/${entry.slug}`} className={className}>
        {children}
      </Link>
    )
  }

  if (!entry.substackUrl) return <span className={className}>{children}</span>

  return (
    <a href={entry.substackUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens on Substack)</span>
    </a>
  )
}

export async function Overthinking() {
  const { lead, more } = await getEssays()
  if (!lead) return null

  const supporting = more.slice(0, 3)

  return (
    <section aria-labelledby="overthinking" className="wrap pt-[88px] mobile:pt-16">
      <div className="grid grid-cols-[0.8fr_1.25fr_0.95fr] items-start gap-12 tablet:grid-cols-2 tablet:gap-10 mobile:grid-cols-1 mobile:gap-9">
        {/* Masthead */}
        <div className="min-w-0 tablet:col-span-2 mobile:col-span-1">
          <p className="eyebrow text-sage-olive">{overthinking.eyebrow}</p>
          <h2
            id="overthinking"
            className="mt-4 font-serif text-[52px] leading-[0.98] text-wine tablet:text-[46px] mobile:text-[34px]"
          >
            {overthinking.title}
          </h2>
          <p className="mt-6 max-w-[38ch] font-sans text-[16px] leading-[1.6] text-warmgray">
            {overthinking.dek}
          </p>
          <Link href="/read" className="more-link mt-7 inline-flex">
            {overthinking.moreLabel} <span aria-hidden="true">&nbsp;&rarr;</span>
          </Link>
        </div>

        {/* Lead story */}
        <article className="min-w-0">
          <p className="eyebrow tracking-label">{overthinking.leadLabel}</p>
          <EssayLink entry={lead} className="group mt-4 block">
            {lead.imageUrl ? (
              <ImageSlot
                image={{ label: '[ADD ESSAY IMAGE]', alt: lead.title, src: lead.imageUrl }}
                sizes="(max-width: 640px) 100vw, 40vw"
                className="h-[300px] rounded-block mobile:h-[240px]"
              />
            ) : null}
            <h3 className="mt-6 font-serif text-[34px] leading-[1.08] text-espresso group-hover:text-wine mobile:text-[27px]">
              {lead.title}
            </h3>
            {lead.dek ? (
              <p className="mt-3 font-sans text-[16px] leading-[1.55] text-warmgray">{lead.dek}</p>
            ) : null}
          </EssayLink>
        </article>

        {/* Supporting stories */}
        <ul className="min-w-0 border-t border-hairline">
          {supporting.map((entry) => (
            <li key={entry.title} className="min-w-0 border-b border-hairline">
              <EssayLink entry={entry} className="group flex min-w-0 gap-5 py-6">
                {/*
                  ImageSlot is always w-full, so the size lives on a wrapper
                  rather than fighting it. 12px corners: soft, per the editorial
                  photography rule, but not the 20px block radius, which at this
                  scale reads as a bubble rather than a photograph.

                  A story with no cover in the feed stays text-only. Nothing is
                  substituted to even out the column.
                */}
                {entry.imageUrl ? (
                  <div className="h-[104px] w-[86px] shrink-0">
                    <ImageSlot
                      image={{ label: '[ADD ESSAY IMAGE]', alt: entry.title, src: entry.imageUrl }}
                      sizes="120px"
                      className="h-full rounded-[12px]"
                    />
                  </div>
                ) : null}

                <div className="flex min-w-0 flex-col">
                  <h3 className="font-serif text-[22px] leading-[1.14] text-espresso group-hover:text-wine">
                    {entry.title}
                  </h3>
                  {/* Dates come from the feed or not at all. */}
                  {entry.publishedAt ? (
                    <time
                      dateTime={new Date(entry.publishedAt).toISOString()}
                      className="mt-2 font-sans text-[13px] text-taupe"
                    >
                      {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  ) : null}
                  <span className="mt-auto pt-3 font-sans text-[13.5px] font-medium text-sage-olive">
                    {overthinking.readCta} <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </EssayLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
