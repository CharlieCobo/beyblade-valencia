import { Navigate, Outlet, useLocation } from 'react-router'
import { useUser } from '../hooks/useUser'
import { SessionCheck } from './SessionCheck'

/**
 * Ruta de layout que solo deja pasar con una sesión activa. Mientras se comprueba la sesión espera;
 * sin ella redirige a /login sustituyendo la entrada del historial y recuerda la página pedida.
 */
export function RequireAuth() {
  const { status } = useUser()
  const location = useLocation()

  if (status === 'checking') return <SessionCheck />
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
