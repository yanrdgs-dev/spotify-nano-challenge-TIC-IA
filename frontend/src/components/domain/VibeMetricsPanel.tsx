// Painel com as métricas de vibe (vibeScore, bassPressure, genreAlignment).

import type { VibeMetrics } from '../../types/domain'
import { formatPercent, formatScore } from '../../lib/format'
import { studioLabels } from '../../lib/labels'
import { StatBox } from '../ui/StatBox'

interface VibeMetricsPanelProps {
  metrics: VibeMetrics
}

export function VibeMetricsPanel({ metrics }: VibeMetricsPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatBox
        label={studioLabels.vibeScore}
        value={formatPercent(metrics.vibeScore)}
      />
      <StatBox
        label={studioLabels.bassPressure}
        value={formatScore(metrics.bassPressure)}
      />
      <StatBox
        label={studioLabels.genreAlignment}
        value={formatPercent(metrics.genreAlignment)}
      />
    </div>
  )
}