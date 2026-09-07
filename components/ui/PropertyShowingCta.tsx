import { CtaLink } from '@/components/ui/CtaLink'
import { showingHref } from '@/lib/contact/intent'
import { showingInquiry } from '@/lib/content/contact'

/**
 * The reusable "send me a house" handoff.
 *
 * Built to be dropped into an LA, Actually guide, a search page, or listing
 * editorial — but deliberately not placed anywhere yet. Adding it to a page is
 * a decision about that page, not a side effect of this component existing.
 *
 * `area` is optional and only carries through to the form's Area field; it
 * does not filter anything and does not claim to.
 */
export function PropertyShowingCta({
  area,
  className = '',
  /**
   * Drops the framing paragraph and renders the action alone. For a second
   * placement on the same page, where repeating the same sentence would read
   * as a lead funnel rather than an offer.
   */
  compact = false,
}: {
  area?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div className={`flex flex-col items-start gap-5 ${className}`}>
      {compact ? null : (
        <p className="max-w-measure font-sans text-[17px] leading-[1.6] text-warmgray mobile:text-[16px]">
          {showingInquiry.intro}
        </p>
      )}
      <CtaLink href={showingHref(area)} variant="primary">
        {showingInquiry.heading}
      </CtaLink>
    </div>
  )
}
