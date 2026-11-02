// API pública de la feature: el resto de la app sólo importa desde aquí.
export { LoginPage } from './components/LoginPage'
export { LogoutButton } from './components/LogoutButton'
export { RequireAuth } from './components/RequireAuth'
export { useAuthSessionSync } from './hooks/useAuthSessionSync'
export { useUser, type User } from './hooks/useUser'
export type { Role } from './schemas/auth.schema'
