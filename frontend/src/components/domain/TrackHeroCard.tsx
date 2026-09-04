// Card de destaque da faixa analisada — nome, gênero e comparação
// entre popularidade prevista e a referência do gênero.

import type { AnalysisResult } from '../../types/domain'
import { getGenreLabel, studioLabels } from '../../lib/labels'
import { Card } from '../ui/Card'
import { StatBox } from '../ui/StatBox'

interface TrackHeroCardProps {
  result: AnalysisResult
}

export function TrackHeroCard({ result }: TrackHeroCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{result.trackName}</h2>
        <p className="text-text-secondary">{getGenreLabel(result.genre)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBox
          label={studioLabels.predictedPopularity}
          value={`${result.predictedPopularity}`}
        />
        <StatBox
          label={studioLabels.benchmarkPopularity}
          value={`${result.benchmarkPopularity}`}
        />
      </div>
    </Card>
  )
}