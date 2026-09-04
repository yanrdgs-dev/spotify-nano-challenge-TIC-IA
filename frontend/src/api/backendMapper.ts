// Traduz a resposta do backend real (FastAPI, endpoint POST /api/analyze)
// para os tipos de domínio usados pelo frontend.
// Referência: https://github.com/yanrdgs-dev/spotify-nano-challenge-TIC-IA

import type { AnalysisResult, TrackGenre } from '../types/domain'

export interface BackendAnalyzeResponse {
  filename: string
  genre: string
  genre_alignment_score: number
  metrics: {
    danceability: number
    energy: number
    loudness: number
    acousticness: number
    valence: number
    tempo: number
  }
  benchmark_means: {
    danceability: number
    energy: number
    loudness: number
    acousticness: number
    valence: number
    tempo: number
  }
  feedbacks?: Array<{
    dimensao: string
    status: string
    mensagem: string
  }>
  chart_data?: {
    labels: string[]
    user_values: number[]
    genre_values: number[]
  }
  mastering?: {
    integrated_lufs: number
    true_peak_dbtp: number
    crest_factor_db: number
    lra_db: number
    spotify_gain_change_db: number
    band_energies: Record<string, number>
  }
  macro_structure?: {
    duration_s: number
    time_to_hook_s: number
    dynamic_lift_pct: number
  }
  spectral_eq?: {
    frequencies_hz: number[]
    user_spectrum_db: number[]
    target_curve_db: number[]
    suggested_eq_gain_db: number[]
    mudness_detected: boolean
    harshness_detected: boolean
    air_boost_recommended: boolean
    sub_mono_clean: boolean
    tuning_hz: number
  }
}

function averageOf(values: number[] | undefined): number {
  if (!values || values.length === 0) return 100
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function estimateBassPressure(response: BackendAnalyzeResponse): number {
  const bands = response.mastering?.band_energies
  if (!bands) return 0
  const sub = bands['Sub (20-60Hz)'] ?? 0
  const low = bands['Low (60-250Hz)'] ?? 0
  return Math.round((sub + low) * 10) / 10
}

export function mapBackendResponseToAnalysisResult(
  response: BackendAnalyzeResponse,
  analysisId: string,
  fallbackTrackName: string,
): AnalysisResult {
  const alignmentFraction = response.genre_alignment_score / 100

  return {
    analysisId,
    trackName: fallbackTrackName,
    genre: (response.genre as TrackGenre) ?? 'outro',
    predictedPopularity: Math.round(response.genre_alignment_score),
    benchmarkPopularity: Math.round(averageOf(response.chart_data?.genre_values)),
    audioFeatures: {
      danceability: response.metrics.danceability,
      energy: response.metrics.energy,
      valence: response.metrics.valence,
      tempo: response.metrics.tempo,
      loudness: response.metrics.loudness,
      acousticness: response.metrics.acousticness,
      instrumentalness: 0,
    },
    benchmarkFeatures: response.benchmark_means
      ? {
          danceability: response.benchmark_means.danceability,
          energy: response.benchmark_means.energy,
          valence: response.benchmark_means.valence,
          tempo: response.benchmark_means.tempo,
          loudness: response.benchmark_means.loudness,
          acousticness: response.benchmark_means.acousticness,
          instrumentalness: 0,
        }
      : undefined,
    vibeMetrics: {
      vibeScore: alignmentFraction,
      bassPressure: estimateBassPressure(response),
      genreAlignment: alignmentFraction,
    },
    mastering: response.mastering
      ? {
          integratedLufs: response.mastering.integrated_lufs,
          truePeakDbtp: response.mastering.true_peak_dbtp,
          crestFactorDb: response.mastering.crest_factor_db,
          lraDb: response.mastering.lra_db,
          spotifyGainChangeDb: response.mastering.spotify_gain_change_db,
          bandEnergies: response.mastering.band_energies || {},
        }
      : undefined,
    diagnosis: response.spectral_eq
      ? {
          mudnessDetected: response.spectral_eq.mudness_detected,
          harshnessDetected: response.spectral_eq.harshness_detected,
          airBoostRecommended: response.spectral_eq.air_boost_recommended,
          subMonoClean: response.spectral_eq.sub_mono_clean,
          tuningHz: response.spectral_eq.tuning_hz,
        }
      : undefined,
    feedbacks: response.feedbacks
      ?.filter(
        (f) =>
          !f.dimensao.toLowerCase().includes('hook') &&
          !f.dimensao.toLowerCase().includes('estrutura'),
      )
      .map((f) => ({
        dimensao: f.dimensao,
        status: f.status,
        mensagem: f.mensagem,
      })),
    macroStructure: response.macro_structure
      ? {
          durationS: response.macro_structure.duration_s,
          dynamicLiftPct: response.macro_structure.dynamic_lift_pct,
          // Time to hook omitido propositalmente conforme solicitação
        }
      : undefined,
    createdAt: new Date().toISOString(),
  }
}