import Link from 'next/link'
import { startHereLinks } from '@/lib/content/site'

export function StartHere() {
  return (
    <div className="wrap pt-[22px]">
      <div className="flex flex-wrap items-center gap-[26px] border-b border-hairline pb-5">
        <span className="eyebrow tracking-label">start here</span>
        {startHereLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-sans text-[14.5px] font-medium text-warmgray hover:text-wine"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
