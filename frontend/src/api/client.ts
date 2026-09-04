// Implementação real de AnalysisApi para o backend FastAPI (spotify-nano-challenge-TIC-IA).
// Utiliza a arquitetura assíncrona baseada em jobs com polling de progresso.

import type { AnalysisApi, UploadMetadata } from '../types/api'
import type { AnalysisProgress, AnalysisResult, AnalysisStep, TrackGenre } from '../types/domain'
import { mapBackendResponseToAnalysisResult, type BackendAnalyzeResponse } from './backendMapper'

// Se baseUrl não for informado ou vazio, usa caminho relativo (ideal para deploy com Nginx na mesma origem)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl

interface TrackMetadata {
  trackName: string
  genre: TrackGenre
}

const metadataStore = new Map<string, TrackMetadata>()

export const httpClient: AnalysisApi = {
  async getGenres(): Promise<string[]> {
    const response = await fetch(`${baseUrl}/api/genres`)
    if (!response.ok) {
      throw new Error(`Erro ao buscar lista de gêneros (${response.status})`)
    }
    const data = await response.json()
    return data.genres || []
  },

  async uploadTrack(file: File, metadata?: UploadMetadata) {
    if (!metadata?.genreHint) {
      throw new Error('Selecione um gênero antes de enviar a faixa.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('genre', metadata.genreHint)

    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erro ao enviar faixa para análise (${response.status})`)
    }

    const data = await response.json()
    const analysisId = data.analysisId

    const trackName = metadata.trackName || file.name.replace(/\.(mp3|wav|flac|ogg|m4a)$/i, '')
    metadataStore.set(analysisId, {
      trackName,
      genre: metadata.genreHint,
    })

    return { analysisId }
  },

  async getProgress(analysisId: string): Promise<AnalysisProgress> {
    const response = await fetch(`${baseUrl}/api/analyze/${analysisId}/progress`)
    if (!response.ok) {
      throw new Error(`Erro ao consultar progresso da análise (${response.status})`)
    }
    const data = await response.json()
    return {
      analysisId: data.analysisId,
      step: (data.step as AnalysisStep) || 'uploading',
      percent: data.percent ?? 0,
      message: data.message,
    }
  },

  async confirmGenre(_analysisId: string, _genre: TrackGenre) {
    // O backend já processou com o gênero fornecido no upload.
  },

  async getResult(analysisId: string): Promise<AnalysisResult> {
    const response = await fetch(`${baseUrl}/api/analyze/${analysisId}/result`)
    if (!response.ok) {
      throw new Error(`Erro ao obter resultado da análise (${response.status})`)
    }

    const data: BackendAnalyzeResponse = await response.json()
    const meta = metadataStore.get(analysisId)
    const trackName =
      meta?.trackName || data.filename?.replace(/\.(mp3|wav|flac|ogg|m4a)$/i, '') || 'Faixa Analisada'

    return mapBackendResponseToAnalysisResult(data, analysisId, trackName)
  },

  async listRecentAnalyses() {
    return []
  },
}