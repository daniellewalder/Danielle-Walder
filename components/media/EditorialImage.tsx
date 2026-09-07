import Image from 'next/image'
import type { EditorialImageAsset } from '@/lib/content/editorialMedia'

/**
 * A still from the editorial media registry.
 *
 * DELIBERATELY SEPARATE FROM ImageSlot. ImageSlot governs Danielle's portraits
 * and property photography, where an empty labelled rectangle is the honest
 * state until real photography exists. This component governs stock editorial
 * imagery, which is never a stand-in for either. Keeping them apart is what
 * stops stock quietly filling a listing slot.
 *
 * No card chrome, no border, no shadow, no hover lift. The crop and the
 * proportion do the work.
 */
export function EditorialImage({
  asset,
  sizes,
  priority,
  className = '',
  rounded = 'rounded-block',
}: {
  asset: EditorialImageAsset
  sizes: string
  priority?: boolean
  /** Height/aspect classes. The caller owns the frame. */
  className?: string
  rounded?: string
}) {
  return (
    <figure className="m-0">
      <div className={`relative w-full overflow-hidden ${rounded} ${className}`}>
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={asset.objectPosition ? { objectPosition: asset.objectPosition } : undefined}
        />
      </div>
      {asset.caption ? (
        <figcaption className="mt-3 font-sans text-[13.5px] leading-[1.5] text-taupe">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
