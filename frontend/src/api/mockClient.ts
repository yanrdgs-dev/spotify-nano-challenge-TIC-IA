// Implementação mockada de AnalysisApi.
// Guarda o estado em memória (Map) e simula o avanço do progresso com setInterval.

import type { AnalysisApi, UploadMetadata } from '../types/api'
import type { AnalysisProgress, AnalysisResult, TrackGenre } from '../types/domain'
import { finalResult } from './fixtures/finalResult'
import { availableGenres } from './fixtures/genres'
import { analysisStepOrder, analysisStepTargets, analysisTickIntervalMs } from './fixtures/inProgressAnalysis'
import { recentAnalyses } from './fixtures/recentAnalyses'

interface InternalState {
  progress: AnalysisProgress
  result: AnalysisResult | null
  genreConfirmed: boolean
  metadata?: UploadMetadata
}

const analyses = new Map<string, InternalState>()

function startProgressLoop(analysisId: string) {
  let stepIndex = 0

  const interval = setInterval(() => {
    const state = analyses.get(analysisId)
    if (!state) {
      clearInterval(interval)
      return
    }

    const step = analysisStepOrder[stepIndex]
    const target = analysisStepTargets[step]

    if (state.progress.percent < target) {
      state.progress = {
        ...state.progress,
        step,
        percent: Math.min(state.progress.percent + 4, target),
        currentTarget: target,
      }
      return
    }

    stepIndex += 1

    if (stepIndex >= analysisStepOrder.length) {
      state.progress = { ...state.progress, step: 'done', percent: 100 }
      state.result = {
        ...finalResult,
        analysisId,
        trackName: state.metadata?.trackName || finalResult.trackName,
        genre: state.metadata?.genreHint || finalResult.genre,
        audioFeatures: {
          ...finalResult.audioFeatures,
          tempo: state.metadata?.bpm || finalResult.audioFeatures.tempo,
        },
      }
      clearInterval(interval)
    }
  }, analysisTickIntervalMs)
}

export const mockClient: AnalysisApi = {
  async getGenres() {
    return availableGenres
  },

  async uploadTrack(_file: File, metadata?: UploadMetadata) {
    const analysisId = `mock-${Date.now()}`

    analyses.set(analysisId, {
      progress: {
        analysisId,
        step: 'uploading',
        percent: 0,
      },
      result: null,
      genreConfirmed: false,
      metadata,
    })

    startProgressLoop(analysisId)

    return { analysisId }
  },

  async getProgress(analysisId: string) {
    const state = analyses.get(analysisId)
    if (!state) {
      throw new Error(`Análise não encontrada: ${analysisId}`)
    }
    return state.progress
  },

  async confirmGenre(analysisId: string, genre: TrackGenre) {
    const state = analyses.get(analysisId)
    if (!state) {
      throw new Error(`Análise não encontrada: ${analysisId}`)
    }
    state.genreConfirmed = true
    if (state.result) {
      state.result = { ...state.result, genre }
    }
  },

  async getResult(analysisId: string) {
    const state = analyses.get(analysisId)
    if (!state || !state.result) {
      throw new Error(`Resultado ainda não disponível: ${analysisId}`)
    }
    return state.result
  },

  async listRecentAnalyses() {
    return recentAnalyses
  },
}