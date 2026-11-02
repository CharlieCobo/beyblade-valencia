import { describe, expect, it } from 'vitest'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
import { AUTH_STORAGE_KEY, useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  it('empieza sin sesión', () => {
    expect(useAuthStore.getState()).toMatchObject({ token: null, email: null, exp: null })
  })

  it('guarda el token, el correo y la expiración del payload', () => {
    const payload = buildTokenPayload({ email: 'blader@mail.com' })
    const token = buildFakeJwt(payload)

    useAuthStore.getState().setSession(token)

    expect(useAuthStore.getState()).toMatchObject({ token, email: 'blader@mail.com', exp: payload.exp })
  })

  it('persiste la sesión en localStorage', () => {
    const payload = buildTokenPayload()
    const token = buildFakeJwt(payload)

    useAuthStore.getState().setSession(token)

    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}')
    expect(stored.state).toEqual({ token, email: payload.email, exp: payload.exp })
  })

  it('no modifica la sesión si el token no es válido', () => {
    const token = buildFakeJwt(buildTokenPayload())
    useAuthStore.getState().setSession(token)

    expect(() => useAuthStore.getState().setSession('no-es-un-token')).toThrow(/formato inválido/)
    expect(useAuthStore.getState().token).toBe(token)
  })

  it('borra la sesión', () => {
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload()))

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState()).toMatchObject({ token: null, email: null, exp: null })
  })
})
