// Gauge circular — anel que preenche conforme o percentual, com o valor no centro.
// Usa SVG puro; o cálculo de stroke-dasharray é a parte que exige mais atenção.

interface CircularGaugeProps {
  percent: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function CircularGauge({
  percent,
  size = 160,
  strokeWidth = 12,
  label,
}: CircularGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const center = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-surface-elevated)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-text-primary">
          {Math.round(clamped)}%
        </span>
        {label && <span className="text-xs text-text-muted">{label}</span>}
      </div>
    </div>
  )
}