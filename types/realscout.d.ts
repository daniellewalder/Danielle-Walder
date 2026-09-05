import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * RealScout ships custom elements, which JSX does not know about. Declaring
 * them here keeps the pages type-safe without casting to `any`.
 */
type RealScoutElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  'agent-encoded-id': string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'realscout-simple-search': RealScoutElement
    }
  }
}
