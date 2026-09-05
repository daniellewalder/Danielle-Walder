import { CtaLink } from '@/components/ui/CtaLink'
import { tuesdayTest } from '@/lib/content/home'

/**
 * The one full-bleed dark section in the page body.
 *
 * The right column is a static editorial preview. The options are styled text
 * in a plain list — not buttons, inputs, links, or focusable elements. Nothing
 * is selected, scored, saved, or returned, and they carry no hover state so
 * they never read as interactive. The single CTA is the only action here.
 */
export function TuesdayTest() {
  return (
    <section
      aria-labelledby="tuesday-test"
      className="mt-[88px] grid grid-cols-2 items-center gap-14 bg-brown px-gutter py-20 text-onbrown tablet:grid-cols-1 tablet:gap-8 tablet:px-gutter-tablet mobile:mt-16 mobile:gap-8 mobile:px-gutter-mobile mobile:py-14"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <span className="self-start rounded-badge bg-butter-field px-[13px] py-[7px] text-[11.5px] font-bold uppercase tracking-label text-brown">
          {tuesdayTest.badge}
        </span>
        <h2
          id="tuesday-test"
          className="font-display text-[54px] leading-[1.04] tablet:text-[44px] mobile:text-[34px]"
        >
          {tuesdayTest.heading}
        </h2>
        <p className="max-w-quiz-intro font-sans text-[17.5px] leading-[1.5] text-onbrown-body">
          {tuesdayTest.intro}
        </p>
        <CtaLink
          href={tuesdayTest.cta.href}
          variant="primary"
          className="mt-2 self-start border-[1.5px] border-butter-field bg-transparent text-butter-field hover:border-butter-field hover:bg-butter-field hover:text-brown"
        >
          {tuesdayTest.cta.label}
        </CtaLink>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-label">
          {tuesdayTest.preview.label}
        </p>
        <p className="font-sans text-[18px] leading-[1.45] text-onbrown">
          {tuesdayTest.preview.question}
        </p>
        <ul className="flex flex-col gap-3">
          {tuesdayTest.preview.options.map((option) => (
            <li
              key={option}
              className="rounded-button bg-cream px-[26px] py-[19px] font-sans text-[16.5px] font-medium leading-[1.4] text-brown"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
