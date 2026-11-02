import { Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { TEST_USER } from '../mocks/authUser.factory'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
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
  await user.type(screen.getByLabelText(/correo/i), TEST_USER.email)
  await user.type(screen.getByLabelText(/contraseña/i), TEST_USER.password)
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

  it('con una sesión vigente redirige a /', () => {
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload()))

    renderLogin()

    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/)
  })

  it('con una sesión caducada muestra el formulario', () => {
    const iat = Math.floor(Date.now() / 1000) - 7200
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload({ iat, exp: iat + 3600 })))

    renderLogin()

    expect(screen.getByRole('form', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })
})
