// Hook genérico para carregar dados assíncronos com estado de loading/erro/reload.
// Não conhece o domínio — reutilizável para qualquer chamada de API.

import { useCallback, useEffect, useState } from 'react'

interface AsyncDataState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await fetcher()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Erro desconhecido'),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}