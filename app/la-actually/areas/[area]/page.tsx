import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FactSection } from '@/components/areas/FactSection'
import { PlaceList } from '@/components/areas/PlaceList'
import { VerificationLine } from '@/components/areas/VerificationLine'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { getArea, getAreaPlaces, getPublishedAreaSlugs } from '@/lib/areas'
import { areaGuide } from '@/lib/content/areas'
import { siteUrl } from '@/lib/config'

interface Props {
  params: Promise<{ area: string }>
}

/**
 * An LA, Actually area guide.
 *
 * Only published areas produce a param, so an unpublished area has no URL at
 * all rather than existing half-written. Every module is optional and renders
 * only when its data passes the verification gate: the guide is as long as the
 * research is, and no longer.
 *
 * Danielle's editorial modules are deliberately not rendered here yet. They
 * are null on every area, and a null module renders nothing — not a heading,
 * not a placeholder. They arrive when she writes them.
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

  return (
    <>
      <PageHeader eyebrow={areaGuide.eyebrow} heading={area.name} headingFont="mark" />

      {/* Orientation carries no heading of its own, by design. PageHeader
          already draws a rule beneath itself, so this block draws none. */}
      <FactSection block={area.facts.orientation} divider={false} />
      <FactSection heading={areaGuide.housingHeading} block={area.facts.housing} />
      <FactSection heading={areaGuide.accessHeading} block={area.facts.access} />

      <PlaceList places={places} heading={areaGuide.placesHeading} />

      <section aria-label="Search homes" className="wrap pt-12 mobile:pt-9">
        <div className="flex flex-col items-start gap-7 border-t border-hairline pt-10 mobile:pt-8">
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
