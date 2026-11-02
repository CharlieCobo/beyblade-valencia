import { create } from 'zustand'
import type { SessionUser } from '../schemas/auth.schema'

/** `checking`: aún no se sabe si hay sesión (al arrancar, hasta que responde el servicio de autenticación). */
export type AuthStatus = 'checking' | 'signedIn' | 'signedOut'

interface AuthState {
  status: AuthStatus
  user: SessionUser | null
  setSignedIn: (user: SessionUser) => void
  setSignedOut: () => void
}

/**
 * Reflejo en memoria de la sesión. La fuente de verdad (y la persistencia) es el servicio de autenticación:
 * `useAuthSessionSync` mantiene este store al día.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  user: null,
  setSignedIn: (user) => set({ status: 'signedIn', user }),
  setSignedOut: () => set({ status: 'signedOut', user: null }),
}))
