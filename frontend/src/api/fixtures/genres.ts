// Lista de gêneros disponíveis para seleção, e um nome de arquivo de teste
// para preencher o fluxo de upload sem precisar de um mp3 real.

import type { TrackGenre } from '../../types/domain'

export const availableGenres: TrackGenre[] = [
  'pop',
  'rock',
  'hip-hop',
  'electronic',
  'sertanejo',
  'mpb',
  'funk',
  'jazz',
  'classical',
  'samba',
  'pagode',
  'reggae',
  'edm',
  'acoustic',
  'country',
  'outro',
]

export const testFileName = 'faixa-teste-vibe-lab.mp3'