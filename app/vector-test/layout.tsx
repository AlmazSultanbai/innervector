import type { ReactNode } from 'react'

export default function VectorTestLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'radial-gradient(ellipse at top, #202845 0%, #111628 65%)',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}
