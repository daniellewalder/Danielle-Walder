import Image from 'next/image'
import type { ImageRef } from '@/lib/types'

interface ImageSlotProps {
  image: ImageRef
  /**
   * Frame classes — height and radius come from the caller, because corners
   * carry meaning: square/2–4px is property, 20px soft is Danielle and
   * editorial. Keep that distinction.
   */
  className?: string
  sizes?: string
  priority?: boolean
  /**
   * The optional 1.02 photo scale on listing-card hover. The only motion in
   * the design, and it is skipped under `prefers-reduced-motion`.
   */
  hoverScale?: boolean
}

/**
 * Until real photos exist, this renders a labelled empty rectangle: the slot
 * name in Ink Soft (#6B5F55) on sand (#E3DBCB). Never fill it with stock or
 * generated photography — a visible empty slot is honest, a stock kitchen is a
 * lie about the listing.
 *
 * Local assets go through next/image and get optimised. Remote ones do not:
 * essay covers come from whatever host Substack happens to use, and next/image
 * throws a hard runtime error on any hostname missing from next.config. A
 * crashed page is a far worse trade than an unoptimised image, and these are
 * already CDN-served at a sane size.
 */
export function ImageSlot({ image, className = '', sizes, priority, hoverScale }: ImageSlotProps) {
  const scale = hoverScale
    ? 'motion-safe:transition-transform motion-safe:duration-photo motion-safe:ease-out motion-safe:group-hover:scale-[1.02]'
    : ''

  const isRemote = Boolean(image.src && /^https?:\/\//i.test(image.src))

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {image.src ? (
        isRemote ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary feed host; see note above
          <img
            src={image.src}
            alt={image.alt}
            loading={priority ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover ${scale}`}
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes ?? '100vw'}
            priority={priority}
            className={`object-cover ${scale}`}
          />
        )
      ) : (
        <div
          role="img"
          aria-label={`${image.label} photograph — not supplied yet`}
          className={`flex h-full w-full items-center justify-center bg-sand ${scale}`}
        >
          <span
            aria-hidden="true"
            className="text-[12px] font-bold uppercase tracking-kicker text-warmgray"
          >
            {image.label}
          </span>
        </div>
      )}
    </div>
  )
}
