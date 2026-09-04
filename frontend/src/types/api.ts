// Contrato entre o front e o backend de análise.
// mockClient.ts e client.ts implementam esta mesma interface.

import type {
  AnalysisProgress,
  AnalysisResult,
  RecentAnalysis,
  TrackGenre,
} from './domain'

export interface UploadMetadata {
  trackName?: string
  genreHint?: TrackGenre
  bpm?: number
}

export interface AnalysisApi {
  getGenres(): Promise<string[]>
  uploadTrack(file: File, metadata?: UploadMetadata): Promise<{ analysisId: string }>
  getProgress(analysisId: string): Promise<AnalysisProgress>
  confirmGenre(analysisId: string, genre: TrackGenre): Promise<void>
  getResult(analysisId: string): Promise<AnalysisResult>
  listRecentAnalyses(): Promise<RecentAnalysis[]>
}