import { Navigate, Outlet, useLocation } from 'react-router'
import { useUser } from '../hooks/useUser'

/**
 * Ruta de layout que solo deja pasar con una sesión no expirada.
 * Sin ella redirige a /login sustituyendo la entrada del historial y recuerda la página pedida.
 */
export function RequireAuth() {
  const { isExpired } = useUser()
  const location = useLocation()

  if (isExpired) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
