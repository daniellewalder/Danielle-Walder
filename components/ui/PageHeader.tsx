type HeadingFont = 'display' | 'serif' | 'mark'

const headingStyles: Record<HeadingFont, string> = {
  // Rozha One — section headers. Sentence case, never tracked.
  display: 'font-display text-section tablet:text-section-tablet mobile:text-section-mobile',
  // Kalnia — Overthinking Real Estate and editorial titles.
  serif: 'font-serif text-section tablet:text-section-tablet mobile:text-section-mobile',
  // Unbounded — Danielle's mark and big statements.
  mark: 'font-mark text-[50px] font-semibold leading-[0.96] tracking-display tablet:text-[42px] mobile:text-[32px]',
}

interface PageHeaderProps {
  eyebrow: string
  heading: string
  intro?: string
  headingFont?: HeadingFont
  headingClassName?: string
  /** Rendered under the intro — CTAs, a subscribe link, a note. */
  children?: React.ReactNode
}

/**
 * The page-level version of the homepage section header: eyebrow, heading, a
 * measured intro, and a hairline. Same pattern, same tokens — not a new
 * template.
 */
export function PageHeader({
  eyebrow,
  heading,
  intro,
  headingFont = 'display',
  headingClassName = '',
  children,
}: PageHeaderProps) {
  return (
    <header className="wrap pt-14 mobile:pt-10">
      <div className="border-b border-hairline pb-11 mobile:pb-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className={`mt-4 leading-none text-espresso ${headingStyles[headingFont]} ${headingClassName}`}>
          {heading}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-measure font-sans text-[19px] leading-[1.45] text-warmgray mobile:text-[17px]">
            {intro}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  )
}
