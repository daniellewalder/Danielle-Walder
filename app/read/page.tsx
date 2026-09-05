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

/** "Read on Substack →". Renders as plain text when there is nowhere real to go. */
function ReadLink({ entry }: { entry: EssayEntry }) {
  if (!entry.url) {
    return <span className="font-sans text-[14px] text-taupe">{readPage.readCta}</span>
  }

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-sans text-[14px] font-medium text-sage-olive hover:text-sage-deep"
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
        <h1 className="max-w-[16ch] font-serif text-[54px] leading-[1.08] text-wine tablet:text-[44px] mobile:text-[34px]">
          {readPage.headline}
        </h1>
        <p className="eyebrow mt-5">{readPage.eyebrow}</p>
        <p className="mt-5 max-w-measure font-sans text-[16.5px] leading-[1.6] text-warmgray">
          {readPage.intro}
        </p>
      </header>

      {/* The two-column front page */}
      <div className="wrap mt-10 grid grid-cols-[1.15fr_1fr] items-start gap-14 border-t border-hairline pt-9 tablet:grid-cols-1 tablet:gap-10">
        {/* Lead essay */}
        {lead ? (
          <section aria-labelledby="lead-essay" className="min-w-0">
            <p className="eyebrow tracking-label">{readPage.latestLabel}</p>

            <div className="mt-5 flex flex-col gap-5">
              <ImageSlot
                image={{ label: '[ADD ESSAY IMAGE]', alt: lead.title, src: null }}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-[300px] rounded-block mobile:h-[220px]"
              />

              <div className="flex flex-col gap-3">
                <h2
                  id="lead-essay"
                  className="font-serif text-[38px] leading-[1.1] text-espresso mobile:text-[28px]"
                >
                  {lead.title}
                </h2>
                <p className="font-sans text-[16.5px] leading-[1.55] text-warmgray">{lead.dek}</p>
                <p className="font-sans text-[14px] font-semibold text-espresso">
                  {readPage.byline}
                </p>
                <EssayMeta entry={lead} />
                <div className="mt-1">
                  <ReadLink entry={lead} />
                </div>
              </div>
            </div>

            {/* The Counter — a recurring feature, Danielle's placeholder until written. */}
            <div className="mt-9 border-t border-hairline pt-7">
              <p className="eyebrow tracking-label">{readPage.counter.label}</p>
              <p className="mt-4 max-w-measure font-serif text-[21px] leading-[1.35] text-espresso mobile:text-[18px]">
                {readPage.counter.body}
              </p>
            </div>
          </section>
        ) : null}

        {/* More to overthink */}
        <section aria-labelledby="more-essays" className="min-w-0">
          <h2
            id="more-essays"
            className="border-b border-hairline pb-4 font-display text-[30px] leading-none text-espresso mobile:text-[24px]"
          >
            {readPage.moreLabel}
          </h2>

          <ul>
            {more.map((entry) => (
              <li key={entry.title} className="border-b border-hairline py-6">
                <article className="flex flex-col gap-3">
                  <h3 className="font-serif text-[24px] leading-[1.16] text-espresso mobile:text-[20px]">
                    {entry.title}
                  </h3>
                  <p className="font-sans text-[15px] leading-[1.55] text-warmgray">{entry.dek}</p>
                  <ReadLink entry={entry} />
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Blue owns this band. */}
      <section
        aria-labelledby="real-life"
        className="mt-16 grid grid-cols-[1.4fr_1fr] items-start gap-14 bg-blue-field px-gutter py-14 tablet:px-gutter-tablet mobile:mt-12 mobile:grid-cols-1 mobile:gap-8 mobile:px-gutter-mobile mobile:py-10"
      >
        <div className="min-w-0">
          <h2
            id="real-life"
            className="font-display text-[32px] leading-[1.1] text-blue-ink mobile:text-[26px]"
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
            className="max-w-[18ch] font-display text-[38px] leading-[1.12] mobile:text-[28px]"
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
