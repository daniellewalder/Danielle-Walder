import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { searchPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Search Homes — Danielle Walder',
  description: 'Los Angeles home search, and how to start it with what you already know.',
}

/**
 * An IDX-ready shell, not a search page.
 *
 * There are no filter controls, no map, no results, and no input of any kind:
 * every one of those would imply a search that does not exist yet. The reserved
 * area is clearly labelled as the future MLS/IDX mount point.
 */
export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow={searchPage.eyebrow}
        heading={searchPage.heading}
        intro={searchPage.intro}
      />

      <section aria-labelledby="idx-placeholder" className="wrap pt-12 mobile:pt-8">
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-block bg-blue-field px-10 py-16 text-center mobile:min-h-[220px] mobile:px-6 mobile:py-12">
          <h2
            id="idx-placeholder"
            className="text-[12px] font-bold uppercase tracking-kicker text-blue-deep"
          >
            {searchPage.placeholderLabel}
          </h2>
          <p className="max-w-[420px] font-sans text-[16px] leading-[1.5] text-blue-deep">
            {searchPage.placeholderNote}
          </p>
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
