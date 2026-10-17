import type { ImageRef } from '@/lib/types'

/**
 * A photograph inside one of the homepage's frames, or — until Danielle
 * supplies it — an honest empty fill. Never stock, never generated.
 *
 * Always a plain <img>: the frames pan the picture with the scroll, which
 * needs it positioned inside a clipping frame, and feed images come from
 * hosts next/image does not know. The frame itself carries the tonal colour,
 * so the empty state is just that colour.
 *
 * The slot name shows in development only, as ImageSlot does.
 */
export function Photo({
  image,
  className,
  priority,
}: {
  image: ImageRef
  className: string
  priority?: boolean
}) {
  if (image.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- positioned for the scroll pan; see above
      <img
        className={className}
        src={image.src}
        alt={image.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  return (
    <span aria-hidden="true" className={`${className} slot-fill`}>
      {process.env.NODE_ENV !== 'production' ? (
        <span className="slot-fill__label">{image.label}</span>
      ) : null}
    </span>
  )
}
