import { onlineManager, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { authGateway } from '../api/authGateway'
import type { Credentials, SessionUser } from '../schemas/auth.schema'
import { useAuthStore } from '../store/auth.store'

interface SubmitOptions {
  onSuccess?: () => void
}

export function useLogin() {
  const setSignedIn = useAuthStore((state) => state.setSignedIn)
  const [isOffline, setIsOffline] = useState(false)

  const mutation = useMutation<SessionUser, Error, Credentials>({
    mutationFn: (credentials) => authGateway().signIn(credentials),
    onSuccess: (user) => setSignedIn(user),
  })

  function submit(credentials: Credentials, options?: SubmitOptions) {
    // Sin conexión no se llama a `mutate`: una mutación en pausa se reanudaría sola
    // al volver la red e iniciaría sesión sin que el usuario lo pida.
    if (!onlineManager.isOnline()) {
      mutation.reset()
      setIsOffline(true)
      return
    }

    setIsOffline(false)
    mutation.mutate(credentials, { onSuccess: () => options?.onSuccess?.() })
  }

  return {
    submit,
    isOffline,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
