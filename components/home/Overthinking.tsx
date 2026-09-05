import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { essayList, leadEssay } from '@/lib/content/home'
import { overthinkingLink } from '@/lib/content/site'

/**
 * Overthinking Real Estate is a pillar, not a blog link: Kalnia, wine, and its
 * own homepage section. Title case only here and on the section landing page —
 * everywhere else the wordmark is lowercase, because it reads as a voice.
 */
export function Overthinking() {
  return (
    <section aria-labelledby="overthinking" className="wrap pt-[88px]">
      <div className="section-head">
        <div className="flex flex-col gap-[6px]">
          <span className="eyebrow text-sage-olive">the reading part</span>
          <h2
            id="overthinking"
            className="font-serif text-section leading-none text-wine tablet:text-section-tablet mobile:text-section-mobile"
          >
            Overthinking Real Estate
          </h2>
        </div>
        <Link href={overthinkingLink.href} className="more-link whitespace-nowrap">
          read everything &rarr;
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-[1.4fr_1fr] items-start gap-11 tablet:grid-cols-1 tablet:gap-7">
        <article className="min-w-0">
          {/* The lead essay is one link, the way a listing card is. */}
          <Link
            href={`${overthinkingLink.href}/${leadEssay.slug}`}
            className="group flex flex-col gap-4"
          >
            {leadEssay.image ? (
              <ImageSlot
                image={leadEssay.image}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-[340px] rounded-block"
              />
            ) : null}
            <h3 className="font-serif text-[46px] leading-[1.02] text-espresso group-hover:text-wine tablet:text-[38px] mobile:text-[30px]">
              {leadEssay.title}
            </h3>
            <p className="max-w-standfirst font-sans text-[16.5px] leading-[1.5] text-warmgray">
              {leadEssay.standfirst}
            </p>
          </Link>
        </article>

        <div className="min-w-0">
          {essayList.map((essay, index) => (
            <article
              key={essay.slug}
              className={`flex flex-col gap-[10px] border-t border-hairline py-[22px] ${
                index === essayList.length - 1 ? 'border-b' : ''
              }`}
            >
              <h3 className="font-serif text-[27px] leading-[1.12] text-espresso mobile:text-[22px]">
                <Link
                  href={`${overthinkingLink.href}/${essay.slug}`}
                  className="hover:text-wine"
                >
                  {essay.title}
                </Link>
              </h3>
              <span className="text-[12.5px] font-bold uppercase tracking-kicker text-taupe">
                {essay.kicker}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
