import { Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
import { useAuthStore } from '../store/auth.store'
import { RequireAuth } from './RequireAuth'

function LoginProbe() {
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from
  return <p>{`login desde ${from?.pathname ?? '-'}`}</p>
}

function renderGuarded(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginProbe />} />
      <Route element={<RequireAuth />}>
        <Route path="/privada" element={<p>contenido privado</p>} />
      </Route>
    </Routes>,
    { route },
  )
}

describe('RequireAuth', () => {
  it('sin sesión redirige a /login recordando la página pedida', () => {
    renderGuarded('/privada')

    expect(screen.getByText('login desde /privada')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('con una sesión caducada redirige a /login', () => {
    const iat = Math.floor(Date.now() / 1000) - 7200
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload({ iat, exp: iat + 3600 })))

    renderGuarded('/privada')

    expect(screen.getByText('login desde /privada')).toBeInTheDocument()
  })

  it('con una sesión vigente muestra la ruta hija', () => {
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload()))

    renderGuarded('/privada')

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})
