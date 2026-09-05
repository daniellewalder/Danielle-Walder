import { substackSubscribeUrl } from '@/lib/config'
import { subscribe } from '@/lib/content/home'

/**
 * The subscription point for Overthinking Real Estate — the same publication
 * as the editorial section above, not a second newsletter.
 *
 * Subscribing happens on Substack, so this is a real external link and not a
 * form. Do not add an email field here: one that cannot submit is exactly the
 * fake functionality this site refuses to ship.
 *
 * The heading keeps the handoff's mixed-typeface treatment, now carrying the
 * publication's own name in its own typeface.
 */
export function Subscribe() {
  return (
    <section aria-labelledby="subscribe" className="wrap pt-[88px] mobile:pt-16">
      <div className="grid grid-cols-[1.15fr_0.85fr] items-end gap-14 border-t border-hairline pt-12 tablet:grid-cols-1 tablet:gap-7">
        <h2
          id="subscribe"
          className="max-w-[19ch] font-mark text-[44px] font-semibold leading-[1.04] tracking-display text-espresso tablet:text-[38px] mobile:text-[28px]"
        >
          {subscribe.headingBefore}{' '}
          <span className="font-serif font-normal tracking-[-0.01em] text-wine">
            {subscribe.headingPublication}
          </span>{' '}
          {subscribe.headingAfter}
        </h2>

        <div className="flex flex-col items-start gap-6">
          <p className="max-w-measure font-sans text-[16.5px] leading-[1.6] text-warmgray">
            {subscribe.body}
          </p>

          {substackSubscribeUrl ? (
            <a
              href={substackSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-button bg-wine px-[26px] py-[14px] font-sans text-[15px] font-semibold text-cream hover:bg-wine-pressed"
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
