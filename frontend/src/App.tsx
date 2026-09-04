// Componente raiz — envolve as rotas com o ErrorBoundary.

import { AppRouter } from './router'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App