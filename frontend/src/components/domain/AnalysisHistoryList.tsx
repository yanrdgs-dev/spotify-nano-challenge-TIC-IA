// Lista completa de análises recentes — usada na tela inicial.

import type { RecentAnalysis } from '../../types/domain'
import { AnalysisHistoryItem } from './AnalysisHistoryItem'

interface AnalysisHistoryListProps {
  analyses: RecentAnalysis[]
  onSelect?: (analysisId: string) => void
}

export function AnalysisHistoryList({ analyses, onSelect }: AnalysisHistoryListProps) {
  if (analyses.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Nenhuma análise ainda. Envie uma faixa para começar.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {analyses.map((analysis) => (
        <AnalysisHistoryItem
          key={analysis.analysisId}
          analysis={analysis}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}