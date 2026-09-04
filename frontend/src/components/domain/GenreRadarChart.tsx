// Gráfico de radar comparando as características da faixa analisada
// com um benchmark de referência do gênero.

import { useEffect, useRef } from 'react'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import type { AudioFeatures } from '../../types/domain'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface GenreRadarChartProps {
  features: AudioFeatures
  benchmarkFeatures: AudioFeatures
}

const labels = ['Dançabilidade', 'Energia', 'Positividade', 'Acústica']

function toRadarValues(features: AudioFeatures) {
  return [
    Math.round(features.danceability * 100),
    Math.round(features.energy * 100),
    Math.round(features.valence * 100),
    Math.round(features.acousticness * 100),
  ]
}

export function GenreRadarChart({ features, benchmarkFeatures }: GenreRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current?.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Sua Faixa',
            data: toRadarValues(features),
            backgroundColor: 'rgba(255, 181, 161, 0.2)',
            borderColor: '#ffb5a1',
            pointBackgroundColor: '#f8bd4b',
            pointBorderColor: '#171305',
            borderWidth: 2,
          },
          {
            label: 'Referência do Gênero',
            data: toRadarValues(benchmarkFeatures),
            backgroundColor: 'rgba(248, 189, 75, 0.1)',
            borderColor: 'rgba(248, 189, 75, 0.5)',
            pointBackgroundColor: 'rgba(248, 189, 75, 0.5)',
            pointBorderColor: '#171305',
            borderWidth: 1,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
             min: 0,
             max: 100,
            angleLines: { color: 'rgba(236, 226, 201, 0.1)' },
            grid: { color: 'rgba(236, 226, 201, 0.1)' },
            pointLabels: {
              color: '#ece2c9',
              font: { family: "'Space Mono', monospace", size: 12 },
            },
            ticks: { display: false},
          },
        },
        plugins: {
          legend: {
            labels: { color: '#ece2c9', font: { family: "'Be Vietnam Pro', sans-serif" } },
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
    }
  }, [features, benchmarkFeatures])

  return (
    <div className="w-full max-w-2xl mx-auto h-[400px]">
      <canvas ref={canvasRef} />
    </div>
  )
}