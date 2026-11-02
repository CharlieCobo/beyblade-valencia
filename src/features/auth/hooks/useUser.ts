import { useShallow } from 'zustand/react/shallow'
import type { Role } from '../schemas/auth.schema'
import { useAuthStore, type AuthStatus } from '../store/auth.store'

export interface User {
  status: AuthStatus
  email: string | null
  role: Role | null
}

export function useUser(): User {
  return useAuthStore(
    useShallow(({ status, user }) => ({ status, email: user?.email ?? null, role: user?.role ?? null })),
  )
}
