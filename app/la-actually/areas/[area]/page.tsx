import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AreaGuideRoute } from '@/components/areas/AreaGuideRoute'
import { AreaReference } from '@/components/areas/AreaReference'
import { AreaSearchCta } from '@/components/areas/AreaSearchCta'
import { FactSection } from '@/components/areas/FactSection'
import { PropertyShowingCta } from '@/components/ui/PropertyShowingCta'
import { PageHeader } from '@/components/ui/PageHeader'
import { getArea, getPublishedAreaSlugs, isGuideRenderable } from '@/lib/areas'
import { areaGuide } from '@/lib/content/areas'
import { siteUrl } from '@/lib/config'

/**
 * A published area added after the last deploy is not in generateStaticParams,
 * so it must be renderable on demand — the same reason the essay route states
 * this. It is also what lets AREA_PREVIEW resolve the layout fixture locally.
 * The publish gate still decides what actually resolves.
 */
export const dynamicParams = true

interface Props {
  params: Promise<{ area: string }>
}

/**
 * An LA, Actually area guide — the area test-drive.
 *
 * THE ITINERARY IS THE SPINE. When an area has an approved route, the day
 * Danielle would send someone on is the page. The verified factual material
 * still exists and still carries provenance, but it sits below the route as a
 * compact reference panel — supporting material, not the page.
 *
 * WITHOUT A ROUTE the page is deliberately short: the area name, a concise
 * orientation, the same compact reference panel, and a way through to homes.
 * It used to render three full-width factual sections plus an eight-item place
 * directory, which read as a municipal fact sheet and ran three and a half
 * screens before saying anything useful. Records existing is not a reason to
 * render them.
 *
 * PLACES ARE NO LONGER RENDERED PUBLICLY at all. The records, their sources
 * and their review dates are untouched in the data layer and still surface in
 * the staleness report; they will return woven into itinerary stops, where a
 * place is a reason to go somewhere rather than a row in a directory.
 *
 * Only published areas produce a param, so an unpublished area has no URL.
 * Danielle's essay-style editorial modules are still null on every area, and a
 * null module renders nothing.
 */
export async function generateStaticParams() {
  return getPublishedAreaSlugs().map((area) => ({ area }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: slug } = await params
  const area = getArea(slug)
  if (!area) return {}

  return {
    title: `${area.name} — LA, Actually | Danielle Walder`,
    // Falls back to the site description rather than inventing marketing copy.
    description: area.metaDescription ?? undefined,
    alternates: { canonical: `${siteUrl}/la-actually/areas/${area.slug}` },
  }
}

export default async function AreaGuidePage({ params }: Props) {
  const { area: slug } = await params
  const area = getArea(slug)

  if (!area) notFound()

  const guide = isGuideRenderable(area.guide) ? area.guide : null

  return (
    <>
      <PageHeader eyebrow={areaGuide.eyebrow} heading={area.name} headingFont="mark" />

      {/*
        Orientation, set narrow and left so the width around it is whitespace
        rather than a full-bleed paragraph. No heading of its own: PageHeader
        already draws the rule above it.
      */}
      <FactSection block={area.facts.orientation} divider={false} measure="max-w-[54ch]" />

      {/* The route, when there is one. */}
      {guide ? <AreaGuideRoute guide={guide} areaName={area.name} /> : null}

      {/*
        The closing showing handoff, on every guide that has a route. It sits
        above the reference panel: it follows the day, and the factual material
        is the footnote after it.
      */}
      {guide ? (
        <section aria-label="Send me a house" className="wrap pt-11 mobile:pt-8">
          <div className="border-t border-hairline pt-9 mobile:pt-7">
            <PropertyShowingCta area={area.name} />
          </div>
        </section>
      ) : null}

      {/* Verified material, compact, clearly secondary. */}
      <AreaReference area={area} />

      <section aria-label="Homes" className="wrap pt-10 mobile:pt-8">
        {/*
          The area is only named when a verified RealScout Search Link backs
          it — see AreaSearchCta. Otherwise this is a plain "Search homes".
        */}
        <AreaSearchCta area={area} />
      </section>
    </>
  )
}
