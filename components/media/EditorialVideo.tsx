'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { EditorialVideoAsset } from '@/lib/content/editorialMedia'

/**
 * A decorative editorial video loop.
 *
 * The poster is the real content. It renders first, through next/image, at the
 * right size for the viewport — so it is what paints, what LCP measures, and
 * what remains if the video never loads. The video is an enhancement layered
 * over it, and it only mounts when all of these are true:
 *
 *   1. The reader has not asked for reduced motion.
 *   2. The reader is not on Save-Data or a 2g/3g connection.
 *   3. The frame is near the viewport.
 *
 * These files are ~10 MB each. Gating them this way is the difference between
 * an editorial flourish and a page that costs ten megabytes to look at. Nothing
 * downloads until (3), because the <video> element does not exist until then.
 *
 * The video is muted, inline, looping, controlless and aria-hidden: it carries
 * atmosphere, not information, and the poster's alt text carries the meaning.
 * It can never make sound — there is no audio track in the file and `muted` is
 * set regardless.
 *
 * Poster and video share one box with a fixed aspect ratio, so the swap cannot
 * shift layout.
 */
export function EditorialVideo({
  asset,
  sizes,
  priority,
  className = '',
  rounded = 'rounded-block',
}: {
  asset: EditorialVideoAsset
  sizes: string
  priority?: boolean
  className?: string
  rounded?: string
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!motionOk) return

    // Respect an explicit data-saving preference and genuinely slow networks.
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
    if (connection?.saveData) return
    if (connection?.effectiveType && /^(slow-)?2g$|^3g$/.test(connection.effectiveType)) return

    const frame = frameRef.current
    if (!frame) return

    // No IntersectionObserver means the poster simply stays. That is a fine
    // outcome — the poster is the content — and it keeps this effect free of a
    // synchronous setState.
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowVideo(true)
          observer.disconnect()
        }
      },
      // Start fetching a little before it is on screen, not a screen early.
      { rootMargin: '200px' },
    )

    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="m-0">
      <div
        ref={frameRef}
        className={`relative w-full overflow-hidden ${rounded} ${className}`}
      >
        <Image
          src={asset.poster}
          alt={asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={asset.objectPosition ? { objectPosition: asset.objectPosition } : undefined}
        />

        {showVideo ? (
          <video
            src={asset.src}
            poster={asset.poster}
            autoPlay
            muted
            loop
            playsInline
            /*
              The element does not exist until the frame is near the viewport,
              so mounting IS the lazy gate — nothing has been fetched before
              this point. preload="none" would fight autoplay and leave a
              silent still where a loop was intended.
            */
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover"
            style={asset.objectPosition ? { objectPosition: asset.objectPosition } : undefined}
          />
        ) : null}
      </div>
      {asset.caption ? (
        <figcaption className="mt-3 font-sans text-[13.5px] leading-[1.5] text-taupe">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
