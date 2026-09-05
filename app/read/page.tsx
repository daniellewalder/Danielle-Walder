import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { substackSubscribeUrl, substackUrl } from '@/lib/config'
import { readPage } from '@/lib/content/pages'
import { getEssays } from '@/lib/essays'

export const metadata: Metadata = {
  title: 'Read — Overthinking Real Estate',
  description:
    'Overthinking Real Estate: long-form essays on how real estate actually works, published on Substack.',
}

export default async function ReadPage() {
  const { entries, source } = await getEssays()

  // Say only what is true of the links actually rendered below.
  const intro = !substackUrl
    ? readPage.offlineNote
    : source === 'feed'
      ? readPage.intro
      : readPage.fallbackIntro

  return (
    <>
      <PageHeader
        eyebrow={readPage.eyebrow}
        heading={readPage.title}
        headingFont="serif"
        headingClassName="text-wine"
        intro={intro}
      >
        {substackSubscribeUrl ? (
          <CtaLink href={substackSubscribeUrl} external variant="primary">
            {readPage.subscribeCta}
            <span className="sr-only"> (opens on Substack)</span>
          </CtaLink>
        ) : null}
      </PageHeader>

      <section aria-label="Essays" className="wrap pb-4 pt-2">
        <ul>
          {entries.map((entry) => (
            <li key={entry.title} className="border-b border-hairline py-8 mobile:py-6">
              <article className="flex flex-col gap-3">
                <h2 className="max-w-measure font-serif text-[32px] leading-[1.12] text-espresso mobile:text-[24px]">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-wine"
                    >
                      {entry.title}
                      <span className="sr-only"> (opens on Substack)</span>
                    </a>
                  ) : (
                    entry.title
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-[12.5px] font-bold uppercase tracking-kicker text-taupe">
                    essay
                  </span>
                  {/* Dates come from the feed or not at all — never invented. */}
                  {entry.publishedAt ? (
                    <time
                      dateTime={new Date(entry.publishedAt).toISOString()}
                      className="font-sans text-[14px] text-warmgray"
                    >
                      {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>

      </section>
    </>
  )
}
