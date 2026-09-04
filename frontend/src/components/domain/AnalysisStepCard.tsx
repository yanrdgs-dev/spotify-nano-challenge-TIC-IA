// Card de um passo da análise em andamento — mostra o gauge circular
// com o percentual atual e o rótulo traduzido do passo.

import type { AnalysisProgress } from '../../types/domain'
import { CircularGauge } from '../ui/CircularGauge'
import { Card } from '../ui/Card'

const stepLabels: Record<AnalysisProgress['step'], string> = {
  uploading: 'Enviando faixa',
  'extracting-features': 'Extraindo características',
  'predicting-popularity': 'Analisando vibe',
  'comparing-benchmark': 'Comparando com o gênero',
  done: 'Concluído',
  error: 'Erro',
}

interface AnalysisStepCardProps {
  progress: AnalysisProgress
}

export function AnalysisStepCard({ progress }: AnalysisStepCardProps) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <CircularGauge percent={progress.percent} label={stepLabels[progress.step]} />
      <p className="text-text-secondary">{stepLabels[progress.step]}</p>
    </Card>
  )
}