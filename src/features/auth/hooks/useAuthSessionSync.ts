import { useEffect } from 'react'
import { authGateway } from '../api/authGateway'
import { clearLegacySession } from '../api/session'
import { useAuthStore } from '../store/auth.store'

/** Mantiene el store de sesión al día con el servicio de autenticación. Se monta una vez, en la raíz de la app. */
export function useAuthSessionSync(): void {
  const setSignedIn = useAuthStore((state) => state.setSignedIn)
  const setSignedOut = useAuthStore((state) => state.setSignedOut)

  useEffect(() => {
    clearLegacySession()
    return authGateway().onSessionChange((change) => {
      if (change.status === 'signedIn') setSignedIn(change.user)
      else setSignedOut()
    })
  }, [setSignedIn, setSignedOut])
}
