import { CtaLink } from '@/components/ui/CtaLink'
import type { Area } from '@/lib/areas'
import { areaGuide } from '@/lib/content/areas'

/**
 * The home-search handoff for an area.
 *
 * The rule this component exists to enforce: A BUTTON THAT NAMES AN AREA MUST
 * LAND ON THAT AREA'S RESULTS.
 *
 * "Search homes in Calabasas" pointing at the ordinary unfiltered search page
 * was a promise the site could not keep, and the reader would find that out
 * one click later. So the area is only named when `homeSearch` holds a real
 * RealScout Search Link — a shareable saved search generated from Danielle's
 * account, carrying her attribution. Without one, the label drops to a plain
 * "Search homes" and goes to the general tool, which is exactly what it is.
 *
 * A RealScout Search Link leaves this site, so it opens in a new tab and
 * daniellewalder.com stays open behind it. The generic search is on-site and
 * does not.
 */
export function AreaSearchCta({ area }: { area: Area }) {
  if (area.homeSearch) {
    return (
      <CtaLink href={area.homeSearch.url} variant="primary" external>
        {areaGuide.areaSearchPrefix} {area.name} {areaGuide.areaSearchSuffix}
      </CtaLink>
    )
  }

  return (
    <CtaLink href={areaGuide.searchHref} variant="primary">
      {areaGuide.genericSearchLabel}
    </CtaLink>
  )
}
