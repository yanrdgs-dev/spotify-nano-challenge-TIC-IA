// Tela de upload — dropzone com drag-and-drop, campos de metadados
// (nome, gênero, BPM), e envio via useUploadFlow.

import { useEffect, useRef, useState, type DragEvent } from 'react'
import clsx from 'clsx'
import { api } from '../api'
import { useUploadFlow } from '../hooks/useUploadFlow'
import { availableGenres } from '../api/fixtures/genres'
import { getGenreLabel } from '../lib/labels'
import type { TrackGenre } from '../types/domain'
import { TopAppBar } from '../components/domain/TopAppBar'
import { BottomNavBar } from '../components/domain/BottomNavBar'
import { Icon } from '../components/ui/Icon'
import { ErrorState } from '../components/ui/ErrorState'

export function UploadPage() {
  const { upload, isUploading, error } = useUploadFlow()
  const inputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [trackName, setTrackName] = useState('')
  const [genre, setGenre] = useState<TrackGenre | ''>('')
  const [bpm, setBpm] = useState('')
  const [genreOptions, setGenreOptions] = useState<string[]>(availableGenres)

  useEffect(() => {
    let isMounted = true
    api
      .getGenres()
      .then((fetched) => {
        if (isMounted && fetched && fetched.length > 0) {
          setGenreOptions(fetched)
        }
      })
      .catch(() => {
        // Fallback silencioso para availableGenres
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleFile = (selected: File) => {
    setFile(selected)
    if (!trackName) {
      setTrackName(selected.name.replace(/\.(mp3|wav|flac|ogg|m4a)$/i, ''))
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return
    upload(file, {
      trackName: trackName || undefined,
      genreHint: genre || undefined,
      bpm: bpm ? Number(bpm) : undefined,
    })
  }

  return (
    <>
      <TopAppBar />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 md:pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          <div className="mb-12 text-center md:text-left">
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary mb-4">
              Injetar Sinal
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Carregue sua faixa de áudio e defina a frequência para a ressonância do deserto.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-8 md:p-12 desert-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <form className="relative z-10 space-y-8" onSubmit={handleSubmit}>
              {/* Dropzone */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                  ARQUIVO DE ÁUDIO (.MP3, .WAV, .FLAC, .OGG)
                </label>
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={clsx(
                    'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group',
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container/50',
                  )}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".mp3,.wav,.flac,.ogg,.m4a,audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0]
                      if (selected) handleFile(selected)
                    }}
                  />

                  {!file ? (
                    <>
                      <Icon
                        name="cloud_upload"
                        className="text-4xl text-primary/70 mb-4 group-hover:text-primary transition-colors duration-300"
                      />
                      <p className="font-body-md text-body-md text-on-surface text-center mb-2">
                        Arraste e solte o arquivo aqui
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-6 text-center">
                        ou clique para selecionar
                      </p>
                      <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-label-md text-label-md border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        Procurar Arquivo
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 bg-surface-container p-3 rounded-lg border border-outline/20 w-full max-w-sm">
                      <Icon name="audio_file" className="text-secondary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-label-md truncate text-on-surface">
                          {file.name}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          if (inputRef.current) inputRef.current.value = ''
                        }}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                      >
                        <Icon name="close" className="text-[20px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalhes da faixa */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="trackName"
                    className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase"
                  >
                    Nome da Faixa
                  </label>
                  <input
                    id="trackName"
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="Ex: Ecos da Areia"
                    className="w-full desert-input rounded-lg px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="genre"
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase"
                    >
                      Aura / Gênero
                    </label>
                    <div className="relative">
                      <select
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value as TrackGenre)}
                        className="w-full desert-input rounded-lg px-4 py-3 font-body-lg text-body-lg text-on-surface appearance-none bg-transparent"
                      >
                        <option value="" disabled className="bg-surface text-on-surface-variant">
                          Selecionar Aura
                        </option>
                        {genreOptions.map((g) => (
                          <option key={g} value={g} className="bg-surface text-on-surface">
                            {getGenreLabel(g)}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="expand_more"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bpm"
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase"
                    >
                      Tempo (BPM)
                    </label>
                    <input
                      id="bpm"
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="120"
                      className="w-full desert-input rounded-lg px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50"
                    />
                  </div>
                </div>
              </div>

              {error && <ErrorState message="Não foi possível enviar o arquivo." />}

              {/* Submit */}
              <div className="pt-6 border-t border-outline/10 flex justify-end">
                <button
                  type="submit"
                  disabled={!file || !genre || isUploading}
                  className="bg-primary-container text-on-primary-container font-headline-md text-label-md py-3 px-8 rounded-lg bloom-hover transition-all duration-300 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isUploading ? 'Sintonizando…' : 'Transmitir Sinal'}</span>
                  <Icon
                    name={isUploading ? 'sync' : 'send'}
                    className={clsx(
                      'text-[20px] transition-transform',
                      isUploading ? 'animate-spin' : 'group-hover:translate-x-1',
                    )}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Overlay de Envio Imediato */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(255,181,161,0.3)]">
            <Icon name="cloud_upload" className="text-3xl text-secondary animate-bounce" />
          </div>
          <h2 className="font-display-lg text-2xl font-bold text-primary mb-2">
            Injetando Sinal de Áudio...
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-sm mb-6">
            Enviando a faixa para a análise espectral. Aguarde um instante...
          </p>
          <div className="w-full max-w-xs h-3 bg-surface-container-lowest rounded-full overflow-hidden border border-outline/20 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-[pulse_1.5s_infinite] w-full" />
          </div>
        </div>
      )}

      <BottomNavBar />
    </>
  )
}