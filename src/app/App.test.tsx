import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { buildFakeJwt, buildTokenPayload } from '@/features/auth/mocks/jwt'
import { server } from '@/mocks/server'
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

function startSession() {
  useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload()))
}

describe('App', () => {
  it('sin sesión muestra el login y no pide los beyblades', () => {
    const requests: string[] = []
    server.events.on('request:start', ({ request }) => requests.push(request.url))

    renderWithProviders(<App />)

    expect(screen.getByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(requests.filter((url) => url.includes('/beyblades'))).toEqual([])
    server.events.removeAllListeners()
  })

  it('con sesión muestra el título y la lista de beyblades', async () => {
    startSession()

    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /beyblade valencia/i })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(6)
  })

  it('una ruta desconocida sin sesión termina en el login', () => {
    renderWithProviders(<App />, { route: '/no-existe' })

    expect(screen.getByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('el usuario de prueba inicia sesión y ve la lista', async () => {
    const { user } = renderWithProviders(<App />)

    await user.type(screen.getByLabelText(/correo/i), 'test@mail.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'Test1234!')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('region', { name: /listado de beyblades/i })).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('no muestra el aviso de actualización si no hay una versión nueva', async () => {
    startSession()

    renderWithProviders(<App />)

    await screen.findByRole('region', { name: /listado de beyblades/i })
    expect(screen.queryByText(/nueva versión/i)).not.toBeInTheDocument()
  })
})
