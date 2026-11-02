import { CachedProfileSchema, UserProfileSchema, type SessionUser } from '../schemas/auth.schema'
import { AccountNotEnabledError, InvalidCredentialsError } from './errors'

/*
 * Lógica pura de la sesión, común a la implementación de Firebase y a la de los tests.
 */

export const PROFILES_COLLECTION = 'users'
export const CACHED_PROFILE_KEY = 'lvb-profile'
/** Clave de la sesión de la versión anterior (JWT propio). Se borra al arrancar. */
export const LEGACY_SESSION_KEY = 'lvb-auth'

/** Usuario de la sesión a partir del perfil almacenado. Sin perfil o con un rol inválido, la cuenta no está habilitada. */
export function toSessionUser(uid: string, email: string | null, storedProfile: unknown): SessionUser {
  const profile = UserProfileSchema.safeParse(storedProfile)
  if (!profile.success) throw new AccountNotEnabledError()
  return { uid, email: email ?? '', role: profile.data.role }
}

const INVALID_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-email',
])

function errorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }
  return null
}

/** Traduce un error de inicio de sesión del SDK a uno de dominio. Los no reconocidos se devuelven tal cual (inesperados). */
export function toSignInError(error: unknown): Error {
  const code = errorCode(error)
  if (code !== null && INVALID_CREDENTIAL_CODES.has(code)) return new InvalidCredentialsError()
  if (code === 'auth/user-disabled') return new AccountNotEnabledError()
  return error instanceof Error ? error : new Error(String(error))
}

/** Firestore no puede responder por falta de conexión. */
export function isUnavailable(error: unknown): boolean {
  return errorCode(error) === 'unavailable'
}

/** Firestore rechazó la lectura por las reglas. */
export function isPermissionDenied(error: unknown): boolean {
  return errorCode(error) === 'permission-denied'
}

function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Último perfil validado de `uid`, o `null` si no hay, es de otra cuenta o no cumple el contrato. */
export function readCachedProfile(uid: string): SessionUser['role'] | null {
  try {
    const raw = safeStorage()?.getItem(CACHED_PROFILE_KEY)
    if (!raw) return null
    const cached = CachedProfileSchema.safeParse(JSON.parse(raw))
    return cached.success && cached.data.uid === uid ? cached.data.role : null
  } catch {
    return null
  }
}

export function writeCachedProfile({ uid, role }: SessionUser): void {
  try {
    safeStorage()?.setItem(CACHED_PROFILE_KEY, JSON.stringify({ uid, role }))
  } catch {
    // Sin almacenamiento (modo privado, cuota…): solo se pierde el arranque sin conexión.
  }
}

export function clearCachedProfile(): void {
  try {
    safeStorage()?.removeItem(CACHED_PROFILE_KEY)
  } catch {
    // Ídem.
  }
}

export function clearLegacySession(): void {
  try {
    safeStorage()?.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // Ídem.
  }
}
