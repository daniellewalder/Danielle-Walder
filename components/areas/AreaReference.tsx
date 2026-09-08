import { renderableFact } from '@/lib/areas'
import type { Area } from '@/lib/areas'
import { areaGuide } from '@/lib/content/areas'
import { VerificationLine } from '@/components/areas/VerificationLine'

/**
 * The verified factual material, as compact reference.
 *
 * This used to be the page: three full-width sections of paragraphs plus an
 * eight-item place directory, which read as a municipal fact sheet rather than
 * an editorial field guide. It is now one quiet panel — two columns on
 * desktop, small labels instead of 30px headings, narrow measures — that says
 * "this is reference" by its composition rather than by taking over the page.
 *
 * Nothing was deleted from the research. Every fact still carries its sources
 * and review dates, and the staleness report still reads them. What changed is
 * that the database no longer renders itself onto the page at full volume.
 *
 * Renders nothing when neither block passes the verification gate.
 */
function Column({ heading, body }: { heading: string; body: string[] }) {
  return (
    <div className="min-w-0">
      <h2 className="text-[11.5px] font-bold uppercase tracking-kicker text-butter-text">
        {heading}
      </h2>
      <div className="mt-3">
        {body.map((paragraph) => (
          <p
            key={paragraph}
            className="max-w-[44ch] font-sans text-[15.5px] leading-[1.6] text-warmgray [&+p]:mt-3"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

export function AreaReference({ area }: { area: Area }) {
  const housing = renderableFact(area.facts.housing)
  const access = renderableFact(area.facts.access)
  if (!housing && !access) return null

  return (
    <section aria-labelledby="area-reference" className="wrap pt-12 mobile:pt-9">
      <div className="rounded-block bg-paper px-10 py-9 mobile:rounded-[16px] mobile:px-6 mobile:py-7">
        <p id="area-reference" className="eyebrow tracking-label">
          {areaGuide.referenceLabel}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-12 tablet:grid-cols-1 tablet:gap-8">
          {housing ? <Column heading={areaGuide.housingHeading} body={housing.body} /> : null}
          {access ? <Column heading={areaGuide.accessHeading} body={access.body} /> : null}
        </div>

        <div className="mt-8 border-t border-hairline pt-5">
          <VerificationLine date={area.provenance.lastVerified} />
        </div>
      </div>
    </section>
  )
}
