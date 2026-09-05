import type { Metadata } from 'next'
import Link from 'next/link'
import { realScoutAgentId, realScoutScriptSrc } from '@/lib/config'
import { searchPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Search Homes — Danielle Walder',
  description: 'Los Angeles home search, and how to start it with what you already know.',
}

/**
 * Home search, powered by RealScout's IDX web components.
 *
 * The widget is themed with locked palette tokens only — blue ink for type,
 * mid sage for the field border. Its default drop shadow is switched off:
 * the design system has no shadows.
 *
 * Width is handled here rather than in RealScout's config. The component is
 * told to fill its container and the container is capped, so it is exactly
 * 688px on a laptop and fluid on a phone instead of overflowing.
 */
export default function SearchPage() {
  return (
    <>
      {/* React hoists and de-duplicates this, so it loads once, on this page only. */}
      <script src={realScoutScriptSrc} type="module" async />

      <style>{`
        realscout-simple-search {
          --rs-ss-font-primary-color: #24425a;
          --rs-ss-searchbar-border-color: #a9ae7f;
          --rs-ss-box-shadow: none;
          --rs-ss-widget-width: 100% !important;
        }
      `}</style>

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

      {/* Blue owns search and tools. */}
      <section aria-label={searchPage.searchLabel} className="wrap pt-12 mobile:pt-8">
        <div className="rounded-block bg-blue-field px-10 py-14 mobile:px-5 mobile:py-8">
          <div className="mx-auto w-full max-w-[688px]">
            <realscout-simple-search agent-encoded-id={realScoutAgentId} />
          </div>
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
