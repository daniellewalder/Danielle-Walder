import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AreaGuideRoute } from '@/components/areas/AreaGuideRoute'
import { FactSection } from '@/components/areas/FactSection'
import { PlaceList } from '@/components/areas/PlaceList'
import { VerificationLine } from '@/components/areas/VerificationLine'
import { CtaLink } from '@/components/ui/CtaLink'
import { PropertyShowingCta } from '@/components/ui/PropertyShowingCta'
import { PageHeader } from '@/components/ui/PageHeader'
import { getArea, getAreaPlaces, getPublishedAreaSlugs, isGuideRenderable } from '@/lib/areas'
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
 * Danielle would send someone on is the page: what to drive, what to notice,
 * what not to conclude, and where the public route ends. The verified factual
 * sections still exist and still carry provenance, but they sit BELOW the
 * route as reference rather than being the point of the page.
 *
 * When an area has no approved route yet, the itinerary renders nothing at all
 * and the factual guide stands on its own exactly as it did before. Nothing is
 * stubbed to make the layout look finished.
 *
 * Only published areas produce a param, so an unpublished area has no URL.
 * Every module is optional and renders only when its data passes the gate.
 *
 * Danielle's essay-style editorial modules are still null on every area, and a
 * null module renders nothing — not a heading, not a placeholder.
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

  const places = getAreaPlaces(area.id)
  const guide = isGuideRenderable(area.guide) ? area.guide : null

  return (
    <>
      <PageHeader eyebrow={areaGuide.eyebrow} heading={area.name} headingFont="mark" />

      {/* Orientation carries no heading of its own, by design. PageHeader
          already draws a rule beneath itself, so this block draws none. */}
      <FactSection block={area.facts.orientation} divider={false} />

      {/* The route, when there is one. */}
      {guide ? <AreaGuideRoute guide={guide} areaName={area.name} /> : null}

      {/*
        Reference, below the route. These were the whole page before the
        itinerary existed; they are still verified, still sourced, and still
        useful — just no longer the reason to visit.
      */}
      <FactSection heading={areaGuide.housingHeading} block={area.facts.housing} />
      <FactSection heading={areaGuide.accessHeading} block={area.facts.access} />

      <PlaceList places={places} heading={areaGuide.placesHeading} />

      <section aria-label="Search homes" className="wrap pt-12 mobile:pt-9">
        <div className="flex flex-col items-start gap-7 border-t border-hairline pt-10 mobile:pt-8">
          {/* The closing showing handoff, on every guide that has a route. */}
          {guide ? <PropertyShowingCta area={area.name} compact /> : null}

          <VerificationLine date={area.provenance.lastVerified} />
          {/*
            An honest handoff: this goes to the ordinary search page. RealScout
            exposes no verified way to seed a location, so nothing here claims
            the search arrives pre-filtered.
          */}
          <CtaLink href={areaGuide.searchHref} variant="primary">
            {areaGuide.searchCtaPrefix} {area.name}
          </CtaLink>
        </div>
      </section>
    </>
  )
}
