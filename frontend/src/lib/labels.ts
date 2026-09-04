// Tradução de jargão técnico (DSP, modelo) para linguagem de estúdio,
// e rótulos legíveis para os valores do domínio.

import type { TrackGenre } from '../types/domain'

export const genreLabels: Record<string, string> = {
  pop: 'Pop',
  rock: 'Rock',
  'hip-hop': 'Hip-Hop',
  electronic: 'Eletrônica',
  eletronica: 'Eletrônica',
  sertanejo: 'Sertanejo',
  mpb: 'MPB',
  funk: 'Funk',
  jazz: 'Jazz',
  classical: 'Clássica',
  classica: 'Clássica',
  brazil: 'Brasil / MPB',
  samba: 'Samba',
  pagode: 'Pagode',
  forro: 'Forró',
  reggae: 'Reggae',
  reggaeton: 'Reggaeton',
  'r-n-b': 'R&B',
  'alt-rock': 'Alt Rock',
  'hard-rock': 'Hard Rock',
  'heavy-metal': 'Heavy Metal',
  edm: 'EDM',
  house: 'House',
  techno: 'Techno',
  ambient: 'Ambient',
  acoustic: 'Acústico',
  country: 'Country',
  blues: 'Blues',
  soul: 'Soul',
  outro: 'Outro',
}

export function getGenreLabel(genre: TrackGenre | string): string {
  if (genreLabels[genre]) {
    return genreLabels[genre]
  }
  // Formata kebab-case para Title Case (ex: "drum-and-bass" -> "Drum And Bass")
  return genre
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Tradução de jargão de DSP/ML para o que o usuário de estúdio entende.
export const studioLabels = {
  danceability: 'Dançabilidade',
  energy: 'Energia',
  valence: 'Positividade',
  tempo: 'Andamento (BPM)',
  loudness: 'Volume percebido',
  acousticness: 'Acústica',
  instrumentalness: 'Instrumental',
  vibeScore: 'Nota de Vibe',
  bassPressure: 'Pressão de Grave',
  genreAlignment: 'Alinhamento de Gênero',
  predictedPopularity: 'Popularidade Prevista',
  benchmarkPopularity: 'Referência do Gênero',
} as const