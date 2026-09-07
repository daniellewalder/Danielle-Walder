/**
 * Editorial media registry.
 *
 * Stock Los Angeles imagery used as editorial punctuation — LA, Actually,
 * Overthinking Real Estate, future essays and area-guide storytelling.
 *
 * THIS IS NOT PROPERTY OR PORTRAIT PHOTOGRAPHY, and the distinction is the
 * whole point of keeping it in its own registry and its own components:
 *
 *   - Danielle portraits and listing/sold photos use `ImageSlot`, which shows
 *     a labelled empty rectangle until real photography exists. Stock does not
 *     satisfy that and must never be used to fill one.
 *   - Nothing here is Danielle, her listing, her sale, or her client, and
 *     nothing here may be placed where a reader could infer otherwise.
 *
 * NO LOCATION METADATA. Not one of these files has a verified location, so no
 * record names a neighborhood or a city, and alt text describes what is
 * visible rather than where it is. See PROVENANCE.md in the asset folder.
 */

export type MediaOrientation = 'landscape' | 'portrait'

interface EditorialMediaBase {
  /** Describes what is visible. Never a place name, never a claim. */
  alt: string
  orientation: MediaOrientation
  width: number
  height: number
  /** CSS object-position when the natural centre is the wrong crop. */
  objectPosition?: string
  /** Optional short line rendered under the media. */
  caption?: string
}

export interface EditorialImageAsset extends EditorialMediaBase {
  kind: 'image'
  src: string
}

export interface EditorialVideoAsset extends EditorialMediaBase {
  kind: 'video'
  src: string
  /** Always present: the video never renders without a still to stand in. */
  poster: string
  durationSeconds: number
  /** Approximate transfer weight, so call sites can reason about it. */
  approxBytes: number
}

export type EditorialMediaAsset = EditorialImageAsset | EditorialVideoAsset

export const editorialMedia = {
  /**
   * Aerial coastline. Wide and cinematic — suits a full-bleed band.
   * The coast is not identified and must not be captioned as a named city.
   */
  coastalAerial: {
    kind: 'video',
    src: '/media/editorial/la-coast-aerial-horizontal-web.mp4',
    poster: '/media/editorial/la-coast-aerial-horizontal-poster.jpg',
    alt: 'Aerial view of a coastline meeting dense low-rise development.',
    orientation: 'landscape',
    width: 1920,
    height: 1080,
    durationSeconds: 12.5,
    approxBytes: 9_942_889,
  },

  /**
   * Palm-lined street, shot vertically. Suits a narrow column or a mobile
   * moment — never stretched across a horizontal hero.
   */
  palmStreet: {
    kind: 'video',
    src: '/media/editorial/la-palms-street-vertical-web.mp4',
    poster: '/media/editorial/la-palms-street-vertical-poster.jpg',
    alt: 'A residential street lined with tall palms.',
    orientation: 'portrait',
    width: 1080,
    height: 1920,
    durationSeconds: 14,
    approxBytes: 11_662_688,
  },
} satisfies Record<string, EditorialMediaAsset>

/*
 * Two stills were described but not supplied, so they are deliberately absent
 * rather than stubbed with a broken path:
 *   - a horizontal residential scene (white homes, palms)
 *   - a vertical green hills / freeway scene
 * EditorialImage already handles both; adding them is a registry entry.
 */
