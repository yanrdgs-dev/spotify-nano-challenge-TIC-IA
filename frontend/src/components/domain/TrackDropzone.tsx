// Área de upload — aceita clique para abrir o seletor de arquivo,
// e arrastar-e-soltar. Só repassa o File escolhido para o callback.

import { useRef, useState, type DragEvent } from 'react'
import clsx from 'clsx'

interface TrackDropzoneProps {
  onFileSelected: (file: File) => void
}

export function TrackDropzone({ onFileSelected }: TrackDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-12 text-center transition-colors',
        isDragging
          ? 'border-accent bg-accent/10'
          : 'border-border bg-surface-elevated hover:border-accent',
      )}
    >
      <p className="text-text-primary">Arraste um arquivo .mp3 aqui</p>
      <p className="text-sm text-text-muted">ou clique para selecionar</p>
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />
    </div>
  )
}