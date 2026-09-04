// Tela de análise em andamento — barra de carregamento limpa e evidente
// com feedback dos passos reais do processamento DSP e benchmark.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAnalysisPolling } from '../hooks/useAnalysisPolling'
import { Icon } from '../components/ui/Icon'
import { ErrorState } from '../components/ui/ErrorState'

const stepDetails: Record<string, { title: string; subtitle: string; icon: string }> = {
  uploading: {
    title: 'Enviando Áudio',
    subtitle: 'Transferindo arquivo para o processador de sinal...',
    icon: 'cloud_upload',
  },
  'extracting-features': {
    title: 'Extração Psicoacústica (DSP)',
    subtitle: 'Calculando energia, dançabilidade, valência e espectro de frequências...',
    icon: 'graphic_eq',
  },
  'predicting-popularity': {
    title: 'Análise de Masterização & EBU R128',
    subtitle: 'Avaliando True Peak, LUFS integrado, dinâmica e balanço tonal...',
    icon: 'equalizer',
  },
  'comparing-benchmark': {
    title: 'Comparando com o Gênero',
    subtitle: 'Processando Z-Scores e calibrando desvios em relação ao benchmark...',
    icon: 'tune',
  },
  done: {
    title: 'Diagnóstico Concluído',
    subtitle: 'Redirecionando para os resultados finais...',
    icon: 'check_circle',
  },
  error: {
    title: 'Falha na Análise',
    subtitle: 'Ocorreu um problema durante o processamento do áudio.',
    icon: 'error',
  },
}

export function AnalyzingPage() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const { progress, error, isDone } = useAnalysisPolling(analysisId)
  const [displayPercent, setDisplayPercent] = useState(12)

  // Meta percentual informada pelo backend (ou 100 se concluído)
  const targetPercent = isDone ? 100 : Math.max(progress?.percent ?? 15, 12)

  // Animação suave e contínua: nunca deixa a barra travada
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayPercent((prev: number) => {
        if (isDone) {
          if (prev >= 100) return 100
          return Math.min(prev + 4, 100)
        }

        if (prev < targetPercent) {
          // Aproximação suave da meta recebida do backend
          const diff = targetPercent - prev
          const step = Math.max(0.3, diff * 0.12)
          return Math.min(prev + step, targetPercent)
        }

        // Se o backend ainda está processando um passo pesado (ex: HPSS / STFT),
        // avança sutilmente (+0.1% a cada 100ms) até targetPercent + 8% (com teto em 95%)
        // para dar sensação visual contínua de atividade.
        if (prev < Math.min(targetPercent + 8, 95)) {
          return prev + 0.08
        }

        return prev
      })
    }, 80)

    return () => clearInterval(timer)
  }, [targetPercent, isDone])

  useEffect(() => {
    if (isDone && analysisId && displayPercent >= 98) {
      const timer = setTimeout(() => {
        navigate(`/results/${analysisId}`)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isDone, analysisId, displayPercent, navigate])

  const currentStep = progress?.step ?? 'uploading'
  const stepInfo = stepDetails[currentStep] || stepDetails['uploading']
  const percentInt = Math.min(Math.max(Math.round(displayPercent), 5), 100)

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-12">
      {/* Luzes de fundo atmosféricas */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-center items-center h-20 backdrop-blur-md bg-background/60 border-b border-surface-container">
        <div className="font-headline-md text-headline-md text-primary tracking-tighter flex items-center gap-2">
          <Icon name="graphic_eq" className="text-secondary" />
          <span>VIBE_LAB</span>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto z-10 pt-16">
        <div className="bg-surface-container-high/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-outline/15 shadow-[0_10px_40px_rgba(0,0,0,0.5)] desert-glow-primary">
          {error ? (
            <div className="space-y-6">
              <ErrorState message="Não foi possível concluir o processamento da faixa." />
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="w-full bg-primary text-on-primary font-headline-md py-3 px-6 rounded-xl hover:bg-secondary transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              {/* Ícone pulsante do passo */}
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_25px_rgba(255,181,161,0.25)]">
                <Icon
                  name={stepInfo.icon}
                  className="text-4xl animate-pulse text-secondary"
                />
              </div>

              {/* Títulos e status */}
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-2">
                  Processamento em Tempo Real
                </span>
                <h1 className="font-display-lg text-2xl md:text-3xl font-bold text-primary mb-2">
                  {stepInfo.title}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto min-h-[44px] flex items-center justify-center transition-all">
                  {progress?.message || stepInfo.subtitle}
                </p>
              </div>

              {/* Barra de Carregamento Principal */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-label-md text-on-surface-variant">Progresso da análise</span>
                  <span className="font-mono text-xl font-bold text-secondary">{percentInt}%</span>
                </div>

                <div className="w-full h-4 bg-surface-container-lowest rounded-full overflow-hidden p-0.5 border border-outline/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] shadow-[0_0_15px_rgba(248,189,75,0.7)] transition-all duration-300 ease-out"
                    style={{ width: `${percentInt}%` }}
                  />
                </div>
              </div>

              {/* Checklist de Etapas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-outline/10 text-left">
                <div
                  className={`p-3 rounded-xl border transition-colors ${
                    percentInt >= 35
                      ? 'border-secondary/40 bg-secondary/5 text-on-surface'
                      : 'border-outline/10 text-on-surface-variant/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-label-sm text-xs font-semibold">
                    <Icon
                      name={percentInt >= 35 ? 'check' : 'hourglass_empty'}
                      className={percentInt >= 35 ? 'text-secondary' : ''}
                    />
                    <span>1. Áudio DSP</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border transition-colors ${
                    percentInt >= 75
                      ? 'border-secondary/40 bg-secondary/5 text-on-surface'
                      : 'border-outline/10 text-on-surface-variant/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-label-sm text-xs font-semibold">
                    <Icon
                      name={percentInt >= 75 ? 'check' : 'hourglass_empty'}
                      className={percentInt >= 75 ? 'text-secondary' : ''}
                    />
                    <span>2. Masterização</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border transition-colors ${
                    percentInt >= 98 || isDone
                      ? 'border-secondary/40 bg-secondary/5 text-on-surface'
                      : 'border-outline/10 text-on-surface-variant/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-label-sm text-xs font-semibold">
                    <Icon
                      name={percentInt >= 98 || isDone ? 'check' : 'hourglass_empty'}
                      className={percentInt >= 98 || isDone ? 'text-secondary' : ''}
                    />
                    <span>3. Diagnóstico</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}