import type { Credentials, SessionUser } from '../schemas/auth.schema'

/** Estado de la sesión que comunica el servicio de autenticación. */
export type SessionChange = { status: 'signedIn'; user: SessionUser } | { status: 'signedOut' }

/**
 * Acceso al servicio de autenticación. En la app es Firebase; en los tests, una implementación en memoria.
 * Los errores son de dominio: `InvalidCredentialsError`, `AccountNotEnabledError` u otro (inesperado).
 */
export interface AuthGateway {
  /** Inicia sesión y resuelve con el usuario cuando su perfil está validado. */
  signIn(credentials: Credentials): Promise<SessionUser>
  signOut(): Promise<void>
  /** Avisa del estado actual en cuanto se conoce y de cada cambio posterior. Devuelve la función para dejar de escuchar. */
  onSessionChange(listener: (change: SessionChange) => void): () => void
}

// La implementación real carga el SDK de Firebase solo cuando se usa por primera vez (chunk aparte).
const loadFirebaseGateway = () => import('./firebaseAuthGateway').then((module) => module.firebaseAuthGateway)

const firebaseGateway: AuthGateway = {
  signIn: async (credentials) => (await loadFirebaseGateway()).signIn(credentials),
  signOut: async () => (await loadFirebaseGateway()).signOut(),
  onSessionChange(listener) {
    let unsubscribe: (() => void) | null = null
    let cancelled = false
    loadFirebaseGateway()
      .then((gateway) => {
        if (!cancelled) unsubscribe = gateway.onSessionChange(listener)
      })
      // Si el SDK no carga (p. ej. sin conexión y sin caché), no se puede saber si hay sesión.
      .catch(() => {
        if (!cancelled) listener({ status: 'signedOut' })
      })
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  },
}

let gateway: AuthGateway = firebaseGateway

/** Sustituye el gateway (los tests instalan uno en memoria). */
export function setAuthGateway(next: AuthGateway): void {
  gateway = next
}

/** Vuelve al gateway de Firebase. */
export function resetAuthGateway(): void {
  gateway = firebaseGateway
}

export function authGateway(): AuthGateway {
  return gateway
}
