import type { ReactNode } from 'react'

export default function VectorTestLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
