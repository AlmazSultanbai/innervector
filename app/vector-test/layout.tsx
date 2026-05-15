import type { ReactNode } from 'react'

// Inherits bg-radial from root body — no override needed
export default function VectorTestLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
