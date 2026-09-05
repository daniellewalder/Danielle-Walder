'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { navCta, navLinks, overthinkingLink, siteName } from '@/lib/content/site'

/**
 * Nav is not sticky in the approved design. If it is ever made sticky it stays
 * on cream with the hairline — no shadow, no blur.
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

  const plainLink = 'font-sans text-[14.5px] font-medium text-espresso hover:text-wine'

  return (
    <nav aria-label="Primary" className="wrap pt-[26px]">
      <div className="flex items-center justify-between gap-7 border-b border-hairline pb-[18px]">
        <Link
          href="/"
          className="whitespace-nowrap font-mark text-[18px] font-semibold tracking-utility text-espresso lowercase hover:text-wine"
        >
          {siteName}
        </Link>

        {/* Wide screens: the full row. */}
        <div className="flex items-center gap-[18px] whitespace-nowrap tablet:gap-[14px] navstack:hidden">
          {navLinks.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href} className={plainLink}>
              {link.label}
            </Link>
          ))}
          <Link
            href={overthinkingLink.href}
            className="font-serif text-[16.5px] text-wine hover:text-wine-pressed"
          >
            {overthinkingLink.label}
          </Link>
          {navLinks.slice(3).map((link) => (
            <Link key={link.href} href={link.href} className={plainLink}>
              {link.label}
            </Link>
          ))}
          <Link
            href={navCta.href}
            className="rounded-button bg-brown px-5 py-[11px] font-sans text-[14.5px] font-semibold text-onbrown hover:bg-wine"
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
            <span className="font-mark text-[18px] font-semibold tracking-utility text-espresso lowercase">
              {siteName}
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
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-[56px] items-center font-mark text-[28px] font-semibold tracking-utility text-espresso lowercase hover:text-wine"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={overthinkingLink.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex min-h-[56px] items-center font-serif text-[28px] text-wine hover:text-wine-pressed"
            >
              {overthinkingLink.label}
            </Link>
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex min-h-[56px] items-center font-mark text-[28px] font-semibold tracking-utility text-espresso lowercase hover:text-wine"
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
