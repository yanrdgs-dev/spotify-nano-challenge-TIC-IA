// Um AnalysisResult completo, usado quando a análise simulada termina.

import type { AnalysisResult } from '../../types/domain'

export const finalResult: AnalysisResult = {
  analysisId: 'mock-analysis-001',
  trackName: 'Faixa de Teste',
  genre: 'mpb',
  predictedPopularity: 87,
  benchmarkPopularity: 74,
  audioFeatures: {
    danceability: 0.68,
    energy: 0.72,
    valence: 0.61,
    tempo: 118,
    loudness: -6.4,
    acousticness: 0.34,
    instrumentalness: 0.02,
  },
  vibeMetrics: {
    vibeScore: 0.87,
    bassPressure: 87.4,
    genreAlignment: 0.79,
  },
  createdAt: '2026-09-02T12:00:00.000Z',
}