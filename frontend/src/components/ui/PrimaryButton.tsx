// Botão de ação principal — usa a cor de destaque (cta) da paleta.

import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function PrimaryButton({
  children,
  className,
  isLoading = false,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-full bg-cta px-6 py-3 font-semibold text-text-primary',
        'transition-colors hover:bg-cta-hover',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Carregando…' : children}
    </button>
  )
}