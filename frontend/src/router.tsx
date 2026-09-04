// Definição de todas as rotas do app.

import { Routes, Route } from 'react-router-dom'
import { SummaryPage } from './pages/SummaryPage'
import { UploadPage } from './pages/UploadPage'
import { AnalyzingPage } from './pages/AnalyzingPage'
import { ConfirmGenrePage } from './pages/ConfirmGenrePage'
import { ResultsPage } from './pages/ResultsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SummaryPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/analyzing/:analysisId" element={<AnalyzingPage />} />
      <Route path="/confirm-genre/:analysisId" element={<ConfirmGenrePage />} />
      <Route path="/results/:analysisId" element={<ResultsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}