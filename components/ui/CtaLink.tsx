import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'editorial'
type Tone = 'cream' | 'butter'

/**
 * The three approved link treatments, in one place so every CTA on the site
 * matches the homepage. No new shapes: brown primary at 12px radius, 1.5px
 * outline secondary, and the sage underline for editorial links.
 */
const styles: Record<Variant, string> = {
  primary:
    'inline-flex items-center rounded-button bg-brown px-[26px] py-[14px] font-sans text-[15px] font-semibold hover:bg-wine',
  secondary:
    'inline-flex items-center rounded-button border-[1.5px] border-brown px-[26px] py-[12.5px] font-sans text-[15px] font-semibold text-brown hover:border-sage-olive hover:bg-sage-olive hover:text-cream',
  editorial:
    'inline-flex items-center border-b-2 border-sage-olive pb-[2px] font-sans text-[15px] font-semibold text-sage-olive hover:border-sage-deep hover:text-sage-deep',
}

/** Primary buttons take cream text on cream sections, butter inside butter. */
const primaryTone: Record<Tone, string> = {
  cream: 'text-cream',
  butter: 'text-butter-field',
}

interface CtaLinkProps {
  href: string
  children: React.ReactNode
  variant?: Variant
  tone?: Tone
  external?: boolean
  className?: string
}

export function CtaLink({
  href,
  children,
  variant = 'primary',
  tone = 'cream',
  external,
  className = '',
}: CtaLinkProps) {
  const classes = `${styles[variant]} ${variant === 'primary' ? primaryTone[tone] : ''} ${className}`

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
