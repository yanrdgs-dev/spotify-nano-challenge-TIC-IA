// Container genérico com fundo de superfície e borda — base visual reutilizável.

import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-surface border border-border p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}