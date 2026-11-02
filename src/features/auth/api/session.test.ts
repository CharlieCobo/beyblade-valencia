import { describe, expect, it } from 'vitest'
import { AccountNotEnabledError, InvalidCredentialsError } from './errors'
import {
  CACHED_PROFILE_KEY,
  clearCachedProfile,
  clearLegacySession,
  isPermissionDenied,
  isUnavailable,
  LEGACY_SESSION_KEY,
  readCachedProfile,
  toSessionUser,
  toSignInError,
  writeCachedProfile,
} from './session'

const withCode = (code: string) => Object.assign(new Error(code), { code })

describe('toSessionUser', () => {
  it('construye el usuario con el rol del perfil', () => {
    expect(toSessionUser('u1', 'a@b.es', { role: 'JUDGE', extra: 1 })).toEqual({
      uid: 'u1',
      email: 'a@b.es',
      role: 'JUDGE',
    })
  })

  it.each([
    ['sin perfil', undefined],
    ['con un rol desconocido', { role: 'SUPERUSER' }],
    ['sin rol', {}],
  ])('lanza AccountNotEnabledError %s', (_, profile) => {
    expect(() => toSessionUser('u1', 'a@b.es', profile)).toThrow(AccountNotEnabledError)
  })
})

describe('toSignInError', () => {
  it.each(['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-email'])(
    'traduce %s a credenciales incorrectas',
    (code) => {
      expect(toSignInError(withCode(code))).toBeInstanceOf(InvalidCredentialsError)
    },
  )

  it('traduce una cuenta deshabilitada a cuenta no habilitada', () => {
    expect(toSignInError(withCode('auth/user-disabled'))).toBeInstanceOf(AccountNotEnabledError)
  })

  it.each(['auth/network-request-failed', 'auth/too-many-requests'])('deja %s como error inesperado', (code) => {
    const error = withCode(code)
    expect(toSignInError(error)).toBe(error)
  })

  it('convierte en Error lo que no lo es', () => {
    expect(toSignInError('fallo')).toEqual(new Error('fallo'))
  })
})

describe('códigos de Firestore', () => {
  it('reconoce la falta de conexión y el rechazo de las reglas', () => {
    expect(isUnavailable(withCode('unavailable'))).toBe(true)
    expect(isUnavailable(withCode('permission-denied'))).toBe(false)
    expect(isPermissionDenied(withCode('permission-denied'))).toBe(true)
    expect(isPermissionDenied(new Error('x'))).toBe(false)
  })
})

describe('perfil en caché', () => {
  it('devuelve el rol guardado de la misma cuenta', () => {
    writeCachedProfile({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' })

    expect(readCachedProfile('u1')).toBe('ADMIN')
    expect(JSON.parse(localStorage.getItem(CACHED_PROFILE_KEY)!)).toEqual({ uid: 'u1', role: 'ADMIN' })
  })

  it('no devuelve el perfil de otra cuenta', () => {
    writeCachedProfile({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' })

    expect(readCachedProfile('u2')).toBeNull()
  })

  it.each([
    ['JSON inválido', '{no'],
    ['un rol inválido', JSON.stringify({ uid: 'u1', role: 'SUPERUSER' })],
  ])('ignora una caché con %s', (_, raw) => {
    localStorage.setItem(CACHED_PROFILE_KEY, raw)

    expect(readCachedProfile('u1')).toBeNull()
  })

  it('se puede borrar', () => {
    writeCachedProfile({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' })
    clearCachedProfile()

    expect(readCachedProfile('u1')).toBeNull()
  })
})

describe('clearLegacySession', () => {
  it('borra la sesión de la versión anterior', () => {
    localStorage.setItem(LEGACY_SESSION_KEY, '{"state":{"token":"x"}}')
    clearLegacySession()

    expect(localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull()
  })
})
