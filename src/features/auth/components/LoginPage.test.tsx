import { Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { TEST_ACCOUNT } from '../mocks/userProfile.factory'
import { useAuthStore } from '../store/auth.store'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'

function CurrentPath() {
  const location = useLocation()
  return <p data-testid="path">{`${location.pathname}${location.search}`}</p>
}

function renderLogin(route = '/login') {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="*" element={<CurrentPath />} />
      </Route>
    </Routes>,
    { route },
  )
}

async function login(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.type(screen.getByLabelText(/correo/i), TEST_ACCOUNT.email)
  await user.type(screen.getByLabelText(/contraseña/i), TEST_ACCOUNT.password)
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('LoginPage', () => {
  it('tras iniciar sesión sin página de origen navega a /', async () => {
    const { user } = renderLogin()

    await login(user)

    expect(await screen.findByTestId('path')).toHaveTextContent(/^\/$/)
  })

  it('tras iniciar sesión vuelve a la página que se intentaba abrir', async () => {
    const { user } = renderLogin('/torneos?ciudad=valencia')

    expect(await screen.findByRole('heading', { name: 'Beyblade Valencia' })).toBeInTheDocument()
    await login(user)

    expect(await screen.findByTestId('path')).toHaveTextContent('/torneos?ciudad=valencia')
  })

  it('con una sesión activa redirige a /', () => {
    useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'a@b.es', role: 'MEMBER' })

    renderLogin()

    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/)
  })

  it('mientras se comprueba la sesión no muestra el formulario', () => {
    useAuthStore.setState({ status: 'checking', user: null })

    renderLogin()

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión…')
    expect(screen.queryByRole('form', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('sin sesión muestra el formulario', () => {
    renderLogin()

    expect(screen.getByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })
})
