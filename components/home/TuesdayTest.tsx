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
      className="mt-[88px] grid grid-cols-[0.95fr_1.05fr] items-center gap-16 bg-brown px-gutter py-24 text-onbrown tablet:grid-cols-1 tablet:gap-10 tablet:px-gutter-tablet tablet:py-16 mobile:mt-16 mobile:gap-8 mobile:px-gutter-mobile mobile:py-14"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <span className="self-start rounded-badge bg-butter-field px-[13px] py-[7px] text-[11.5px] font-bold uppercase tracking-label text-brown">
          {tuesdayTest.badge}
        </span>
        <h2
          id="tuesday-test"
          className="max-w-[13ch] font-display text-[58px] leading-[1.02] tablet:text-[46px] mobile:text-[34px]"
        >
          {tuesdayTest.heading}
        </h2>
        <p className="max-w-[42ch] font-sans text-[17.5px] leading-[1.55] text-onbrown-body">
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

      {/*
        The preview reads as a product moment, so it sits in a paper panel
        rather than loose on the brown. The panel takes the 12px button radius,
        not the 20px block radius: the handoff reserves 20px for the two or
        three soft colour blocks — hero, about, subscribe row — and this is UI,
        not a fourth soft block.

        The options are list items. Not buttons, not links, not focusable, no
        hover state. Nothing is selected, scored, saved, or returned.
      */}
      <div className="min-w-0 rounded-button bg-paper px-9 py-8 mobile:px-6 mobile:py-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-4">
          <p className="text-[11.5px] font-bold uppercase tracking-label text-taupe">
            {tuesdayTest.preview.label}
          </p>
          <span className="font-sans text-[13px] text-taupe">
            1 / {tuesdayTest.preview.options.length}
          </span>
        </div>

        <p className="mt-6 font-display text-[26px] leading-[1.2] text-espresso mobile:text-[21px]">
          {tuesdayTest.preview.question}
        </p>

        <ul className="mt-6 flex flex-col gap-[10px]">
          {tuesdayTest.preview.options.map((option) => (
            <li
              key={option}
              className="rounded-button bg-cream px-5 py-[15px] font-sans text-[15.5px] leading-[1.45] text-espresso"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
