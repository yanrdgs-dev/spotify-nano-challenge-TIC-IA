// Lista de chips de gênero — usada na tela de confirmação de gênero.

import type { TrackGenre } from '../../types/domain'
import { GenreChip } from './GenreChip'

interface GenreChipListProps {
  genres: TrackGenre[]
  selectedGenre?: TrackGenre
  onSelect?: (genre: TrackGenre) => void
}

export function GenreChipList({ genres, selectedGenre, onSelect }: GenreChipListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => (
        <GenreChip
          key={genre}
          genre={genre}
          isSelected={genre === selectedGenre}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}