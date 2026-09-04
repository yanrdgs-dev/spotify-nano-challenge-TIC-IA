// Tela de confirmação de gênero — o usuário escolhe/confirma o gênero
// detectado. Header minimalista (sem nav), fundo com manchas decorativas.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { api } from '../api'
import { availableGenres } from '../api/fixtures/genres'
import { getGenreLabel } from '../lib/labels'
import type { TrackGenre } from '../types/domain'
import { Icon } from '../components/ui/Icon'
import { ErrorState } from '../components/ui/ErrorState'

export function ConfirmGenrePage() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const [selectedGenre, setSelectedGenre] = useState<TrackGenre | undefined>()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleConfirm = async () => {
    if (!analysisId || !selectedGenre) return
    setIsConfirming(true)
    setError(null)
    try {
      await api.confirmGenre(analysisId, selectedGenre)
      navigate(`/results/${analysisId}`)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Fundo decorativo */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-60">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-surface-tint rounded-full mix-blend-screen filter blur-[150px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-tertiary rounded-full mix-blend-screen filter blur-[200px] opacity-10" />
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-center items-center px-margin-mobile md:px-margin-desktop h-24 backdrop-blur-md bg-background/50 border-b border-surface-container">
        <div className="font-headline-md text-headline-md text-primary tracking-tighter">
          VIBE_LAB
        </div>
      </header>

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-[var(--spacing-container-max)] mx-auto min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Contexto e faixa detectada */}
          <div className="lg:col-span-5 flex flex-col justify-center mb-12 lg:mb-0">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm tracking-wider uppercase mb-6 w-fit">
              Aura Analysis Complete
            </span>
            <h1 className="font-display-lg text-display-lg text-primary mb-6">
              Confirm
              <br />
              <span className="text-on-background">Genre</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md">
              Nossos sensores sônicos analisaram a faixa. Detectamos uma forte ressonância,
              mas o mix final é seu para definir.
            </p>

            {error && (
              <ErrorState message="Não foi possível confirmar o gênero." />
            )}
          </div>

          {/* Grid de seleção */}
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
            <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-12 relative overflow-hidden desert-glow">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

              <h2 className="font-label-md text-label-md text-on-surface-variant mb-8 uppercase tracking-widest text-center md:text-left">
                Selected Frequency
              </h2>

              <div className="flex flex-wrap gap-4 mb-12">
                {availableGenres.map((genre) => {
                  const isActive = genre === selectedGenre
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={clsx(
                        'border px-6 py-3 rounded-[3rem] font-label-md text-label-md transition-all duration-300 hover:scale-105 flex items-center gap-2',
                        isActive
                          ? 'border-primary bg-primary-container/20 text-primary shadow-[0_0_15px_rgba(255,181,161,0.3)]'
                          : 'border-surface-container-highest bg-surface/50 text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                      )}
                    >
                      {isActive && <Icon name="graphic_eq" className="text-[18px]" />}
                      {getGenreLabel(genre)}
                    </button>
                  )
                })}
              </div>

              <div className="shimmer-line h-px w-full mb-8" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  {selectedGenre ? getGenreLabel(selectedGenre) : 'Nenhuma seleção'}
                </span>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedGenre || isConfirming}
                  className="w-full sm:w-auto bg-primary text-on-primary font-headline-md text-body-lg px-8 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(248,189,75,0.4)] transition-all duration-500 hover:bg-secondary flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? 'Confirmando…' : 'Confirm Vibe'}
                  <Icon
                    name="arrow_forward"
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}