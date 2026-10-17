'use client'

import { usePathname } from 'next/navigation'

/**
 * The homepage carries its own bar (inside the hero) and its own footer card,
 * so the shared site header and footer stand down there. Every other page
 * keeps them. The homepage footer renders the same licence lines verbatim.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  return usePathname() === '/' ? null : <>{children}</>
}
