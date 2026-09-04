// Wrapper para ícones Material Symbols Outlined.
// Uso: <Icon name="cloud_upload" />

import clsx from 'clsx'

interface IconProps {
  name: string
  className?: string
  filled?: boolean
}

export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      className={clsx('material-symbols-outlined', className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}