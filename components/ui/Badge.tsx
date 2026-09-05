import type { BadgeVariant } from '@/lib/types'

const variants: Record<BadgeVariant, string> = {
  butter: 'bg-butter-field text-butter-text',
  blue: 'bg-blue-field text-blue-ink',
  sage: 'bg-sage-field text-sage-deep',
  brown: 'bg-brown text-onbrown',
}

/**
 * At most one badge per listing, only when it carries real information, and it
 * sits in the row under the photo — never floating on top of it.
 */
export function Badge({
  children,
  variant = 'butter',
  className = '',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-badge px-[11px] py-[6px] text-[11.5px] font-bold uppercase tracking-badge ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
