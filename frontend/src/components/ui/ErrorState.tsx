// Bloco de erro genérico — usado sempre que uma chamada de API falha.
// Nunca deixa spinner infinito: mostra mensagem e botão de retry.

import { Icon } from './Icon'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Algo deu errado. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-2xl mx-auto p-8 rounded-3xl bg-surface-container-high/40 backdrop-blur-3xl border border-surface-bright/20 desert-glow">
      <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-error-container/20 text-error border border-error/20 font-label-sm text-label-sm uppercase tracking-widest">
        <Icon name="warning" className="mr-2 text-[16px]" />
        Sinal Interrompido
      </div>

      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-xl hover:shadow-[0_0_20px_rgba(248,189,75,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Icon name="sync" className="transition-transform group-hover:rotate-180 duration-500" />
          Tentar Novamente
        </button>
      )}
    </div>
  )
}