import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
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
      <App />
    </StrictMode>,
  )
})
