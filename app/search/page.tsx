import type { Metadata } from 'next'
import Link from 'next/link'
import { AdvancedSearch } from '@/components/realscout/RealScout'
import { searchPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Search Homes — Danielle Walder',
  description: 'Los Angeles home search, and how to start it with what you already know.',
}

/** Home search, powered by RealScout's IDX web components. Blue owns tools. */
export default function SearchPage() {
  return (
    <>
      <header className="wrap pt-14 mobile:pt-10">
        <div className="border-b border-hairline pb-11 mobile:pb-8">
          <p className="eyebrow">{searchPage.eyebrow}</p>
          <h1 className="mt-4 font-display text-section leading-none text-espresso tablet:text-section-tablet mobile:text-section-mobile">
            {searchPage.heading}
          </h1>
          <p className="mt-6 max-w-measure font-sans text-[19px] leading-[1.45] text-warmgray mobile:text-[17px]">
            {searchPage.intro}
          </p>
        </div>
      </header>

      <section aria-label={searchPage.searchLabel} className="wrap pt-12 mobile:pt-8">
        <div className="rounded-block bg-blue-field px-10 py-12 mobile:px-5 mobile:py-8">
          <AdvancedSearch />
        </div>
      </section>

      <section aria-label="In the meantime" className="wrap pt-12 mobile:pt-8">
        <ul className="flex flex-col border-t border-hairline">
          {searchPage.links.map((link) => (
            <li key={link.href} className="border-b border-hairline">
              <Link
                href={link.href}
                className="flex items-center justify-between gap-6 py-6 font-sans text-[19px] font-medium text-espresso hover:text-wine mobile:text-[17px]"
              >
                {link.label}
                <span aria-hidden="true" className="text-sage-olive">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
