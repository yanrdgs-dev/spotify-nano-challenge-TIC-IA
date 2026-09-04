// Selo compacto para exibir uma pontuação, com cor variando pela faixa de valor.

import clsx from 'clsx'

interface ScoreBadgeProps {
  score: number
  className?: string
}

function getScoreTone(score: number) {
  if (score >= 0.7) return 'bg-success/20 text-success'
  if (score >= 0.4) return 'bg-accent/20 text-accent'
  return 'bg-danger/20 text-danger'
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const percent = Math.round(score * 100)

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
        getScoreTone(score),
        className,
      )}
    >
      {percent}%
    </span>
  )
}