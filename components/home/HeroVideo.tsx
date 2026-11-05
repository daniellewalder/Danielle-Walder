'use client'

import { useEffect, useState } from 'react'
import type { EditorialVideoAsset } from '@/lib/content/editorialMedia'

/**
 * The hero's footage. The poster paints first and is what remains under
 * reduced motion, Save-Data or a slow connection; the video mounts over it
 * only when none of those apply. Muted, inline, looping and aria-hidden — it
 * is atmosphere, and the poster's alt text carries the meaning.
 *
 * Both share the `hero__back` box, so the opening animation sizes and crops
 * them as one, and the swap cannot shift layout.
 */
export function HeroVideo({ asset }: { asset: EditorialVideoAsset }) {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection
    if (connection?.saveData) return
    if (connection?.effectiveType && /^(slow-)?2g$|^3g$/.test(connection.effectiveType)) return
    // Mounting from an effect keeps the server render to the poster alone.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client capability check
    setShowVideo(true)
  }, [])

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- sized and cropped with the hero animation */}
      <img
        className="hero__back hero__back--media"
        src={asset.poster}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        fetchPriority="high"
      />
      {showVideo ? (
        <video
          // Stays transparent until frames are actually playing, so the poster
          // underneath is never covered by an empty black box while it loads.
          onPlaying={(event) => event.currentTarget.classList.add('is-playing')}
          className="hero__back hero__back--media"
          src={asset.src}
          poster={asset.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : null}
    </>
  )
}
