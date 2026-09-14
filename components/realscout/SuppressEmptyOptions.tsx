'use client'

import { useEffect } from 'react'
import { hideEmptyOptions, rootsFor } from '@/lib/realscout/emptyOptions'

/**
 * Runs the empty-state suppression against a RealScout widget.
 *
 * The custom element upgrades asynchronously and only once its script has
 * loaded, so this looks for the host for a short while rather than assuming it
 * is there on mount. Once found it watches for changes, because the panel is
 * created and destroyed as someone types.
 *
 * Renders nothing. If the widget never loads, or its shadow root is closed,
 * every path here is a no-op — it can leave the page exactly as it found it.
 */
export function SuppressEmptyOptions({ selector }: { selector: string }) {
  useEffect(() => {
    const observers: MutationObserver[] = []
    let discovery: ReturnType<typeof setInterval> | undefined
    let deadline: ReturnType<typeof setTimeout> | undefined

    const stopDiscovery = () => {
      if (discovery !== undefined) clearInterval(discovery)
      if (deadline !== undefined) clearTimeout(deadline)
      discovery = undefined
      deadline = undefined
    }

    /** True once there is something to watch, which ends the search. */
    const attach = () => {
      const host = document.querySelector(selector)
      if (!host) return false

      // The light DOM is there immediately; an open shadow root appears only
      // after the element upgrades. Wait for it rather than binding early and
      // missing the root the panel actually lives in.
      if (!host.shadowRoot) return false

      for (const root of rootsFor(host)) {
        hideEmptyOptions(root)
        const observer = new MutationObserver(() => hideEmptyOptions(root))
        observer.observe(root as Node, { childList: true, subtree: true, characterData: true })
        observers.push(observer)
      }

      // Autocompletes commonly render their popup into a portal appended to
      // <body> rather than inside the component, in which case none of the
      // roots above contain it. Watch for those arriving — direct children of
      // body only, so this stays cheap — and scan what actually appeared
      // rather than re-walking the whole page.
      const portals = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (node instanceof HTMLElement) hideEmptyOptions(node)
          }
        }
      })
      portals.observe(document.body, { childList: true })
      observers.push(portals)

      return true
    }

    if (!attach()) {
      discovery = setInterval(() => {
        if (attach()) stopDiscovery()
      }, 200)
      // Give up quietly rather than polling this page forever.
      deadline = setTimeout(stopDiscovery, 20_000)
    }

    return () => {
      stopDiscovery()
      for (const observer of observers) observer.disconnect()
    }
  }, [selector])

  return null
}
