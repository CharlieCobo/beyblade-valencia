import { Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
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

  it('mientras se comprueba la sesión espera sin redirigir', () => {
    useAuthStore.setState({ status: 'checking', user: null })

    renderGuarded('/privada')

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión…')
    expect(screen.queryByText(/login desde/)).not.toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('con sesión muestra la ruta hija', () => {
    useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'a@b.es', role: 'MEMBER' })

    renderGuarded('/privada')

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})
