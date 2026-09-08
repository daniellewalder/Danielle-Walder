'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { menuGroups, navWordmark, primaryNav, type NavLink } from '@/lib/content/site'

/**
 * Header and site menu.
 *
 * The header is deliberately short: the wordmark, four things Danielle wants
 * people to find without looking, and the menu. Everything else — the search
 * tool, the valuation tool, about, contact — lives one click away in the menu
 * rather than competing for the same row. A row of seven items with two filled
 * buttons is what every brokerage template does; this is not that.
 *
 * The hamburger is part of the system, not a mobile fallback: it is visible at
 * every width and carries its own utility label, so on desktop it reads as a
 * deliberate control rather than a phone menu that escaped.
 *
 * The menu is a full-bleed paper panel whose own header row sits exactly where
 * the page's header row sits, so opening it reads as the page folding open.
 * That also means no scrim — a translucent wash would be a colour the token
 * file does not have.
 *
 * Nothing animates. Hover is a colour swap, per the motion rule.
 */
export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** Escape and the close control both return focus to where it came from. */
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    triggerRef.current?.focus()
  }, [])

  /** A link navigates away, so it closes without pulling focus backwards. */
  const closeForNavigation = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return

    closeRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
        return
      }

      // The page behind the panel stays out of the tab order: the panel is
      // opaque and full-bleed, so reaching it with a keyboard would move focus
      // somewhere nobody can see.
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = active instanceof Node && panel.contains(active)

      if (event.shiftKey && (!inside || active === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <nav aria-label="Primary" className="wrap pt-[26px]">
      <div className="flex items-center justify-between gap-12 border-b border-hairline pb-[22px] navstack:gap-6">
        <Link href="/" className={wordmarkStyle}>
          {navWordmark}
        </Link>

        <div className="flex items-center gap-11 navstack:gap-0">
          {/* The four approved links. Below navstack the menu carries them. */}
          <div className="flex items-center gap-8 whitespace-nowrap navstack:hidden">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[44px] items-center ${headerLinkStyle(link.voice)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label="Open site menu"
            className="flex h-11 items-center gap-[10px] text-espresso hover:text-wine"
          >
            <span aria-hidden="true" className="flex flex-col items-end gap-[5px]">
              <span className="block h-[1.5px] w-[22px] bg-current" />
              <span className="block h-[1.5px] w-[22px] bg-current" />
              <span className="block h-[1.5px] w-[22px] bg-current" />
            </span>
            <span className="font-sans text-[11.5px] font-bold uppercase tracking-label">
              menu
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          ref={panelRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-paper"
        >
          <div className="wrap flex min-h-svh flex-col pb-16 pt-[26px] mobile:pb-12">
            {/*
              The same lockup as the header above, in the same place, so the
              panel replaces the page rather than covering it.
            */}
            <div className="flex items-center justify-between gap-12 border-b border-hairline pb-[22px] navstack:gap-6">
              <Link href="/" onClick={closeForNavigation} className={wordmarkStyle}>
                {navWordmark}
              </Link>

              <button
                ref={closeRef}
                type="button"
                onClick={closeMenu}
                aria-label="Close site menu"
                className="flex h-11 items-center gap-[10px] text-espresso hover:text-wine"
              >
                <span aria-hidden="true" className="relative block h-[22px] w-[22px]">
                  <span className="absolute left-0 top-[10px] block h-[1.5px] w-[22px] rotate-45 bg-current" />
                  <span className="absolute left-0 top-[10px] block h-[1.5px] w-[22px] -rotate-45 bg-current" />
                </span>
                <span className="font-sans text-[11.5px] font-bold uppercase tracking-label">
                  close
                </span>
              </button>
            </div>

            {/*
              Two columns, not three equal ones: the primary list is the panel,
              and the utility groups sit beside it behind a hairline. Hierarchy
              comes from the column, the rule and the whitespace — the type
              barely moves.
            */}
            {/*
              Top-and-bottom, not marooned in the middle: the primary list
              hangs off the header rule and the utility groups sit on a rule
              along the foot of the panel. The height gets used deliberately
              instead of becoming an empty sheet with links sprinkled on it.
            */}
            <ul className="flex flex-1 flex-col gap-[18px] pt-16 tablet:pt-10 mobile:gap-4 mobile:pt-8">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeForNavigation}
                    className={`flex min-h-[44px] items-center ${menuPrimaryStyle(link.voice)}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex gap-24 border-t border-hairline pt-9 mobile:flex-col mobile:gap-7 mobile:pt-7">
              {menuGroups.map((group) => (
                <div key={group.heading} className="flex min-w-0 flex-col gap-3">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-label text-taupe">
                    {group.heading}
                  </h2>
                  <ul className="flex flex-col gap-[6px]">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={closeForNavigation}
                          className="flex min-h-[44px] items-center font-sans text-[16px] text-warmgray hover:text-wine"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

const wordmarkStyle =
  'flex min-h-[44px] items-center whitespace-nowrap font-mark text-[26px] font-semibold leading-[1.05] tracking-utility text-espresso lowercase hover:text-wine navtight:text-[22px] mobile:max-w-[62%] mobile:whitespace-normal mobile:text-[18px]'

/**
 * Header voices. The publication takes Kalnia and wine because it is a
 * masthead; the showing handoff takes wine and a heavier weight because it is
 * the one real-estate action up here. Both stay text.
 */
function headerLinkStyle(voice: NavLink['voice']) {
  if (voice === 'publication') {
    return 'font-serif text-[18px] leading-none text-wine hover:text-wine-pressed'
  }
  if (voice === 'action') {
    return 'font-sans text-[16px] font-semibold text-wine hover:text-wine-pressed'
  }
  return 'font-sans text-[16px] font-medium text-espresso hover:text-wine'
}

/** The same three voices in the menu, one step up in size and no further. */
function menuPrimaryStyle(voice: NavLink['voice']) {
  if (voice === 'publication') {
    return 'font-serif text-[21px] leading-[1.15] text-wine hover:text-wine-pressed mobile:text-[19px]'
  }
  if (voice === 'action') {
    return 'font-sans text-[20px] font-semibold text-wine hover:text-wine-pressed mobile:text-[18px]'
  }
  return 'font-sans text-[20px] font-medium text-espresso hover:text-wine mobile:text-[18px]'
}
