import type { Metadata } from 'next'
import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { substackSubscribeUrl } from '@/lib/config'
import { readPage } from '@/lib/content/pages'
import { getEssays, type EssayEntry } from '@/lib/essays'

export const metadata: Metadata = {
  title: 'Essays — Overthinking Real Estate',
  description:
    'Original essays about homes, money, Los Angeles, identity, class, status, technology, privacy, and risk.',
}

/**
 * Explicit ISR window for the Substack feed.
 *
 * Next would otherwise infer this from the shortest fetch revalidate in the
 * tree, which is fragile: adding one unrelated fetch with a different window
 * silently changes how fresh this page is. Stating it here is what makes the
 * "new essay within about five minutes" promise a property of the page rather
 * than a side effect of lib/essays.
 */
export const revalidate = 300

const readLinkStyle = 'font-sans text-[14px] font-medium text-sage-olive hover:text-sage-deep'

/**
 * Wraps anything — an image, a title — in the essay's destination.
 *
 * Prefers the on-site page, falls back to the original on Substack, and
 * renders plain text when there is nowhere real to go, so a cover image is
 * never a dead link.
 */
function EssayLink({
  entry,
  className,
  children,
}: {
  entry: EssayEntry
  className: string
  children: React.ReactNode
}) {
  if (entry.slug) {
    return (
      <Link href={`/read/${entry.slug}`} className={className}>
        {children}
      </Link>
    )
  }

  if (!entry.substackUrl) return <span className={className}>{children}</span>

  return (
    <a href={entry.substackUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens on Substack)</span>
    </a>
  )
}

/**
 * The essay's own artwork from Substack, or nothing.
 *
 * A missing cover renders an intentional text-only story rather than a
 * labelled empty rectangle: nobody is going to "add" this image to the site —
 * it belongs to the post — so a placeholder asking for one would be a lie
 * about what is missing. Stock is never substituted here.
 */
function EssayCover({
  entry,
  sizes,
  className,
}: {
  entry: EssayEntry
  sizes: string
  className: string
}) {
  if (!entry.imageUrl) return null

  return (
    <EssayLink entry={entry} className="group block">
      <ImageSlot
        image={{ label: '[ADD ESSAY IMAGE]', alt: entry.title, src: entry.imageUrl }}
        sizes={sizes}
        className={className}
      />
    </EssayLink>
  )
}

/**
 * Prefers the essay's page on this site. Falls back to the original on
 * Substack, and to plain text when there is nowhere real to go.
 */
function ReadLink({ entry }: { entry: EssayEntry }) {
  if (entry.slug) {
    return (
      <Link href={`/read/${entry.slug}`} className={readLinkStyle}>
        {readPage.readOnSiteCta} <span aria-hidden="true">&rarr;</span>
      </Link>
    )
  }

  if (!entry.substackUrl) {
    return <span className="font-sans text-[14px] text-taupe">{readPage.readCta}</span>
  }

  return (
    <a
      href={entry.substackUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={readLinkStyle}
    >
      {readPage.readCta} <span aria-hidden="true">&rarr;</span>
      <span className="sr-only"> (opens on Substack)</span>
    </a>
  )
}

/** A date only ever comes from the live feed. */
function EssayMeta({ entry }: { entry: EssayEntry }) {
  return (
    <p className="text-[11.5px] font-bold uppercase tracking-kicker text-taupe">
      {readPage.essayKicker} &middot;{' '}
      {entry.publishedAt ? (
        <time dateTime={new Date(entry.publishedAt).toISOString()}>
          {new Date(entry.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      ) : (
        readPage.datePlaceholder
      )}
    </p>
  )
}

export default async function ReadPage() {
  const { lead, more } = await getEssays()

  return (
    <>
      {/* Masthead */}
      <header className="wrap pt-14 mobile:pt-10">
        <h1 className="max-w-[20ch] font-serif text-[40px] leading-[1.12] text-wine tablet:text-[34px] mobile:text-[28px]">
          {readPage.headline}
        </h1>
        <p className="eyebrow mt-5">{readPage.eyebrow}</p>
        <p className="mt-5 max-w-measure font-sans text-[16.5px] leading-[1.6] text-warmgray">
          {readPage.intro}
        </p>
      </header>

      {/* The lead story, given the width it deserves. */}
      {lead ? (
        <section
          aria-labelledby="lead-essay"
          className="wrap mt-10 border-t border-hairline pt-9"
        >
          <p className="eyebrow tracking-label">{readPage.latestLabel}</p>

          <div className="mt-6 grid grid-cols-[1.35fr_1fr] items-center gap-12 tablet:grid-cols-1 tablet:gap-8">
            <EssayCover
              entry={lead}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="h-[440px] rounded-block tablet:h-[340px] mobile:h-[240px]"
            />

            <div className="flex min-w-0 flex-col gap-4">
              <EssayLink entry={lead} className="group block">
                <h2
                  id="lead-essay"
                  className="font-serif text-[33px] leading-[1.12] text-espresso group-hover:text-wine tablet:text-[29px] mobile:text-[25px]"
                >
                  {lead.title}
                </h2>
              </EssayLink>
              {lead.dek ? (
                <p className="font-sans text-[16.5px] leading-[1.55] text-warmgray">{lead.dek}</p>
              ) : null}
              <p className="font-sans text-[14px] font-semibold text-espresso">{readPage.byline}</p>
              <EssayMeta entry={lead} />
              <div className="mt-1">
                <ReadLink entry={lead} />
              </div>
            </div>
          </div>

          {/* The Counter — a recurring feature, Danielle's placeholder until written. */}
          <div className="mt-11 border-t border-hairline pt-7">
            <p className="eyebrow tracking-label">{readPage.counter.label}</p>
            <p className="mt-4 max-w-measure font-serif text-[19px] leading-[1.4] text-espresso mobile:text-[17px]">
              {readPage.counter.body}
            </p>
          </div>
        </section>
      ) : null}

      {/*
        The archive. Every essay carries its own Substack artwork, and the image
        side alternates row to row so the page reads as a magazine spread rather
        than a column of identical cards. An essay with no artwork runs full
        width as text — a deliberate state, not a gap.
      */}
      <section aria-labelledby="more-essays" className="wrap mt-14 mobile:mt-10">
        <h2
          id="more-essays"
          className="border-b border-espresso pb-4 font-display text-[27px] leading-none text-espresso mobile:text-[23px]"
        >
          {readPage.moreLabel}
        </h2>

        <ul>
          {more.map((entry, index) => (
            <li key={entry.title} className="border-b border-hairline py-9 mobile:py-7">
              {entry.imageUrl ? (
                <article
                  className={`grid items-center gap-11 tablet:grid-cols-1 tablet:gap-6 ${
                    /*
                      The image side alternates, but its column keeps the same
                      width on every row — flipping the template as well as the
                      order is what stops the picture growing on odd rows.
                    */
                    index % 2 === 1
                      ? 'grid-cols-[1fr_0.62fr]'
                      : 'grid-cols-[0.62fr_1fr]'
                  }`}
                >
                  <div className={index % 2 === 1 ? 'order-2 tablet:order-none' : ''}>
                    <EssayCover
                      entry={entry}
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      className="h-[240px] rounded-block mobile:h-[220px]"
                    />
                  </div>

                  <div
                    className={`flex min-w-0 flex-col gap-3 ${
                      index % 2 === 1 ? 'order-1 tablet:order-none' : ''
                    }`}
                  >
                    <EssayLink entry={entry} className="group block">
                      <h3 className="font-serif text-[24px] leading-[1.18] text-espresso group-hover:text-wine mobile:text-[21px]">
                        {entry.title}
                      </h3>
                    </EssayLink>
                    {entry.dek ? (
                      <p className="font-sans text-[15.5px] leading-[1.55] text-warmgray">
                        {entry.dek}
                      </p>
                    ) : null}
                    <EssayMeta entry={entry} />
                    <div className="mt-1">
                      <ReadLink entry={entry} />
                    </div>
                  </div>
                </article>
              ) : (
                <article className="flex max-w-measure flex-col gap-3">
                  <EssayLink entry={entry} className="group block">
                    <h3 className="font-serif text-[24px] leading-[1.18] text-espresso group-hover:text-wine mobile:text-[21px]">
                      {entry.title}
                    </h3>
                  </EssayLink>
                  {entry.dek ? (
                    <p className="font-sans text-[15.5px] leading-[1.55] text-warmgray">
                      {entry.dek}
                    </p>
                  ) : null}
                  <EssayMeta entry={entry} />
                  <div className="mt-1">
                    <ReadLink entry={entry} />
                  </div>
                </article>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Blue owns this band. */}
      <section
        aria-labelledby="real-life"
        className="mt-16 grid grid-cols-[1.4fr_1fr] items-start gap-14 bg-blue-field px-gutter py-14 tablet:px-gutter-tablet mobile:mt-12 mobile:grid-cols-1 mobile:gap-8 mobile:px-gutter-mobile mobile:py-10"
      >
        <div className="min-w-0">
          <h2
            id="real-life"
            className="font-display text-[26px] leading-[1.15] text-blue-ink mobile:text-[22px]"
          >
            {readPage.helpBand.heading}
          </h2>
          <p className="mt-4 max-w-measure font-sans text-[15.5px] leading-[1.6] text-blue-deep">
            {readPage.helpBand.body}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {readPage.helpBand.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-sans text-[15.5px] font-medium text-blue-ink hover:text-wine"
              >
                {link.label} <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/*
        The one dark band on this page. It sits directly above the footer, which
        carries its own top margin — cancelled here so the two brown areas meet
        rather than leaving a cream sliver between them.
      */}
      <section
        aria-labelledby="subscribe"
        className="-mb-[76px] grid grid-cols-[1.4fr_1fr] items-center gap-14 bg-brown px-gutter py-16 text-onbrown tablet:px-gutter-tablet mobile:-mb-14 mobile:grid-cols-1 mobile:gap-7 mobile:px-gutter-mobile mobile:py-12"
      >
        <div className="min-w-0">
          <h2
            id="subscribe"
            className="max-w-[22ch] font-display text-[28px] leading-[1.18] mobile:text-[24px]"
          >
            {readPage.subscribeBand.heading}
          </h2>
          <p className="mt-4 max-w-measure font-sans text-[15.5px] leading-[1.6] text-onbrown-body">
            {readPage.subscribeBand.body}
          </p>
        </div>

        <div className="mobile:justify-self-start tablet:justify-self-start justify-self-end">
          {substackSubscribeUrl ? (
            <a
              href={substackSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-button bg-butter-field px-[26px] py-[14px] font-sans text-[15px] font-semibold text-brown hover:bg-butter-deep"
            >
              {readPage.subscribeBand.cta} <span aria-hidden="true" className="ml-2">&rarr;</span>
              <span className="sr-only"> (opens on Substack)</span>
            </a>
          ) : (
            <p className="max-w-measure font-sans text-[15px] leading-[1.6] text-onbrown-body">
              {readPage.subscribeBand.pending}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
