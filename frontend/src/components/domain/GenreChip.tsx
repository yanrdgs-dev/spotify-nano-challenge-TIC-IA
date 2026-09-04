// Chip de um único gênero — usado para seleção ou apenas exibição.

import clsx from 'clsx'
import type { TrackGenre } from '../../types/domain'
import { getGenreLabel } from '../../lib/labels'

interface GenreChipProps {
  genre: TrackGenre
  isSelected?: boolean
  onClick?: (genre: TrackGenre) => void
}

export function GenreChip({ genre, isSelected = false, onClick }: GenreChipProps) {
  const isInteractive = Boolean(onClick)

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => onClick?.(genre)}
      className={clsx(
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        isSelected
          ? 'border-accent bg-accent/20 text-accent'
          : 'border-border bg-surface-elevated text-text-secondary',
        isInteractive && !isSelected && 'hover:border-accent hover:text-text-primary',
        !isInteractive && 'cursor-default',
      )}
    >
      {getGenreLabel(genre)}
    </button>
  )
}