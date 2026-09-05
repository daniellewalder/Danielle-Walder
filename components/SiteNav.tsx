'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { navCta, navLinks, navLinksAfter, navWordmark, readLink } from '@/lib/content/site'

/**
 * Nav is not sticky in the approved design. It collapses to the mark plus a
 * hamburger below 900px, where the full row stops fitting on one line.
 */
export function SiteNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!mobileNavOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileNavOpen])

  const plainLink =
    'font-sans text-[16px] font-medium text-espresso hover:text-wine navtight:text-[14.5px]'

  return (
    <nav aria-label="Primary" className="wrap pt-[26px]">
      <div className="flex items-center justify-between gap-9 border-b border-hairline pb-[22px]">
        <Link
          href="/"
          className="whitespace-nowrap font-mark text-[26px] font-semibold leading-[1.05] tracking-utility text-espresso lowercase hover:text-wine navtight:text-[21px] mobile:max-w-[62%] mobile:whitespace-normal mobile:text-[18px]"
        >
          {navWordmark}
        </Link>

        {/* Wide screens: the full row. */}
        <div className="flex items-center gap-[26px] whitespace-nowrap navtight:gap-[15px] navstack:hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={plainLink}>
              {link.label}
            </Link>
          ))}
          {/* The publication sits mid-row in Kalnia and wine, as a voice. */}
          <Link href={readLink.href} className="font-serif text-[18px] text-wine hover:text-wine-pressed navtight:text-[16px]">
            {readLink.label}
          </Link>
          {navLinksAfter.map((link) => (
            <Link key={link.href} href={link.href} className={plainLink}>
              {link.label}
            </Link>
          ))}
          <Link
            href={navCta.href}
            className="whitespace-nowrap rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-onbrown hover:bg-wine navtight:px-5 navtight:py-[11px] navtight:text-[14px]"
          >
            {navCta.label}
          </Link>
        </div>

        {/* Narrow screens: hamburger opening a full-screen cream menu. */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-menu"
          className="hidden h-11 w-11 flex-col items-end justify-center gap-[6px] navstack:flex"
        >
          <span className="sr-only">Open menu</span>
          <span aria-hidden="true" className="block h-[2px] w-7 bg-espresso" />
          <span aria-hidden="true" className="block h-[2px] w-7 bg-espresso" />
          <span aria-hidden="true" className="block h-[2px] w-5 bg-espresso" />
        </button>
      </div>

      {mobileNavOpen ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-gutter-mobile pb-10 pt-[26px]"
        >
          <div className="flex items-center justify-between border-b border-hairline pb-[18px]">
            <span className="font-mark text-[18px] font-semibold leading-[1.05] tracking-utility text-espresso lowercase">
              {navWordmark}
            </span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="flex h-11 w-11 items-center justify-center font-sans text-[24px] leading-none text-espresso hover:text-wine"
            >
              <span className="sr-only">Close menu</span>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-[56px] items-center font-mark text-[28px] font-semibold tracking-utility text-espresso hover:text-wine"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={readLink.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex min-h-[56px] items-center font-serif text-[26px] leading-[1.1] text-wine hover:text-wine-pressed"
            >
              {readLink.label}
            </Link>
            {navLinksAfter.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-[56px] items-center font-mark text-[28px] font-semibold tracking-utility text-espresso hover:text-wine"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href={navCta.href}
            onClick={() => setMobileNavOpen(false)}
            className="mt-6 flex min-h-[56px] items-center justify-center rounded-button bg-brown px-5 font-sans text-[16px] font-semibold text-onbrown hover:bg-wine"
          >
            {navCta.label}
          </Link>
        </div>
      ) : null}
    </nav>
  )
}
