// Um item da lista de histórico de análises recentes.

import type { RecentAnalysis } from '../../types/domain'
import { getGenreLabel } from '../../lib/labels'
import { formatDate } from '../../lib/format'
import { ScoreBadge } from '../ui/ScoreBadge'

interface AnalysisHistoryItemProps {
  analysis: RecentAnalysis
  onClick?: (analysisId: string) => void
}

export function AnalysisHistoryItem({ analysis, onClick }: AnalysisHistoryItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(analysis.analysisId)}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3 text-left transition-colors hover:border-accent"
    >
      <div>
        <p className="font-medium text-text-primary">{analysis.trackName}</p>
        <p className="text-sm text-text-muted">
          {getGenreLabel(analysis.genre)} · {formatDate(analysis.createdAt)}
        </p>
      </div>
      <ScoreBadge score={analysis.vibeScore} />
    </button>
  )
}