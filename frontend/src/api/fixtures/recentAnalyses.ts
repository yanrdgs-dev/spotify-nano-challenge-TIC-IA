// 3 análises de exemplo para popular a lista de histórico da tela inicial.

import type { RecentAnalysis } from '../../types/domain'

export const recentAnalyses: RecentAnalysis[] = [
  {
    analysisId: 'a1b2c3',
    trackName: 'Luz da Manhã',
    genre: 'mpb',
    vibeScore: 0.87,
    createdAt: '2026-08-28T14:32:00.000Z',
  },
  {
    analysisId: 'd4e5f6',
    trackName: 'Batida de Rua',
    genre: 'funk',
    vibeScore: 0.74,
    createdAt: '2026-08-25T09:15:00.000Z',
  },
  {
    analysisId: 'g7h8i9',
    trackName: 'Sintético 909',
    genre: 'eletronica',
    vibeScore: 0.91,
    createdAt: '2026-08-20T18:47:00.000Z',
  },
]