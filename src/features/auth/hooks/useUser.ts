import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../store/auth.store'

export interface User {
  token: string | null
  email: string | null
  /** `true` si no hay sesión o si su expiración ya ha pasado. Se calcula en cada render. */
  isExpired: boolean
}

export function useUser(): User {
  const { token, email, exp } = useAuthStore(useShallow(({ token, email, exp }) => ({ token, email, exp })))
  // Se calcula en cada render a propósito (ver design.md, decisión 2): un booleano guardado se quedaría obsoleto.
  // oxlint-disable-next-line react/purity
  const isExpired = token === null || exp === null || exp * 1000 <= Date.now()

  return { token, email, isExpired }
}
