// Tela inicial ("Echoes") — histórico de análises, com destaque para
// a de maior pontuação e um resumo de métricas de vibe.

import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { getGenreLabel } from '../lib/labels'
import { NavigationDrawer } from '../components/domain/NavigationDrawer'
import { BottomNavBar } from '../components/domain/BottomNavBar'
import { Icon } from '../components/ui/Icon'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { Spinner } from '../components/ui/Spinner'
import { ErrorState } from '../components/ui/ErrorState'

export function SummaryPage() {
  const navigate = useNavigate()
  const { data: analyses, isLoading, error, reload } = useAsyncData(
    () => api.listRecentAnalyses(),
    [],
  )

  const topAnalysis = analyses
    ? [...analyses].sort((a, b) => b.vibeScore - a.vibeScore)[0]
    : null
  const rest = analyses?.filter((a) => a.analysisId !== topAnalysis?.analysisId) ?? []

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 backdrop-blur-xl bg-surface-container shadow-[0_0_20px_rgba(255,181,161,0.2)]">
        <Icon name="menu" className="text-primary" />
        <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
          VIBE_LAB
        </span>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden" />
      </header>

      <NavigationDrawer />

      <main className="pt-24 pb-32 md:pl-80 px-margin-mobile md:px-margin-desktop max-w-[var(--spacing-container-max)] mx-auto">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary mb-2">
              Echoes
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Um registro sonoro das suas explorações recentes.
            </p>
          </div>
          <PrimaryButton onClick={() => navigate('/upload')}>
            Analisar nova faixa
          </PrimaryButton>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <ErrorState message="Não foi possível carregar o histórico." onRetry={reload} />
        )}

        {analyses && analyses.length === 0 && (
          <p className="text-on-surface-variant">Nenhuma análise ainda. Envie uma faixa para começar.</p>
        )}

        {topAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Destaque */}
            <button
              onClick={() => navigate(`/results/${topAnalysis.analysisId}`)}
              className="md:col-span-8 glass-sand rounded-2xl p-6 relative overflow-hidden group text-left"
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-32 h-32 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                  <Icon name="graphic_eq" className="text-5xl text-primary" />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="inline-block px-4 py-1 rounded-full bg-tertiary-container/30 text-tertiary-fixed font-label-md text-label-md">
                    Top Resonance
                  </div>
                  <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                    {topAnalysis.trackName}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {getGenreLabel(topAnalysis.genre)}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                    <div className="flex flex-col items-center">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">SCORE</span>
                      <span className="font-headline-md text-headline-md text-secondary">
                        {Math.round(topAnalysis.vibeScore * 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Vibe metrics resumido */}
            <div className="md:col-span-4 bg-surface-container-high rounded-2xl p-6 flex flex-col justify-between bloom-secondary">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Vibe Metrics</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Sua frequência de escuta tende para o quente/psicodélico.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between font-label-sm text-label-sm mb-1">
                    <span className="text-on-surface">Análises</span>
                    <span className="text-secondary">{analyses?.length ?? 0}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[70%] rounded-full shadow-[0_0_10px_rgba(248,189,75,0.5)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de histórico */}
            <div className="md:col-span-12 mt-8">
              <h3 className="font-headline-md text-headline-md text-secondary mb-6 pl-4 border-l-4 border-secondary">
                Recent Analysis
              </h3>
              <div className="space-y-4">
                {rest.map((analysis, i) => (
                  <div key={analysis.analysisId}>
                    <button
                      onClick={() => navigate(`/results/${analysis.analysisId}`)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-high transition-colors duration-300 group w-full text-left"
                    >
                      <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 group-hover:bloom-primary transition-all duration-300">
                        <Icon name="album" className="text-2xl text-on-surface-variant" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline-md text-headline-md text-on-surface text-lg">
                          {analysis.trackName}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                          {getGenreLabel(analysis.genre)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-headline-md text-headline-md text-secondary">
                          {Math.round(analysis.vibeScore * 100)}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">SCORE</span>
                      </div>
                    </button>
                    {i < rest.length - 1 && (
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavBar />
    </>
  )
}