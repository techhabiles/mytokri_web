import type { ReactNode } from 'react'

export default function PageContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>{children}</div>
  )
}
