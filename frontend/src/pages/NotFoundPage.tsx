// Página 404 — exibida para qualquer rota desconhecida.
// Visual "frequência perdida", fiel ao tema do produto.

import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'

export function NotFoundPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 flex justify-center items-center h-16 backdrop-blur-xl bg-surface/10 shadow-[0_0_20px_rgba(255,181,161,0.2)]">
        <h1 className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
          VIBE_LAB
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-margin-mobile md:px-margin-desktop relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-12">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full glass-panel flex items-center justify-center bloom-primary">
            <Icon name="explore_off" className="text-6xl text-primary opacity-70" />
          </div>

          <div className="space-y-4 max-w-xl">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">
              Frequência Perdida
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Vasculhamos as dunas, mas não encontramos essa página no nosso vault.
            </p>
          </div>

          <div className="w-full shimmer-divider my-4" />

          <Link
            to="/"
            className="font-label-md text-label-md bg-tertiary-container/20 text-on-background px-6 py-2 rounded-full hover:bg-tertiary-container/40 transition-colors duration-300 bloom-secondary hover:text-secondary"
          >
            Voltar ao Início
          </Link>
        </div>
      </main>
    </div>
  )
}