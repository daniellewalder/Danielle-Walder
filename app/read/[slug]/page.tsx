import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { readPage } from '@/lib/content/pages'
import { getEssay, getEssaySlugs } from '@/lib/essays'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getEssaySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const essay = await getEssay(slug)
  if (!essay) return {}

  return {
    title: `${essay.title} — Overthinking Real Estate`,
    description: essay.dek ?? undefined,
    // Substack published it first. The canonical points there so the two
    // copies are not competing in search.
    alternates: essay.substackUrl ? { canonical: essay.substackUrl } : undefined,
  }
}

export default async function EssayPage({ params }: Props) {
  const { slug } = await params
  const essay = await getEssay(slug)

  if (!essay?.contentHtml) notFound()

  return (
    <article className="wrap pt-14 mobile:pt-10">
      <header className="mx-auto max-w-measure">
        <Link href="/read" className="more-link inline-flex text-[14px]">
          <span aria-hidden="true">&larr;</span>&nbsp;{readPage.publicationName}
        </Link>

        <h1 className="mt-7 font-serif text-[44px] leading-[1.08] text-espresso tablet:text-[38px] mobile:text-[30px]">
          {essay.title}
        </h1>

        {essay.dek ? (
          <p className="mt-5 font-sans text-[18px] leading-[1.5] text-warmgray">{essay.dek}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-5">
          <span className="font-sans text-[14px] font-semibold text-espresso">
            {readPage.byline}
          </span>
          {essay.publishedAt ? (
            <time
              dateTime={new Date(essay.publishedAt).toISOString()}
              className="font-sans text-[14px] text-warmgray"
            >
              {new Date(essay.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          ) : null}
        </div>
      </header>

      {/* The cover Danielle attached on Substack. Omitted entirely if absent. */}
      {essay.imageUrl ? (
        <ImageSlot
          image={{ label: '[ADD ESSAY IMAGE]', alt: essay.title, src: essay.imageUrl }}
          priority
          sizes="(max-width: 1024px) 100vw, 68ch"
          className="mx-auto mt-10 h-[360px] max-w-measure rounded-block mobile:h-[220px]"
        />
      ) : null}

      {/*
        Sanitised server-side in lib/essays/sanitize.ts against an allow-list —
        formatting only, no scripts, iframes, styles, or event handlers. Never
        render feed HTML without that step.
      */}
      <div
        className="essay-prose mx-auto mt-10 max-w-measure"
        dangerouslySetInnerHTML={{ __html: essay.contentHtml }}
      />

      <footer className="mx-auto mt-12 max-w-measure border-t border-hairline pt-7">
        {essay.substackUrl ? (
          <a
            href={essay.substackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="more-link mt-4 inline-flex"
          >
            {readPage.essay.originalCta} <span aria-hidden="true">&nbsp;&rarr;</span>
            <span className="sr-only"> (opens on Substack)</span>
          </a>
        ) : null}
      </footer>
    </article>
  )
}
