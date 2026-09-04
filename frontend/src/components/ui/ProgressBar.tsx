// Barra de progresso horizontal genérica — recebe um percentual de 0 a 100.

import clsx from 'clsx'

interface ProgressBarProps {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={clsx(
        'h-2 w-full overflow-hidden rounded-full bg-surface-elevated',
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}