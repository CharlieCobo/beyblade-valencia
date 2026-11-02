import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { decodeTokenPayload } from '../lib/jwt'
import { SessionSchema, type Session } from '../schemas/auth.schema'

export const AUTH_STORAGE_KEY = 'lvb-auth'

interface AuthState extends Session {
  /** Guarda la sesión a partir del token. Lanza un error si el token no es válido. */
  setSession: (accessToken: string) => void
  clearSession: () => void
}

export const EMPTY_SESSION: Session = { token: null, email: null, exp: null }

const storage = createJSONStorage<Session>(() => localStorage)

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
      storage,
      partialize: ({ token, email, exp }): Session => ({ token, email, exp }),
      // Lo guardado en el navegador es un dato externo: si no cumple el contrato (corrupto, editado a mano
      // o de otra versión) se descarta, se borra del almacenamiento y el usuario queda sin sesión.
      merge: (persisted, current) => {
        const session = SessionSchema.safeParse(persisted)
        if (session.success) return { ...current, ...session.data }
        storage?.removeItem(AUTH_STORAGE_KEY)
        return { ...current, ...EMPTY_SESSION }
      },
    },
  ),
)
