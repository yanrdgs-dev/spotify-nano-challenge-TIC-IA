// Alvos de progresso para cada passo da análise em andamento,
// e a ordem em que os passos acontecem — consumido pelo mockClient
// para simular o avanço com setInterval.

import type { AnalysisStep } from '../../types/domain'

export const analysisStepOrder: AnalysisStep[] = [
  'uploading',
  'extracting-features',
  'predicting-popularity',
  'comparing-benchmark',
  'done',
]

// Alvo de percentual (0-100) que cada passo atinge quando "termina".
export const analysisStepTargets: Record<AnalysisStep, number> = {
  uploading: 20,
  'extracting-features': 55,
  'predicting-popularity': 87,
  'comparing-benchmark': 87.4,
  done: 100,
  error: 100,
}

// Intervalo em milissegundos entre cada tick de progresso simulado.
export const analysisTickIntervalMs = 300