import { Navigate, useLocation, type Location } from 'react-router'
import { useUser } from '../hooks/useUser'
import { LoginForm } from './LoginForm'
import { SessionCheck } from './SessionCheck'

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
  const { status } = useUser()
  const location = useLocation()

  if (status === 'checking') return <SessionCheck />
  // Con sesión (ya identificado o recién iniciada) se vuelve a la página pedida o a /.
  if (status === 'signedIn') return <Navigate to={redirectTarget(location.state)} replace />

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="w-full max-w-[380px] rounded-xl bg-card p-6" aria-labelledby="login-title">
        <h1 id="login-title" className="mt-0 mb-[0.67em] text-[1.5rem] font-bold">
          Beyblade Valencia
        </h1>
        <LoginForm />
      </section>
    </main>
  )
}
