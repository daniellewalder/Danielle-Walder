'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  drawerAction,
  drawerGroups,
  headerNav,
  headerSearch,
  navWordmark,
  siteName,
  type NavLink,
} from '@/lib/content/site'

/**
 * Site header and menu drawer.
 *
 * One horizontal header at every width, ~81px tall on desktop and ~71px on a
 * phone. At 1200px and up it carries the five strongest products and actions
 * in full; below that it keeps the wordmark, "search homes" where there is
 * room for it, and a menu button.
 *
 * The menu is a right-hand drawer, not a full-screen takeover: it stops short
 * of the edge so the page stays visible behind a quiet espresso wash, which is
 * what keeps it feeling like part of the site rather than a separate app. It
 * carries utilities and the deeper navigation layer — no previews, no
 * subscribe point, no promotional copy.
 *
 * The drawer stays mounted and slides. Closed it is `invisible`, which takes
 * it out of the tab order without the layout shift a mount would cause, and
 * lets the transition run in both directions. Motion is one 200ms ease-out
 * slide and nothing else; the global reduced-motion rule flattens it.
 */
export function SiteNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** Escape, the overlay and the close control all hand focus back. */
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    triggerRef.current?.focus()
  }, [])

  /** A link navigates away, so it closes without pulling focus backwards. */
  const closeForNavigation = useCallback(() => setDrawerOpen(false), [])

  useEffect(() => {
    if (!drawerOpen) return

    closeRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        triggerRef.current?.focus()
        return
      }

      // While the drawer acts modal the page behind it stays out of the tab
      // order — otherwise focus wanders off behind the overlay where nobody
      // can see it.
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
  }, [drawerOpen])

  return (
    <header className="wrap pt-[20px] mobile:pt-[14px]">
      <div className="flex items-center justify-between gap-10 border-b border-hairline pb-[16px] navstack:gap-5 mobile:gap-4 mobile:pb-[12px]">
        <Link href="/" className={wordmarkStyle}>
          {navWordmark}
        </Link>

        <div className="flex items-center gap-7 navstack:gap-5 mobile:gap-3">
          {/* 1200px and up: the full row, no menu button. */}
          <nav
            aria-label="Primary"
            className="flex items-center gap-7 whitespace-nowrap navstack:hidden"
          >
            {headerNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[44px] items-center ${headerLinkStyle(link.voice)}`}
              >
                {link.label}
                {link.voice === 'action' ? (
                  <span aria-hidden="true" className="ml-[5px]">
                    &rarr;
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          {/*
            Below 1200px the search tool keeps its place beside the button —
            it is the one thing people arrive looking for. On a phone it drops
            rather than crowd the wordmark, and the drawer carries it.
          */}
          <Link
            href={headerSearch.href}
            data-compact-search=""
            className="hidden min-h-[44px] items-center whitespace-nowrap font-sans text-[15px] font-medium text-espresso hover:text-wine navstack:flex mobile:hidden"
          >
            {headerSearch.label}
          </Link>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            aria-label="Open menu"
            className="hidden h-11 w-11 flex-col items-end justify-center gap-[5px] text-espresso hover:text-wine navstack:flex"
          >
            <span aria-hidden="true" className="block h-[1.5px] w-[24px] bg-current" />
            <span aria-hidden="true" className="block h-[1.5px] w-[24px] bg-current" />
            <span aria-hidden="true" className="block h-[1.5px] w-[24px] bg-current" />
          </button>
        </div>
      </div>

      {/*
        Always mounted so it can slide, and `invisible` when closed so nothing
        inside it is focusable or clickable. `overflow-hidden` keeps the
        parked panel from adding a scrollbar to the page.
      */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${
          drawerOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/*
          A wash, not a wall: the page stays readable behind it. Click-to-close
          only — a plain element on purpose, since aria-hidden on anything
          focusable is a defect, and Escape and the close control are the
          keyboard paths.
        */}
        <div
          aria-hidden="true"
          onClick={closeDrawer}
          className={`absolute inset-0 bg-espresso/30 transition-opacity duration-200 ease-out ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          ref={panelRef}
          id="site-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute right-0 top-0 flex h-full w-[480px] max-w-[62vw] flex-col overflow-y-auto border-l border-hairline bg-paper transition-transform duration-200 ease-out mobile:w-[82vw] mobile:max-w-[380px] ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-8 py-[14px] mobile:px-6">
            {/*
              The short mark, not the full wordmark: at 375px the full one
              wraps to two lines and takes the drawer header with it. You are
              already on the site — this only has to say whose drawer it is.
            */}
            <span className="font-mark text-[17px] font-semibold leading-[1.15] tracking-utility text-espresso lowercase mobile:text-[16px]">
              {siteName}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              className="-mr-2 flex h-11 shrink-0 items-center justify-center gap-2 px-2 text-espresso hover:text-wine mobile:w-11"
            >
              <span aria-hidden="true" className="relative block h-[18px] w-[18px]">
                <span className="absolute left-0 top-[8px] block h-[1.5px] w-[18px] rotate-45 bg-current" />
                <span className="absolute left-0 top-[8px] block h-[1.5px] w-[18px] -rotate-45 bg-current" />
              </span>
              <span className="font-sans text-[11.5px] font-bold uppercase tracking-label mobile:hidden">
                close
              </span>
            </button>
          </div>

          <nav aria-label="Menu" className="flex flex-col px-8 mobile:px-6">
            {drawerGroups.map((group) => (
              <div
                key={group.heading}
                className="flex flex-col gap-3 border-b border-hairline py-7 mobile:py-6"
              >
                {/*
                  Not a heading. These label groups of links inside a nav; they
                  are not sections of the page, and as <h2> they sat above the
                  page's own <h1> in every document's outline. The grouping is
                  kept by naming each list with its label instead.
                */}
                <p
                  id={groupLabelId(group.heading)}
                  className="text-[11.5px] font-bold uppercase tracking-label text-taupe"
                >
                  {group.heading}
                </p>
                <ul aria-labelledby={groupLabelId(group.heading)} className="flex flex-col">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeForNavigation}
                        className={`flex min-h-[44px] items-center ${drawerLinkStyle(link.voice)}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/*
              The one action, after the rule. Full width because the drawer is
              narrow, outlined rather than filled because wine is ink on this
              site and never a field.
            */}
            <Link
              href={drawerAction.href}
              onClick={closeForNavigation}
              className="my-8 flex min-h-[44px] items-center justify-center rounded-button border border-wine px-5 py-[13px] font-sans text-[16px] font-semibold text-wine hover:border-wine-pressed hover:text-wine-pressed mobile:my-7"
            >
              {drawerAction.label}
              <span aria-hidden="true" className="ml-[5px]">
                &rarr;
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

/** Ties a drawer group's list to its visible label without a heading. */
function groupLabelId(heading: string) {
  return `menu-group-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

const wordmarkStyle =
  'flex min-h-[44px] items-center whitespace-nowrap font-mark text-[26px] font-semibold leading-[1.05] tracking-utility text-espresso lowercase hover:text-wine navtight:text-[22px] mobile:min-w-0 mobile:whitespace-normal mobile:text-[16px]'

/**
 * Header voices. The publication takes Kalnia and wine because it is a
 * masthead; the showing handoff takes wine, a heavier weight and an arrow
 * because it is the site's main action. Both stay text — neither is a button.
 */
function headerLinkStyle(voice: NavLink['voice']) {
  if (voice === 'publication') {
    return 'font-serif text-[17px] leading-none text-wine hover:text-wine-pressed'
  }
  if (voice === 'action') {
    return 'font-sans text-[15px] font-semibold text-wine hover:text-wine-pressed'
  }
  return 'font-sans text-[15px] font-medium text-espresso hover:text-wine'
}

/** The same voices in the drawer, one restrained step up on a phone. */
function drawerLinkStyle(voice: NavLink['voice']) {
  if (voice === 'publication') {
    return 'font-serif text-[18px] leading-[1.2] text-wine hover:text-wine-pressed mobile:text-[20px]'
  }
  return 'font-sans text-[17px] text-espresso hover:text-wine mobile:text-[20px]'
}
