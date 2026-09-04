// Indicador de carregamento genérico — círculo girando em CSS puro.

import clsx from 'clsx'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-border border-t-accent',
        className,
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Carregando"
    />
  )
}