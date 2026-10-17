'use client'

import { useEffect, useState } from 'react'

/**
 * "LA : 07:38 PM" — Danielle's local time, updated on the minute.
 *
 * Rendered empty on the server and filled on mount: a server-rendered time
 * would be minutes stale on a cached page and mismatch on hydration.
 */
export function HeroClock({ label, timeZone }: { label: string; timeZone: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const tick = () => setTime(format.format(new Date()))
    tick()

    let interval: number | undefined
    const timeout = window.setTimeout(
      () => {
        tick()
        interval = window.setInterval(tick, 60_000)
      },
      (60 - new Date().getSeconds()) * 1000,
    )

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [timeZone])

  return (
    <div className="nav__meta">
      <span className="nav__clock t-ui">
        {label} :{time ? ` ${time}` : ''}
      </span>
    </div>
  )
}
