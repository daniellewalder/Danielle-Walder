import { substackSubscribeUrl } from '@/lib/config'
import { subscribe } from '@/lib/content/home'

/**
 * The closing beat of Overthinking Real Estate — the same publication as the
 * editorial section above, not a second newsletter.
 *
 * It deliberately rhymes with that section's masthead: the same espresso rule,
 * the same publication name in Kalnia wine at display scale, one step smaller
 * so the masthead stays the louder of the two. The section opens the
 * publication; this one signs it off.
 *
 * Subscribing happens on Substack, so this is a real external link and not a
 * form. Do not add an email field here: one that cannot submit is exactly the
 * fake functionality this site refuses to ship.
 */
export function Subscribe() {
  return (
    <section aria-labelledby="subscribe" className="wrap pt-[104px] mobile:pt-16">
      <div className="border-t border-espresso pt-10 mobile:pt-8">
        {/*
          One sentence set as three lines so the publication's name carries the
          scale. The words are Danielle's, unchanged — only their typography
          changes across the lockup.
        */}
        <h2
          id="subscribe"
          className="font-mark text-[30px] font-semibold leading-[1.05] tracking-display text-espresso tablet:text-[24px] mobile:text-[19px]"
        >
          <span className="block">{subscribe.headingBefore}</span>
          <span className="mt-3 block font-serif text-[68px] font-normal leading-[0.94] tracking-[-0.01em] text-wine tablet:mt-2 tablet:text-[46px] mobile:text-[30px]">
            {subscribe.headingPublication}
          </span>
          <span className="mt-3 block tablet:mt-2">{subscribe.headingAfter}</span>
        </h2>

        <div className="mt-14 flex items-end justify-between gap-14 border-t border-hairline pt-8 tablet:mt-10 tablet:flex-col tablet:items-start tablet:gap-7">
          <p className="max-w-[54ch] font-sans text-[16.5px] leading-[1.6] text-warmgray">
            {subscribe.body}
          </p>

          {substackSubscribeUrl ? (
            <a
              href={substackSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center rounded-button bg-wine px-[26px] py-[14px] font-sans text-[15px] font-semibold text-cream hover:bg-wine-pressed"
            >
              {subscribe.cta}
              <span aria-hidden="true" className="ml-2">
                &rarr;
              </span>
              <span className="sr-only"> (opens on Substack)</span>
            </a>
          ) : (
            <p className="max-w-measure font-sans text-[15px] leading-[1.6] text-taupe">
              {subscribe.pending}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
