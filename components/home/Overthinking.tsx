import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { overthinking } from '@/lib/content/home'
import { getEssays, type EssayEntry } from '@/lib/essays'

/**
 * Overthinking Real Estate, composed as a magazine spread.
 *
 * A full-width masthead, then a deliberately unequal spread: one dominant lead
 * story with a tall image, and supporting stories at descending scale — the
 * first with a wide image of its own, the rest as text with small crops. No
 * equal-width card grid, no rounded card per story, no news template.
 *
 * Every title, date and image comes from the Substack feed or Danielle's
 * curated deks. Nothing is invented to balance the composition: a story with
 * no cover stays text-only and a story with no dek shows none.
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

function PublishedAt({ value, className }: { value: string | null; className: string }) {
  if (!value) return null

  return (
    <time dateTime={new Date(value).toISOString()} className={className}>
      {new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    </time>
  )
}

export async function Overthinking() {
  const { lead, more } = await getEssays()
  if (!lead) return null

  const [second, ...rest] = more
  const tail = rest.slice(0, 2)

  return (
    <section aria-labelledby="overthinking" className="wrap pt-[88px] mobile:pt-16">
      {/* Masthead */}
      <div className="border-b border-espresso pb-8">
        <p className="eyebrow text-sage-olive">{overthinking.eyebrow}</p>
        <div className="mt-5 flex items-end justify-between gap-12 tablet:flex-col tablet:items-start tablet:gap-6">
          <h2
            id="overthinking"
            className="max-w-[11ch] font-serif text-[92px] leading-[0.9] text-wine tablet:max-w-none tablet:text-[62px] mobile:text-[40px]"
          >
            {overthinking.title}
          </h2>
          <div className="max-w-[46ch] shrink-0 pb-2 tablet:pb-0">
            <p className="font-sans text-[15.5px] leading-[1.6] text-warmgray">{overthinking.dek}</p>
            <Link href="/read" className="more-link mt-5 inline-flex">
              {overthinking.moreLabel} <span aria-hidden="true">&nbsp;&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* The spread: one dominant story, then descending scale. */}
      <div className="mt-12 grid grid-cols-[1.45fr_1fr] gap-14 tablet:grid-cols-1 tablet:gap-12">
        <article className="min-w-0">
          <EssayLink entry={lead} className="group block">
            {lead.imageUrl ? (
              <ImageSlot
                image={{ label: '[ADD ESSAY IMAGE]', alt: lead.title, src: lead.imageUrl }}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-[520px] rounded-block tablet:h-[420px] mobile:h-[280px]"
              />
            ) : null}
            <p className="eyebrow mt-7 tracking-label">{overthinking.leadLabel}</p>
            <h3 className="mt-4 max-w-[18ch] font-serif text-[46px] leading-[1.02] text-espresso group-hover:text-wine tablet:text-[38px] mobile:text-[28px]">
              {lead.title}
            </h3>
            {lead.dek ? (
              <p className="mt-5 max-w-[52ch] font-sans text-[17px] leading-[1.6] text-warmgray">
                {lead.dek}
              </p>
            ) : null}
            <PublishedAt value={lead.publishedAt} className="mt-5 block font-sans text-[13px] text-taupe" />
          </EssayLink>
        </article>

        <div className="min-w-0">
          {/* Second story keeps an image, at a smaller scale than the lead. */}
          {second ? (
            <article className="min-w-0 border-b border-hairline pb-9">
              <EssayLink entry={second} className="group block">
                {second.imageUrl ? (
                  <ImageSlot
                    image={{ label: '[ADD ESSAY IMAGE]', alt: second.title, src: second.imageUrl }}
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="h-[240px] rounded-block mobile:h-[170px]"
                  />
                ) : null}
                <h3 className="mt-6 font-serif text-[28px] leading-[1.1] text-espresso group-hover:text-wine mobile:text-[24px]">
                  {second.title}
                </h3>
                {second.dek ? (
                  <p className="mt-3 font-sans text-[15.5px] leading-[1.55] text-warmgray">
                    {second.dek}
                  </p>
                ) : null}
                <PublishedAt
                  value={second.publishedAt}
                  className="mt-4 block font-sans text-[13px] text-taupe"
                />
              </EssayLink>
            </article>
          ) : null}

          {/* The tail runs as text with a small crop — smallest scale. */}
          <ul className="min-w-0">
            {tail.map((entry) => (
              <li key={entry.title} className="min-w-0 border-b border-hairline">
                <EssayLink entry={entry} className="group flex min-w-0 items-start gap-5 py-7">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[21px] leading-[1.14] text-espresso group-hover:text-wine">
                      {entry.title}
                    </h3>
                    <PublishedAt
                      value={entry.publishedAt}
                      className="mt-2 block font-sans text-[13px] text-taupe"
                    />
                  </div>
                  {/*
                    ImageSlot is always w-full, so the size lives on a wrapper.
                    12px corners: soft per the editorial rule, but not the 20px
                    block radius, which at this scale reads as a bubble.
                  */}
                  {entry.imageUrl ? (
                    <div className="h-[76px] w-[76px] shrink-0">
                      <ImageSlot
                        image={{ label: '[ADD ESSAY IMAGE]', alt: entry.title, src: entry.imageUrl }}
                        sizes="90px"
                        className="h-full rounded-[12px]"
                      />
                    </div>
                  ) : null}
                </EssayLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
