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
  /**
   * Background class for the empty state, so the block belongs to its
   * section's colour family. One family per section: a sand rectangle inside
   * a blue or butter block is a second family and reads as a missing asset
   * rather than a composition. Defaults to sand, which is right on cream.
   */
  tone?: string
}

/**
 * Until real photos exist, this renders a quiet tonal block in the section's
 * own colour family. Never fill it with stock or generated photography — an
 * empty slot is honest, a borrowed face or a stock kitchen is a claim about a
 * person or a property that is not true. That rule has no exceptions, and
 * "the site looks unfinished" is not one.
 *
 * THE SLOT NAME IS DEVELOPMENT-ONLY. `[ADD DANIELLE PHOTO]` is a production
 * note to us, and printing it on a public page says "unfinished" far louder
 * than an empty block does. In production the block carries no text and is
 * decorative — it makes no claim, it just does not have a photograph in it
 * yet. The missing photography is still a launch blocker; see README. Do not
 * read a silent block as the blocker being cleared.
 *
 * Local assets go through next/image and get optimised. Remote ones do not:
 * essay covers come from whatever host Substack happens to use, and next/image
 * throws a hard runtime error on any hostname missing from next.config. A
 * crashed page is a far worse trade than an unoptimised image, and these are
 * already CDN-served at a sane size.
 */
export function ImageSlot({
  image,
  className = '',
  sizes,
  priority,
  hoverScale,
  tone = 'bg-sand',
}: ImageSlotProps) {
  // Statically replaced at build time, so the label never reaches a production
  // bundle — but stays loud for whoever is building the page.
  const showLabel = process.env.NODE_ENV !== 'production'

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
          // Nothing to announce: there is no photograph here, and a screen
          // reader saying so on every empty slot is noise, not information.
          aria-hidden="true"
          className={`flex h-full w-full items-center justify-center ${tone} ${scale}`}
        >
          {showLabel ? (
            <span className="text-[12px] font-bold uppercase tracking-kicker text-warmgray">
              {image.label}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
