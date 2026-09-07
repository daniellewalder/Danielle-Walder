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
export function PropertyShowingCta({ area, className = '' }: { area?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-5 ${className}`}>
      <p className="max-w-measure font-sans text-[18px] leading-[1.55] text-warmgray mobile:text-[17px]">
        {showingInquiry.intro}
      </p>
      <CtaLink href={showingHref(area)} variant="primary">
        {showingInquiry.heading}
      </CtaLink>
    </div>
  )
}
