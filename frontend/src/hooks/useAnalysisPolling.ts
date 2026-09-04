// Consulta o progresso de uma análise em andamento, em intervalos regulares,
// até que o passo chegue a 'done'.

import { useEffect, useState } from 'react'
import { api } from '../api'
import type { AnalysisProgress } from '../types/domain'

const pollIntervalMs = 300

export function useAnalysisPolling(analysisId: string | undefined) {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!analysisId) return

    let cancelled = false
    let consecutiveErrors = 0

    const tick = async () => {
      try {
        const result = await api.getProgress(analysisId)
        if (cancelled) return
        consecutiveErrors = 0
        setProgress(result)
        if (result.step === 'done' || result.step === 'error') {
          if (result.step === 'error') {
            setError(new Error(result.message || 'Falha no processamento da faixa.'))
          }
          clearInterval(interval)
        }
      } catch (err) {
        if (cancelled) return
        consecutiveErrors++
        if (consecutiveErrors >= 6) {
          setError(err instanceof Error ? err : new Error('Erro de conexão ao consultar progresso'))
          clearInterval(interval)
        }
      }
    }

    tick()
    const interval = setInterval(tick, pollIntervalMs)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [analysisId])

  const isDone = progress?.step === 'done'

  return { progress, error, isDone }
}