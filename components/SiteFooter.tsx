import Link from 'next/link'
import { footerLinks, legal, overthinkingLink, siteName } from '@/lib/content/site'

export function SiteFooter() {
  return (
    <footer className="mt-[76px] bg-brown px-gutter pb-10 pt-[52px] text-onbrown tablet:px-gutter-tablet mobile:mt-14 mobile:px-gutter-mobile mobile:pb-8 mobile:pt-10">
      <div className="flex flex-col gap-[34px]">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <span className="font-mark text-[34px] font-semibold tracking-display lowercase mobile:text-[26px]">
            {siteName}
          </span>
          <Link
            href={overthinkingLink.href}
            className="font-serif text-[22px] text-butter-field hover:text-onbrown"
          >
            {overthinkingLink.label}
          </Link>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-[30px] border-t border-onbrown-rule pt-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-[22px]">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[14px] text-onbrown-label hover:text-butter-field"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/*
            Brokerage name and DRE licence number are legally required on every
            page. Do not remove.
          */}
          <div className="flex flex-wrap gap-[22px] font-sans text-[13px] text-onbrown-fine">
            <span>{legal.brokerage}</span>
            <span>DRE {legal.dreNumber}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
