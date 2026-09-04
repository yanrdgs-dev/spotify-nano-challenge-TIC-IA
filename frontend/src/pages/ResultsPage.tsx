// Tela de resultado final — exibição completa de métricas psicoacústicas,
// radar de gênero (sem instrumental), masterização EBU R128, diagnóstico espectral
// e feedbacks prescritivos de estúdio.

import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useAsyncData } from '../hooks/useAsyncData'
import { getGenreLabel, studioLabels } from '../lib/labels'
import { TopAppBar } from '../components/domain/TopAppBar'
import { BottomNavBar } from '../components/domain/BottomNavBar'
import { GenreRadarChart } from '../components/domain/GenreRadarChart'
import { Icon } from '../components/ui/Icon'
import { Spinner } from '../components/ui/Spinner'
import { ErrorState } from '../components/ui/ErrorState'

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function ResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>()

  const { data: result, isLoading, error, reload } = useAsyncData(() => {
    if (!analysisId) throw new Error('ID de análise ausente')
    return api.getResult(analysisId)
  }, [analysisId])

  return (
    <>
      <TopAppBar />

      <main className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-[var(--spacing-container-max)] mx-auto space-y-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Spinner />
            <p className="font-body-md text-on-surface-variant">Carregando métricas da análise...</p>
          </div>
        )}

        {error && (
          <div className="py-24">
            <ErrorState message="Não foi possível carregar o resultado da análise." onRetry={reload} />
          </div>
        )}

        {result && (() => {
          const alignmentScore = Math.min(100, Math.max(0, Math.round(result.vibeMetrics.genreAlignment * 100)))
          const radius = 80
          const circumference = 2 * Math.PI * radius
          const strokeDashoffset = circumference - (alignmentScore / 100) * circumference

          return (
            <div className="space-y-10">
              {/* 1. Hero da faixa — Círculo de Alinhamento com o Gênero (0 a 100) */}
              <section className="rounded-[2rem] p-8 md:p-12 relative overflow-hidden bg-surface-container-high border border-surface-variant desert-glow-primary">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                  {/* Informações da Faixa */}
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-label-sm text-xs uppercase tracking-wider font-semibold">
                        {getGenreLabel(result.genre)}
                      </span>
                      <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
                        <Icon name="check_circle" className="text-emerald-400 text-sm" />
                        Análise Concluída
                      </span>
                    </div>

                    <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary break-words">
                      {result.trackName}
                    </h1>

                    <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-lg leading-relaxed">
                      {alignmentScore >= 80
                        ? `Alinhamento Excepcional — A estrutura tímbrica e acústica da sua faixa reflete com fidelidade os padrões de referência de ${getGenreLabel(result.genre)}.`
                        : alignmentScore >= 60
                        ? `Forte Ressonância — A faixa dialoga bem com os padrões de ${getGenreLabel(result.genre)}, mantendo identidade autoral própria.`
                        : `Identidade Híbrida — A faixa apresenta características sonoras não convencionais ou híbridas em relação ao perfil tradicional de ${getGenreLabel(result.genre)}.`}
                    </p>
                  </div>

                  {/* Círculo de Alinhamento de 0 a 100 */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      <div className="absolute inset-0 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />

                      <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 200 200">
                        <defs>
                          <linearGradient id="heroAlignmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffb5a1" />
                            <stop offset="100%" stopColor="#f8bd4b" />
                          </linearGradient>
                        </defs>

                        {/* Trilha do anel */}
                        <circle
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          className="text-surface-variant/35"
                        />

                        {/* Progresso do Alinhamento */}
                        <circle
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="none"
                          stroke="url(#heroAlignmentGrad)"
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(248,189,75,0.6)]"
                        />
                      </svg>

                      {/* Conteúdo central do círculo */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
                        <span className="font-display-lg text-5xl font-extrabold text-on-surface tracking-tight">
                          {alignmentScore}%
                        </span>
                        <span className="text-[11px] md:text-xs font-semibold text-secondary tracking-wider uppercase mt-1 leading-tight">
                          Alinhamento ao Gênero
                        </span>
                      </div>
                    </div>

                    {/* Escala de 0 a 100 */}
                    <div className="flex justify-between items-center w-56 mt-3 text-[11px] font-medium text-on-surface-variant/75 border-t border-outline/10 pt-2">
                      <span>0 (Sem Alinhamento)</span>
                      <span>100 (Perfeito)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Radar de gênero & Pressão de Graves / Andamento */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Radar de Alinhamento (sem instrumental) */}
              <section className="lg:col-span-7 rounded-[2rem] p-8 relative overflow-hidden bg-surface-container-high border border-surface-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-headline-lg text-2xl font-bold text-on-surface">
                      Alinhamento Tonal do Gênero
                    </h2>
                    <Icon name="radar" className="text-secondary" />
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant mb-6">
                    Comparativo direto das features psicoacústicas contra o benchmark de {getGenreLabel(result.genre)}.
                  </p>
                </div>

                <div className="w-full my-auto">
                  <GenreRadarChart
                    features={result.audioFeatures}
                    benchmarkFeatures={result.benchmarkFeatures || result.audioFeatures}
                  />
                </div>
              </section>

              {/* Dinâmica / Crest Factor, Duração, Andamento e Volume */}
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                {/* Microdinâmica / Crest Factor (Punch & Transientes) */}
                <section className="glass-sand rounded-[2rem] p-8 border border-outline/10 relative overflow-hidden bloom-secondary flex-1">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/10 rounded-full blur-[60px]" />
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-label-md text-label-md text-secondary tracking-widest uppercase">
                      Microdinâmica & Pegada (Crest Factor)
                    </h3>
                    <Icon name="speed" className="text-secondary" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display-lg text-5xl font-bold text-on-surface">
                      {result.mastering ? result.mastering.crestFactorDb.toFixed(1) : '8.5'}
                    </span>
                    <span className="font-headline-md text-xl text-on-surface-variant">dB</span>
                  </div>
                  <div className="w-full h-4 bg-surface-container-lowest rounded-full overflow-hidden relative border border-outline/15">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-primary rounded-full shadow-[0_0_15px_rgba(248,189,75,0.6)] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(((result.mastering?.crestFactorDb ?? 8.5) / 16) * 100, 10),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 font-label-sm text-xs text-on-surface-variant">
                    <span>Hipercomprimido (&lt; 6 dB)</span>
                    <span>Punch Ideal (8-12 dB)</span>
                    <span>Ampla Dinâmica (&gt; 13 dB)</span>
                  </div>
                </section>

                {/* Duração, Andamento e Volume */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-high rounded-2xl p-4 border border-surface-variant flex flex-col items-center text-center justify-center gap-1">
                    <Icon name="timer" className="text-2xl text-secondary" />
                    <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Duração</span>
                    <strong className="font-display-lg text-lg sm:text-xl text-on-surface">
                      {formatDuration(result.macroStructure?.durationS)}
                    </strong>
                  </div>

                  <div className="bg-surface-container-high rounded-2xl p-4 border border-surface-variant flex flex-col items-center text-center justify-center gap-1">
                    <Icon name="speed" className="text-2xl text-primary" />
                    <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Andamento</span>
                    <strong className="font-display-lg text-lg sm:text-xl text-on-surface">
                      {result.audioFeatures.tempo.toFixed(0)} <span className="text-xs font-normal">BPM</span>
                    </strong>
                  </div>

                  <div className="bg-surface-container-high rounded-2xl p-4 border border-surface-variant flex flex-col items-center text-center justify-center gap-1">
                    <Icon name="volume_up" className="text-2xl text-secondary" />
                    <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Volume RMS</span>
                    <strong className="font-display-lg text-lg sm:text-xl text-on-surface">
                      {result.audioFeatures.loudness.toFixed(1)} <span className="text-xs font-normal">dB</span>
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Seção: Masterização EBU R128 & Plataformas de Streaming */}
            {result.mastering && (
              <section className="rounded-[2rem] p-8 md:p-10 bg-surface-container-high border border-surface-variant space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline-lg text-2xl font-bold text-primary flex items-center gap-2">
                      <Icon name="equalizer" className="text-secondary" />
                      <span>Masterização Profissional & Normas EBU R128</span>
                    </h2>
                    <p className="font-body-md text-sm text-on-surface-variant mt-1">
                      Conformidade técnica de loudness, microdinâmica e normalização para plataformas de streaming.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-semibold">
                    Target Spotify: -14 LUFS
                  </span>
                </div>

                {/* Grid com os 5 medidores */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-surface-container-lowest/80 p-5 rounded-2xl border border-outline/10">
                    <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Loudness Integrado</span>
                    <strong className="text-2xl font-bold text-on-surface">
                      {result.mastering.integratedLufs.toFixed(1)} <span className="text-xs font-normal text-on-surface-variant">LUFS</span>
                    </strong>
                    <p className="text-[11px] text-on-surface-variant/70 mt-2">Volume médio percebido</p>
                  </div>

                  <div className="bg-surface-container-lowest/80 p-5 rounded-2xl border border-outline/10">
                    <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Pico Real (True Peak)</span>
                    <strong className={`text-2xl font-bold ${result.mastering.truePeakDbtp > -1.0 ? 'text-error' : 'text-on-surface'}`}>
                      {result.mastering.truePeakDbtp.toFixed(1)} <span className="text-xs font-normal text-on-surface-variant">dBTP</span>
                    </strong>
                    <p className="text-[11px] text-on-surface-variant/70 mt-2">Teto seguro: &le; -1.0 dBTP</p>
                  </div>

                  <div className="bg-surface-container-lowest/80 p-5 rounded-2xl border border-outline/10">
                    <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Fator de Crista</span>
                    <strong className="text-2xl font-bold text-secondary">
                      {result.mastering.crestFactorDb.toFixed(1)} <span className="text-xs font-normal text-on-surface-variant">dB</span>
                    </strong>
                    <p className="text-[11px] text-on-surface-variant/70 mt-2">Punch e microdinâmica</p>
                  </div>

                  <div className="bg-surface-container-lowest/80 p-5 rounded-2xl border border-outline/10">
                    <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Faixa Dinâmica (LRA)</span>
                    <strong className="text-2xl font-bold text-on-surface">
                      {result.mastering.lraDb.toFixed(1)} <span className="text-xs font-normal text-on-surface-variant">LU</span>
                    </strong>
                    <p className="text-[11px] text-on-surface-variant/70 mt-2">Contraste entre partes</p>
                  </div>

                  <div className="bg-surface-container-lowest/80 p-5 rounded-2xl border border-outline/10">
                    <span className="font-label-sm text-xs text-on-surface-variant block mb-1">Ajuste Spotify</span>
                    <strong className="text-2xl font-bold text-primary">
                      {result.mastering.spotifyGainChangeDb > 0 ? '+' : ''}{result.mastering.spotifyGainChangeDb.toFixed(1)} <span className="text-xs font-normal text-on-surface-variant">dB</span>
                    </strong>
                    <p className="text-[11px] text-on-surface-variant/70 mt-2">Ganho na normalização</p>
                  </div>
                </div>

                {/* Distribuição Espectral de Energia (Band Energies) */}
                {result.mastering.bandEnergies && Object.keys(result.mastering.bandEnergies).length > 0 && (
                  <div className="pt-4 border-t border-outline/10">
                    <h3 className="font-label-md text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                      Distribuição de Energia por Bandas de Frequência (Match EQ)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(result.mastering.bandEnergies).map(([band, val]) => (
                        <div key={band} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-on-surface">{band}</span>
                            <span className="text-secondary font-mono">{val.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-surface-container-lowest rounded-full overflow-hidden border border-outline/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                              style={{ width: `${Math.min(val * 2.5, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 4. Seção: Diagnóstico Tímbrico & Acústico */}
            {result.diagnosis && (
              <section className="rounded-[2rem] p-8 md:p-10 bg-surface-container-high border border-surface-variant space-y-6">
                <div>
                  <h2 className="font-headline-lg text-2xl font-bold text-primary flex items-center gap-2">
                    <Icon name="tune" className="text-secondary" />
                    <span>Diagnóstico Tímbrico & Equilíbrio Espectral</span>
                  </h2>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">
                    Inspeção automática de anomalias acústicas, sibilâncias e problemas de fase.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Médios-Graves / Embolamento */}
                  <div className={`p-5 rounded-2xl border ${result.diagnosis.mudnessDetected ? 'border-amber-500/30 bg-amber-500/5' : 'border-outline/10 bg-surface-container-lowest/80'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold text-on-surface">
                        <Icon
                          name={result.diagnosis.mudnessDetected ? 'warning' : 'check_circle'}
                          className={result.diagnosis.mudnessDetected ? 'text-amber-400' : 'text-emerald-400'}
                        />
                        <span>Médios-Graves (200 - 500 Hz)</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${result.diagnosis.mudnessDetected ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
                        {result.diagnosis.mudnessDetected ? 'Atenção: Embolamento' : 'Limpo & Definido'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {result.diagnosis.mudnessDetected
                        ? 'Acúmulo de energia detectado nos médios-graves. Recomenda-se atenuação paramétrica suave para dar clareza aos vocais e bumbo.'
                        : 'Transição suave entre graves e médios, sem mascaramento perceptível.'}
                    </p>
                  </div>

                  {/* Aspereza Tímbrica */}
                  <div className={`p-5 rounded-2xl border ${result.diagnosis.harshnessDetected ? 'border-amber-500/30 bg-amber-500/5' : 'border-outline/10 bg-surface-container-lowest/80'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold text-on-surface">
                        <Icon
                          name={result.diagnosis.harshnessDetected ? 'hearing' : 'check_circle'}
                          className={result.diagnosis.harshnessDetected ? 'text-amber-400' : 'text-emerald-400'}
                        />
                        <span>Aspereza & Sibilância (3 - 6 kHz)</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${result.diagnosis.harshnessDetected ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
                        {result.diagnosis.harshnessDetected ? 'Atenção: Aspereza' : 'Equilíbrio Suave'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {result.diagnosis.harshnessDetected
                        ? 'Picos de estridência detectados na região de maior sensibilidade auditiva. Considere aplicar de-essing ou atenuação dinâmica.'
                        : 'Frequências agudas confortáveis, com presença e sem fadiga auditiva.'}
                    </p>
                  </div>

                  {/* Air Boost */}
                  <div className="p-5 rounded-2xl border border-outline/10 bg-surface-container-lowest/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold text-on-surface">
                        <Icon name="flare" className="text-primary" />
                        <span>Abertura Ultra-Alta (&gt; 10 kHz)</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${result.diagnosis.airBoostRecommended ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {result.diagnosis.airBoostRecommended ? 'Air Boost Sugerido' : 'Brilho Adequado'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {result.diagnosis.airBoostRecommended
                        ? 'Sua faixa se beneficiará de um ganho sutil de High-Shelf acima de 10 kHz para trazer maior sensação de espaço e arejamento.'
                        : 'Extensão de ultra-altas frequências bem preservada e equilibrada para o gênero.'}
                    </p>
                  </div>

                  {/* Fase Mono no Subgraves */}
                  <div className="p-5 rounded-2xl border border-outline/10 bg-surface-container-lowest/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold text-on-surface">
                        <Icon
                          name={result.diagnosis.subMonoClean ? 'check_circle' : 'warning'}
                          className={result.diagnosis.subMonoClean ? 'text-emerald-400' : 'text-amber-400'}
                        />
                        <span>Compatibilidade Mono (&lt; 100 Hz)</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${result.diagnosis.subMonoClean ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'}`}>
                        {result.diagnosis.subMonoClean ? 'Mono Alinhado' : 'Checar Fase Estéreo'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {result.diagnosis.subMonoClean
                        ? 'Os subgraves estão coerentes em mono, garantindo impacto consistente em clubs e caixas de som profissionais.'
                        : 'Detectada dispersão estéreo excessiva nos subgraves. Recomenda-se colapsar frequências abaixo de 100 Hz para mono.'}
                    </p>
                  </div>
                </div>

                {/* Afinação base */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest/50 border border-outline/10 text-xs text-on-surface-variant">
                  <span>Afinação fundamental de referência (A4):</span>
                  <strong className="font-mono text-secondary text-sm">{result.diagnosis.tuningHz.toFixed(1)} Hz</strong>
                </div>
              </section>
            )}

            {/* 5. Seção: Insights sobre a sua música */}
            {result.feedbacks && result.feedbacks.length > 0 && (
              <section className="rounded-[2rem] p-8 md:p-10 bg-surface-container-high border border-surface-variant space-y-6">
                <div>
                  <h2 className="font-headline-lg text-2xl font-bold text-primary flex items-center gap-2">
                    <Icon name="lightbulb" className="text-secondary" />
                    <span>Insights sobre a sua música</span>
                  </h2>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">
                    Orientações e diagnósticos para aproximar sua mix do perfil de referência de {getGenreLabel(result.genre)}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.feedbacks.map((fb, idx) => {
                    const isHigh = fb.status.toUpperCase() === 'ALTO'
                    const isLow = fb.status.toUpperCase() === 'BAIXO'

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-surface-container-lowest/90 border border-outline/10 flex flex-col justify-between gap-3 hover:border-outline/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-sm font-semibold text-on-surface">
                            {studioLabels[fb.dimensao as keyof typeof studioLabels] || fb.dimensao}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isHigh
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                : isLow
                                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                                : 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                            }`}
                          >
                            {fb.status}
                          </span>
                        </div>
                        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                          {fb.mensagem}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )
      })()}
      </main>

      <BottomNavBar />
    </>
  )
}