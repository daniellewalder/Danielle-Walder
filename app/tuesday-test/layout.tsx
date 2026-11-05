import { notFound } from 'next/navigation'
import { isLive } from '@/lib/launch'

/** Hidden on the live site until launched — see lib/launch.ts. */
export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isLive('tuesdayTest')) notFound()
  return children
}
