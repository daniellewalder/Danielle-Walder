# Editorial media — provenance

Stock/editorial Los Angeles media. **None of this is Danielle, her listings,
her sold properties, or her clients**, and none of it is evidence that any
photograph was taken in a particular neighborhood.

Rules that go with these files:

- Never use them to fill a Danielle portrait slot or a listing/sold photo slot.
  Those use `ImageSlot`, which shows a labelled empty rectangle until real
  photography exists. That honesty rule is not negotiable and stock does not
  satisfy it.
- Never label one with a place name — Calabasas, Malibu, Santa Monica, or any
  other — unless the exact location has been independently verified. It has
  not been for any file here.
- Alt text describes what is visible, not where it is.

| Shipped file | Supplied as | Notes |
|---|---|---|
| `la-coast-aerial-horizontal-web.mp4` | `14472669-uhd_3840_2160_30fps.mp4` | Web derivative supplied already encoded. H.264, 1920×1080, 12.5s, no audio track. Source was 3840×2160. |
| `la-coast-aerial-horizontal-poster.jpg` | supplied with the above | 1920×1080 still frame. |
| `la-palms-street-vertical-web.mp4` | `13623794-uhd_2160_3840_24fps (1).mp4` | Web derivative supplied already encoded. H.264, 1080×1920, 14.0s, no audio track. Source was 2160×3840. |
| `la-palms-street-vertical-poster.jpg` | supplied with the above | 1080×1920 still frame. |

The raw 4K sources are deliberately **not** committed — they are ~40 MB each
and nothing on the site would ever serve them.

## Not yet supplied

Two stills were described but were not in the upload, so they are not in the
registry and nothing references them:

- `pexels-myatezhny39-30151761.jpg` — horizontal residential scene, white homes
  and palms.
- `pexels-thekameragrapher-15591600.jpg` — vertical green hills / freeway.

When they arrive, add them here and to `lib/content/editorialMedia.ts`. The
`EditorialImage` component already supports them; no new code is needed.
