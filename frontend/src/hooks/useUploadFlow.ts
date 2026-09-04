// Envia o arquivo selecionado e seus metadados para a API,
// e navega para a tela de análise.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { UploadMetadata } from '../types/api'

export function useUploadFlow() {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const upload = async (file: File, metadata?: UploadMetadata) => {
    setIsUploading(true)
    setError(null)
    try {
      const { analysisId } = await api.uploadTrack(file, metadata)
      navigate(`/analyzing/${analysisId}`)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, error }
}