// Ponto único de acesso à API. Troca entre mock e real via variável de ambiente.
//
// Para usar o backend real, defina no .env:
//   VITE_USE_MOCK=false
//   VITE_API_BASE_URL=http://137.184.193.178  (ou a URL do backend)

import type { AnalysisApi } from '../types/api'
import { mockClient } from './mockClient'
import { httpClient } from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const api: AnalysisApi = USE_MOCK ? mockClient : httpClient