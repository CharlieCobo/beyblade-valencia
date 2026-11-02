import { onlineManager, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { login } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

interface SubmitOptions {
  onSuccess?: () => void
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  const [isOffline, setIsOffline] = useState(false)

  const mutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: ({ accessToken }) => setSession(accessToken),
  })

  function submit(credentials: LoginCredentials, options?: SubmitOptions) {
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
