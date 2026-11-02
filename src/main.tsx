import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from '@/app/App'
import { queryClient } from '@/app/queryClient'
import { setHttpTransport } from '@/shared/api/httpClient'
import './index.css'

async function enableMocking() {
  // Comparar directamente con import.meta.env permite a Vite eliminar MSW y Faker
  // del bundle cuando los mocks están desactivados (build de producción normal).
  if (import.meta.env.VITE_API_MOCKING !== 'enabled') return
  const { mockTransport } = await import('@/mocks/transport')
  setHttpTransport(mockTransport)
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {/* BASE_URL es / o /beyblade-valencia/ según el modo de build */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
})
