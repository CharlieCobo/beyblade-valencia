import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { decodeTokenPayload } from '../lib/jwt'
import type { Session } from '../types/auth.types'

export const AUTH_STORAGE_KEY = 'lvb-auth'

interface AuthState extends Session {
  /** Guarda la sesión a partir del token. Lanza un error si el token no es válido. */
  setSession: (accessToken: string) => void
  clearSession: () => void
}

export const EMPTY_SESSION: Session = { token: null, email: null, exp: null }

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY_SESSION,
      setSession: (accessToken) => {
        const { email, exp } = decodeTokenPayload(accessToken)
        set({ token: accessToken, email, exp })
      },
      clearSession: () => set(EMPTY_SESSION),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, email, exp }): Session => ({ token, email, exp }),
    },
  ),
)
