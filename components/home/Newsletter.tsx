import { CtaLink } from '@/components/ui/CtaLink'
import { substackSubscribeUrl } from '@/lib/config'
import { newsletter } from '@/lib/content/home'

/**
 * Overthinking Real Estate is published on Substack, so subscribing happens
 * there. There is no email field here: a form that cannot submit is fake
 * functionality. The block keeps its approved composition — the mixed-typeface
 * headline on the left, the paper panel on the right — with a truthful,
 * clearly external action inside the panel.
 */
export function Newsletter() {
  return (
    <section aria-labelledby="newsletter" className="wrap">
      <div className="grid grid-cols-[1.1fr_1fr] items-end gap-[46px] border-t border-hairline pt-11 tablet:grid-cols-1 tablet:gap-6">
        {/* The mixed-typeface headline is intentional. Keep it. */}
        <h2
          id="newsletter"
          className="font-mark text-[44px] font-semibold leading-[0.98] tracking-display text-espresso tablet:text-[36px] mobile:text-[28px]"
        >
          {newsletter.headlineMark}{' '}
          <span className="font-serif font-normal tracking-[-0.01em] text-wine">
            {newsletter.headlineSerif}
          </span>
        </h2>

        <div className="flex flex-col gap-4 rounded-field border border-sand bg-paper px-[22px] py-6">
          {substackSubscribeUrl ? (
            <>
              <p className="font-sans text-[16px] leading-[1.5] text-warmgray">{newsletter.body}</p>
              <CtaLink
                href={substackSubscribeUrl}
                external
                variant="primary"
                className="self-start bg-wine hover:bg-wine-pressed"
              >
                {newsletter.cta}
                <span className="sr-only"> (opens on Substack)</span>
              </CtaLink>
            </>
          ) : (
            <p className="font-sans text-[16px] leading-[1.5] text-warmgray">{newsletter.pending}</p>
          )}
        </div>
      </div>
    </section>
  )
}
