import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { App } from './App'

// En jsdom no hay service worker: se simula el registro sin versión pendiente.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn<(value: boolean) => void>()],
    offlineReady: [false, vi.fn<(value: boolean) => void>()],
    updateServiceWorker: vi.fn<(reloadPage?: boolean) => Promise<void>>(),
  }),
}))

describe('App', () => {
  it('renderiza el título principal', async () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /beyblade valencia/i })).toBeInTheDocument()
    expect(await screen.findByRole('region', { name: /listado de beyblades/i })).toBeInTheDocument()
  })

  it('no muestra el aviso de actualización si no hay una versión nueva', async () => {
    renderWithProviders(<App />)

    await screen.findByRole('region', { name: /listado de beyblades/i })
    expect(screen.queryByText(/nueva versión/i)).not.toBeInTheDocument()
  })
})
