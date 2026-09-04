// Tipos centrais do domínio VIBE_LAB.
// Não depende de nada — é a base para toda a camada de API, hooks e componentes domain/.

export type TrackGenre =
  | 'pop'
  | 'rock'
  | 'hip-hop'
  | 'electronic'
  | 'sertanejo'
  | 'mpb'
  | 'funk'
  | 'jazz'
  | 'classical'
  | 'outro'
  | (string & {})

export interface AudioFeatures {
  danceability: number
  energy: number
  valence: number
  tempo: number
  loudness: number
  acousticness: number
  instrumentalness: number
}

export interface VibeMetrics {
  vibeScore: number
  bassPressure: number
  genreAlignment: number
}

export type AnalysisStep =
  | 'uploading'
  | 'extracting-features'
  | 'predicting-popularity'
  | 'comparing-benchmark'
  | 'done'
  | 'error'

export interface AnalysisProgress {
  analysisId: string
  step: AnalysisStep
  percent: number
  message?: string
  currentTarget?: number
}

export interface MasteringMetrics {
  integratedLufs: number
  truePeakDbtp: number
  crestFactorDb: number
  lraDb: number
  spotifyGainChangeDb: number
  bandEnergies: Record<string, number>
}

export interface SpectralEQDiagnosis {
  mudnessDetected: boolean
  harshnessDetected: boolean
  airBoostRecommended: boolean
  subMonoClean: boolean
  tuningHz: number
}

export interface StudioFeedback {
  dimensao: string
  status: string
  mensagem: string
}

export interface MacroStructure {
  durationS: number
  dynamicLiftPct: number
}

export interface AnalysisResult {
  analysisId: string
  trackName: string
  genre: TrackGenre
  predictedPopularity: number
  benchmarkPopularity: number
  audioFeatures: AudioFeatures
  benchmarkFeatures?: AudioFeatures
  vibeMetrics: VibeMetrics
  mastering?: MasteringMetrics
  diagnosis?: SpectralEQDiagnosis
  feedbacks?: StudioFeedback[]
  macroStructure?: MacroStructure
  createdAt: string
}

export interface RecentAnalysis {
  analysisId: string
  trackName: string
  genre: TrackGenre
  vibeScore: number
  createdAt: string
}