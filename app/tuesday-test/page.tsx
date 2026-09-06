import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { tuesdayTestPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'The Tuesday Test — Danielle Walder',
  description:
    'A short home-and-neighborhood reflection tool about routine, space, location, and quiet.',
}

/**
 * A static preview in Version 1, not a scoring tool.
 *
 * The four options below are styled text in a plain list. They are not buttons,
 * inputs, links, or focusable elements; nothing is selected, saved, scored, or
 * returned. There is no quiz logic on this page.
 */
export default function TuesdayTestPage() {
  return (
    <>
      <PageHeader
        eyebrow={tuesdayTestPage.eyebrow}
        heading={tuesdayTestPage.heading}
        intro={tuesdayTestPage.intro}
        headingFont="mark"
      />

      <section aria-labelledby="preview-question" className="wrap pt-12 mobile:pt-8">
        <div className="rounded-block bg-brown px-12 py-14 text-onbrown mobile:rounded-[16px] mobile:px-6 mobile:py-9">
          <p className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-label">
            {tuesdayTestPage.preview.label}
          </p>

          <h2
            id="preview-question"
            className="mt-5 max-w-[720px] font-display text-[34px] leading-[1.18] mobile:text-[24px]"
          >
            {tuesdayTestPage.preview.question}
          </h2>

          <ul className="mt-8 flex max-w-[720px] flex-col gap-3">
            {tuesdayTestPage.preview.options.map((option) => (
              <li
                key={option}
                className="rounded-button bg-cream px-[26px] py-[19px] font-sans text-[16.5px] font-medium leading-[1.45] text-brown mobile:px-5 mobile:py-4 mobile:text-[16px]"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="What's next" className="wrap pt-12 mobile:pt-8">
        <div className="flex flex-col items-start gap-6 border-t border-hairline pt-10">
          <p className="max-w-measure font-sans text-[19px] leading-[1.5] text-warmgray mobile:text-[17px]">
            {tuesdayTestPage.closing.body}
          </p>
          <CtaLink href={tuesdayTestPage.closing.cta.href} variant="primary">
            {tuesdayTestPage.closing.cta.label}
          </CtaLink>
        </div>
      </section>
    </>
  )
}
