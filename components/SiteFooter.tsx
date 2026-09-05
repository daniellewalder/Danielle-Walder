import Link from 'next/link'
import { footerGroups, legal, publicationWordmark, siteName } from '@/lib/content/site'

export function SiteFooter() {
  return (
    <footer className="mt-[76px] bg-brown px-gutter pb-10 pt-[52px] text-onbrown tablet:px-gutter-tablet mobile:mt-14 mobile:px-gutter-mobile mobile:pb-8 mobile:pt-10">
      <div className="flex flex-col gap-[34px]">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <span className="font-mark text-[34px] font-semibold tracking-display lowercase mobile:text-[26px]">
            {siteName}
          </span>
          <Link
            href={publicationWordmark.href}
            className="font-serif text-[22px] text-butter-field hover:text-onbrown"
          >
            {publicationWordmark.label}
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-9 border-t border-onbrown-rule pt-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-16 gap-y-9">
            {footerGroups.map((group) => (
              <div key={group.heading} className="flex flex-col gap-3">
                <h2 className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-fine">
                  {group.heading}
                </h2>
                <ul className="flex flex-col gap-[10px]">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-sans text-[14px] text-onbrown-label hover:text-butter-field"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/*
            Legally required on every page. Rendered verbatim as supplied by
            the brokerage — never reword, re-case, or reformat. Never add any
            further disclosure language that has not been supplied and
            verified; see the launch blockers in README.md.
          */}
          <div className="flex flex-col gap-[6px] font-sans text-[13px] leading-[1.5] text-onbrown-body">
            <span>{legal.agentLine}</span>
            <span>{legal.brokerageLine}</span>
          </div>
        </div>

        {/*
          The approved brokerage disclosure. Both this and the broker line
          above use --on-brown-body (#DACFC4) rather than the fine-print tone
          (#A8998C): legally required text has to be legible, and #A8998C on
          brown is 4.13:1, under AA for text this size. #DACFC4 is 7.46:1 and
          is the token the handoff reserves for text on brown. Both are locked
          palette values — no new colour was introduced.
        */}
        <p className="max-w-measure border-t border-onbrown-rule pt-6 font-sans text-[13px] leading-[1.6] text-onbrown-body">
          {legal.disclosure}
        </p>
      </div>
    </footer>
  )
}
