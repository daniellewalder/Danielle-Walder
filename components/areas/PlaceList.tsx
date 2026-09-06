import type { Place, PlaceCategory } from '@/lib/areas'
import { placeCategoryLabels } from '@/lib/content/areas'

/**
 * Reading order for the list. Places are sorted into these groups and keep
 * their authored order within a group, so the four parks sit together and the
 * category label can be printed once per run instead of once per row.
 *
 * This is the whole of "grouped only where useful": a running label, not a set
 * of invented sub-headings.
 */
const categoryOrder: PlaceCategory[] = [
  'shopping-dining',
  'bookstore',
  'coffee',
  'park',
  'institution',
]

/**
 * Verified local places.
 *
 * One list, one component. Places have no routes, so nothing here is a link to
 * this site — the only link is outward to a first-party URL, and only when one
 * was actually verified. A place without a verified URL renders as plain text
 * rather than pointing somewhere guessed.
 *
 * No ratings, stars, reviews, prices or hours. Those are not absent because
 * they were hard to find; they are absent by rule.
 */
export function PlaceList({ places, heading }: { places: Place[]; heading: string }) {
  if (places.length === 0) return null

  const ordered = [...places].sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  )

  return (
    <section aria-labelledby="local-places" className="wrap pt-12 mobile:pt-9">
      <div className="border-t border-hairline pt-10 mobile:pt-8">
        <h2
          id="local-places"
          className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile"
        >
          {heading}
        </h2>

        <ul className="mt-8 flex flex-col border-t border-hairline">
          {ordered.map((place, index) => (
            <li key={place.id} className="min-w-0 border-b border-hairline py-6">
              {index === 0 || ordered[index - 1].category !== place.category ? (
                <p className="eyebrow mb-3 tracking-label">{placeCategoryLabels[place.category]}</p>
              ) : null}

              <h3 className="font-sans text-[19px] font-semibold text-espresso mobile:text-[17.5px]">
                {place.officialUrl ? (
                  <a
                    href={place.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-wine"
                  >
                    {place.name}
                  </a>
                ) : (
                  place.name
                )}
              </h3>

              {place.address ? (
                <p className="mt-2 font-sans text-[15.5px] leading-[1.5] text-warmgray">
                  {place.address}
                </p>
              ) : null}

              {place.description ? (
                <p className="mt-2 max-w-measure font-sans text-[15.5px] leading-[1.55] text-warmgray">
                  {place.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
