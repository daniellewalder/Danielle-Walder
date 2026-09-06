import { renderableFact } from '@/lib/areas'
import type { FactBlock } from '@/lib/areas/types'

/**
 * A block of verified factual copy.
 *
 * Renders nothing at all when the block is absent or fails the verification
 * gate — no heading, no empty container, no "coming soon". The heading is
 * optional because the orientation block carries none by design.
 */
export function FactSection({
  heading,
  block,
  divider = true,
}: {
  heading?: string
  block: FactBlock | null
  /** The first block sits under PageHeader's own rule and needs no second one. */
  divider?: boolean
}) {
  const verified = renderableFact(block)
  if (!verified) return null

  return (
    <section className="wrap pt-12 mobile:pt-9">
      <div className={divider ? 'border-t border-hairline pt-10 mobile:pt-8' : ''}>
        {heading ? (
          <h2 className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile">
            {heading}
          </h2>
        ) : null}

        <div className={heading ? 'mt-6' : ''}>
          {verified.body.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-measure font-sans text-[18px] leading-[1.6] text-warmgray [&+p]:mt-5 mobile:text-[17px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
