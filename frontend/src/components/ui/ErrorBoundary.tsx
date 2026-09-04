// Error boundary de última linha de defesa — captura erros de renderização
// que escapam do fluxo normal de try/catch (ex: erro inesperado em um componente).
// Precisa ser class component: é a única forma que o React oferece para isso.

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './ErrorState'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado capturado pelo ErrorBoundary:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="Ocorreu um erro inesperado nesta tela."
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}