import Link from 'next/link'
import type { Area } from '@/lib/areas'
import { areaIndex } from '@/lib/content/areas'

/**
 * The published-area discovery section on /la-actually.
 *
 * A hairline list, not a card grid: with one published guide a grid of cards
 * would be a single stranded card, and with thirty it would be a directory. It
 * reuses the row pattern already on /search.
 *
 * Only published areas appear. There are no placeholder rows for areas still
 * being researched and no "coming soon" — an unwritten guide is simply absent.
 */
export function AreaIndex({ areas }: { areas: Area[] }) {
  if (areas.length === 0) return null

  return (
    <section aria-labelledby="area-guides" className="wrap pt-12 mobile:pt-9">
      {/* PageHeader already draws a rule above this; a second one reads as a
          mistake, so the section opens straight onto the heading. */}
      <div>
        <h2
          id="area-guides"
          className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile"
        >
          {areaIndex.heading}
        </h2>

        <ul className="mt-7 flex flex-col border-t border-hairline">
          {areas.map((area) => (
            <li key={area.id} className="min-w-0 border-b border-hairline">
              <Link
                href={`/la-actually/areas/${area.slug}`}
                className="group flex items-center justify-between gap-6 py-6"
              >
                <span className="min-w-0">
                  <span className="block font-mark text-[26px] font-semibold leading-[1.1] tracking-utility text-espresso group-hover:text-wine mobile:text-[21px]">
                    {area.name}
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-sage-olive">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
