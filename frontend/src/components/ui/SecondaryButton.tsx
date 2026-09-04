// Botão de ação secundária — discreto, sem a cor de destaque.

import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export function SecondaryButton({
  children,
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'rounded-full border border-border bg-transparent px-6 py-3 font-medium text-text-secondary',
        'transition-colors hover:border-accent hover:text-text-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}