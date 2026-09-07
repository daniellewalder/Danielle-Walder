import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  assetKey,
  imageFromContent,
  imageFromEnclosure,
  imageFromMediaTags,
  pickEssayImage,
  stripLeadingCoverImage,
} from './images.ts'

/**
 * Essay artwork belongs to the essay. These tests exist so an image can never
 * bleed from one post to another, and so a cover Substack actually supplied is
 * never silently dropped.
 */

const cdn = (w: number, key: string) =>
  `https://substackcdn.com/image/fetch/w_${w},c_limit,f_auto,q_auto:good/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F${key}.jpeg`

const enclosure = (url: string) => ({ '@_url': url, '@_type': 'image/jpeg' })

// ------------------------------------------------------------- enclosure

test('the enclosure cover is taken when present', () => {
  assert.equal(imageFromEnclosure(enclosure(cdn(1200, 'a'))), cdn(1200, 'a'))
})

test('a non-image enclosure is ignored', () => {
  assert.equal(imageFromEnclosure({ '@_url': 'https://x/a.mp3', '@_type': 'audio/mpeg' }), null)
})

test('a data: or javascript: enclosure is refused', () => {
  assert.equal(imageFromEnclosure({ '@_url': 'data:image/png;base64,AAA', '@_type': 'image/png' }), null)
  assert.equal(imageFromEnclosure({ '@_url': 'javascript:alert(1)', '@_type': 'image/png' }), null)
})

// ----------------------------------------------------------- media tags

test('a media:content cover is found when there is no enclosure', () => {
  assert.equal(imageFromMediaTags({ 'media:content': enclosure(cdn(1456, 'b')) }), cdn(1456, 'b'))
})

// --------------------------------------------------------- body fallback

test('the first meaningful body image is used when nothing else declares one', () => {
  const html = `<figure><img src="${cdn(1456, 'c')}" /></figure><p>Body.</p>`
  assert.equal(imageFromContent(html), cdn(1456, 'c'))
})

test('avatars, logos, badges and buttons are never mistaken for artwork', () => {
  for (const bad of [
    'https://substackcdn.com/image/fetch/w_64,c_limit/https%3A%2F%2Favatar.jpg',
    'https://substack.com/img/substack_logo.png',
    'https://example.com/subscribe-badge.png',
    'https://example.com/share-button.png',
  ]) {
    assert.equal(imageFromContent(`<img src="${bad}">`), null, bad)
  }
})

test('a tracking pixel is never mistaken for artwork', () => {
  assert.equal(imageFromContent('<img src="https://x.test/p.gif" width="1" height="1">'), null)
})

test('a small CDN width is treated as furniture, a large one as artwork', () => {
  assert.equal(imageFromContent(`<img src="${cdn(80, 'avatarish')}">`), null)
  assert.equal(imageFromContent(`<img src="${cdn(1456, 'real')}">`), cdn(1456, 'real'))
})

test('an image classed as an avatar is skipped even at a large size', () => {
  const html = `<img class="avatar-image" src="${cdn(1456, 'x')}"><img src="${cdn(1456, 'y')}">`
  assert.equal(imageFromContent(html), cdn(1456, 'y'))
})

test('no images at all yields null, never a guess', () => {
  assert.equal(imageFromContent('<p>Just words.</p>'), null)
  assert.equal(imageFromContent(null), null)
})

// ---------------------------------------- the scenario from the brief

const A = { enclosure: enclosure(cdn(1200, 'imageA')) }
const B = { enclosure: enclosure(cdn(1200, 'imageB')) }
const C = {} // no enclosure, but a real cover inside its own body
const D = {} // genuinely no image anywhere

test('A gets only image A and B gets only image B', () => {
  const a = pickEssayImage(A, '<p>A body.</p>')
  const b = pickEssayImage(B, '<p>B body.</p>')
  assert.equal(a, cdn(1200, 'imageA'))
  assert.equal(b, cdn(1200, 'imageB'))
  assert.notEqual(a, b, 'artwork must never bleed between essays')
})

test('C recovers its cover from its own body when the enclosure is missing', () => {
  assert.equal(pickEssayImage(C, `<figure><img src="${cdn(1456, 'imageC')}"></figure><p>C.</p>`), cdn(1456, 'imageC'))
})

test('D stays honestly image-less', () => {
  assert.equal(pickEssayImage(D, '<p>D has no pictures.</p>'), null)
})

test('the body fallback only ever reads its own item', () => {
  // C's body must not be able to supply an image to D.
  assert.equal(pickEssayImage(D, null), null)
})

// --------------------------------------------- duplicate cover on /read/[slug]

test('a body that repeats the cover has that leading copy removed', () => {
  const body = `<figure><img src="${cdn(1456, 'same')}"></figure><p>Words.</p>`
  const out = stripLeadingCoverImage(body, cdn(1200, 'same'))
  assert.ok(!out?.includes('<img'), 'the duplicate cover should be gone')
  assert.ok(out?.includes('<p>Words.</p>'), 'the essay itself must survive')
})

test('the same asset at different CDN widths is recognised as the same picture', () => {
  assert.equal(assetKey(cdn(1456, 'k')), assetKey(cdn(400, 'k')))
  assert.notEqual(assetKey(cdn(1456, 'k')), assetKey(cdn(1456, 'other')))
})

test('a DIFFERENT leading image is left alone', () => {
  const body = `<figure><img src="${cdn(1456, 'different')}"></figure><p>Words.</p>`
  assert.equal(stripLeadingCoverImage(body, cdn(1200, 'cover')), body)
})

test('inline images further down the body are never stripped', () => {
  const body = `<p>Opening paragraph.</p><img src="${cdn(1456, 'same')}"><p>More.</p>`
  const out = stripLeadingCoverImage(body, cdn(1200, 'same'))
  assert.equal(out, body, 'body images are content')
})

test('no cover means the body is untouched', () => {
  const body = `<img src="${cdn(1456, 'x')}"><p>Hi.</p>`
  assert.equal(stripLeadingCoverImage(body, null), body)
})
