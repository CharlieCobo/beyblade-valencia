import { useNavigate } from 'react-router'
import { authGateway } from '../api/authGateway'
import { useAuthStore } from '../store/auth.store'

/** Cierra la sesión y lleva al login sustituyendo la entrada del historial. */
export function useLogout(): () => Promise<void> {
  const setSignedOut = useAuthStore((state) => state.setSignedOut)
  const navigate = useNavigate()

  return async () => {
    try {
      await authGateway().signOut()
    } finally {
      // Aunque el servicio falle, en esta pestaña el usuario deja de tener sesión.
      setSignedOut()
      navigate('/login', { replace: true })
    }
  }
}
