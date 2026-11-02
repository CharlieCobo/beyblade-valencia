import { describe, expect, it, vi } from 'vitest'
import { fakeAuth } from '@/features/auth/mocks/fakeAuthGateway'
import { TEST_ACCOUNT } from '@/features/auth/mocks/userProfile.factory'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { buildBeyblades } from '@/features/beyblades/mocks/beyblade.factory'
import { fakeBeyblades } from '@/features/beyblades/mocks/fakeBeybladesRepository'
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

/** Como al abrir la app: la sesión aún no se conoce hasta que responde el servicio de autenticación. */
function openApp(route = '/') {
  useAuthStore.setState({ status: 'checking', user: null })
  return renderWithProviders(<App />, { route })
}

describe('App', () => {
  it('sin sesión muestra el login y no pide los beyblades', async () => {
    const list = vi.spyOn(fakeBeyblades, 'list')

    openApp()

    expect(await screen.findByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(list).not.toHaveBeenCalled()
  })

  it('mientras se comprueba la sesión no redirige al login', () => {
    fakeAuth.startSignedIn()
    fakeAuth.holdSessionCheck()

    openApp()

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión…')
    expect(screen.queryByRole('form', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('con una sesión recuperada muestra el título y la lista de beyblades', async () => {
    fakeAuth.startSignedIn()
    fakeBeyblades.seed(buildBeyblades(6))

    openApp()

    expect(await screen.findByRole('heading', { level: 1, name: /beyblade valencia/i })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(6)
  })

  it('una ruta desconocida sin sesión termina en el login', async () => {
    openApp('/no-existe')

    expect(await screen.findByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('una cuenta habilitada inicia sesión y ve la lista', async () => {
    fakeBeyblades.seed(buildBeyblades(2))
    const { user } = openApp()

    await user.type(await screen.findByLabelText(/correo/i), TEST_ACCOUNT.email)
    await user.type(screen.getByLabelText(/contraseña/i), TEST_ACCOUNT.password)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('region', { name: /listado de beyblades/i })).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('al cerrar sesión vuelve al login y sigue sin sesión', async () => {
    fakeAuth.startSignedIn()
    const { user } = openApp()

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('no muestra el aviso de actualización si no hay una versión nueva', async () => {
    fakeAuth.startSignedIn()
    fakeBeyblades.seed(buildBeyblades(2))

    openApp()

    await screen.findByRole('region', { name: /listado de beyblades/i })
    expect(screen.queryByText(/nueva versión/i)).not.toBeInTheDocument()
  })
})
