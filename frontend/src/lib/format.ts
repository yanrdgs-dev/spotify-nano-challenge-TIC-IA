// Funções puras de formatação — sem dependência de domínio, sem estado.

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`
}

export function formatScore(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits)
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}