import Link from 'next/link'
import { footerGroups, legal, publicationWordmark, siteName } from '@/lib/content/site'

export function SiteFooter() {
  return (
    <footer className="mt-[76px] bg-brown px-gutter pb-11 pt-11 text-onbrown tablet:px-gutter-tablet mobile:mt-14 mobile:px-gutter-mobile mobile:pb-9 mobile:pt-9">
      {/*
        Composed as an editorial sign-off rather than a tall dark container:
        the name is set at display scale across the top with the publication
        on its baseline, then the working links and the licence block sit
        beneath one rule.

        Below it the two nav groups and the licence lines share one row so
        the width is used and the footer stays a masthead, not a slab.

        The licence lines and the disclosure are rendered VERBATIM. Never
        reword, re-case, reformat, abridge, or shrink them for layout.
      */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4 border-b border-onbrown-rule pb-8 mobile:pb-6">
        <span className="font-mark text-[56px] font-semibold lowercase leading-[0.94] tracking-display navtight:text-[46px] tablet:text-[38px] mobile:text-[26px]">
          {siteName}
        </span>
        <Link
          href={publicationWordmark.href}
          className="font-serif text-[26px] leading-none text-butter-field hover:text-onbrown tablet:text-[21px] mobile:text-[18px]"
        >
          {publicationWordmark.label}
        </Link>
      </div>

      {/*
        Three columns so the width is actually used: the two nav groups, then
        the legal block. Putting the licence lines and the disclosure together
        on the right fills what was dead space under the nav and keeps the
        footer to a masthead rather than a tall dark slab.

        The licence lines and the disclosure are rendered VERBATIM. Never
        reword, re-case, reformat, abridge, or shrink them for layout.
      */}
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.7fr)] gap-x-12 gap-y-9 pt-8 tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-y-7">
        <nav aria-label="Footer" className="contents">
          {footerGroups.map((group) => (
            <div key={group.heading} className="flex min-w-0 flex-col gap-[14px]">
              <h2 className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-fine">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-[9px]">
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
          No heading above the licence lines on purpose: they label themselves,
          and any word there would be compliance copy nobody approved.
        */}
        <div className="flex min-w-0 flex-col gap-4 font-sans text-[13px] leading-[1.5] text-onbrown-body tablet:col-span-2 mobile:col-span-1">
          <div className="flex flex-col gap-[6px]">
            <span>{legal.agentLine}</span>
            <span>{legal.brokerageLine}</span>
          </div>
          <p className="border-t border-onbrown-rule pt-4 leading-[1.65]">{legal.disclosure}</p>
        </div>
      </div>
    </footer>
  )
}
