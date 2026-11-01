import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { env } from '@/shared/config/env'
import './index.css'

async function enableMocking() {
  // `import.meta.env.DEV` permite que Vite elimine MSW y Faker del bundle de producción
  if (!import.meta.env.DEV || !env.apiMocking) return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
