import { Navigate, useLocation, type Location } from 'react-router'
import { useUser } from '../hooks/useUser'
import { LoginForm } from './LoginForm'

interface LoginLocationState {
  from?: Location
}

/** Ruta interna a la que volver tras el login. Solo se acepta un location del propio router. */
function redirectTarget(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from
  if (!from || typeof from.pathname !== 'string' || !from.pathname.startsWith('/')) return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

export function LoginPage() {
  const { isExpired } = useUser()
  const location = useLocation()

  // Con sesión vigente (ya identificado o recién iniciada) se vuelve a la página pedida o a /.
  if (!isExpired) return <Navigate to={redirectTarget(location.state)} replace />

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Beyblade Valencia</h1>
        <LoginForm />
      </section>
    </main>
  )
}
