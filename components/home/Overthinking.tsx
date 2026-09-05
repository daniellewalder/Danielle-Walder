import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { overthinking } from '@/lib/content/home'
import { getEssays, type EssayEntry } from '@/lib/essays'

/**
 * Overthinking Real Estate is a pillar, not a blog link: Kalnia, wine, and its
 * own homepage section. Titles and deks come from Danielle's curated list, and
 * links open on Substack. An entry with nowhere real to go renders as plain
 * text rather than a broken link.
 */
function EssayTitle({ entry, className }: { entry: EssayEntry; className: string }) {
  if (!entry.url) return <span className={className}>{entry.title}</span>

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:text-wine`}
    >
      {entry.title}
      <span className="sr-only"> (opens on Substack)</span>
    </a>
  )
}

export async function Overthinking() {
  const { lead, more } = await getEssays()
  if (!lead) return null

  const rest = more.slice(0, 3)

  return (
    <section aria-labelledby="overthinking" className="wrap pt-[88px] mobile:pt-16">
      <div className="section-head">
        <div className="flex flex-col gap-[6px]">
          <span className="eyebrow text-sage-olive">{overthinking.eyebrow}</span>
          <h2
            id="overthinking"
            className="font-serif text-section leading-none text-wine tablet:text-section-tablet mobile:text-section-mobile"
          >
            {overthinking.title}
          </h2>
        </div>
        <Link href="/read" className="more-link whitespace-nowrap">
          {overthinking.moreLabel} &rarr;
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-[1.4fr_1fr] items-start gap-11 tablet:grid-cols-1 tablet:gap-7">
        <article className="flex min-w-0 flex-col gap-4">
          <ImageSlot
            image={{ label: '[ADD ESSAY IMAGE]', alt: lead.title, src: null }}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="h-[340px] rounded-block"
          />
          <h3 className="font-serif text-[46px] leading-[1.02] text-espresso tablet:text-[38px] mobile:text-[30px]">
            <EssayTitle entry={lead} className="text-espresso" />
          </h3>
          <p className="max-w-standfirst font-sans text-[16.5px] leading-[1.5] text-warmgray">
            {lead.dek}
          </p>
        </article>

        <div className="min-w-0">
          {rest.map((entry, index) => (
            <article
              key={entry.title}
              className={`flex flex-col gap-[10px] border-t border-hairline py-[22px] ${
                index === rest.length - 1 ? 'border-b' : ''
              }`}
            >
              <h3 className="font-serif text-[27px] leading-[1.12] text-espresso mobile:text-[22px]">
                <EssayTitle entry={entry} className="text-espresso" />
              </h3>
              <span className="text-[12.5px] font-bold uppercase tracking-kicker text-taupe">
                essay
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
