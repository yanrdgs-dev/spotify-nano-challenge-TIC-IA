// Caixinha genérica de rótulo + valor — usada para exibir métricas isoladas.

import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatBoxProps {
  label: string
  value: ReactNode
  className?: string
}

export function StatBox({ label, value, className }: StatBoxProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-surface-elevated border border-border px-4 py-3',
        className,
      )}
    >
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  )
}