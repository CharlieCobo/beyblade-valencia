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

  describe('al recuperar la sesión guardada', () => {
    function store(state: unknown) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ state, version: 0 }))
    }

    it('recupera una sesión válida', async () => {
      const payload = buildTokenPayload()
      const token = buildFakeJwt(payload)
      store({ token, email: payload.email, exp: payload.exp })

      await useAuthStore.persist.rehydrate()

      expect(useAuthStore.getState()).toMatchObject({ token, email: payload.email, exp: payload.exp })
    })

    it('descarta una sesión corrupta y la borra del almacenamiento', async () => {
      store({ token: 'abc', email: 'test@mail.com', exp: 'mañana' })

      await useAuthStore.persist.rehydrate()

      expect(useAuthStore.getState()).toMatchObject({ token: null, email: null, exp: null })
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    })

    it('descarta un valor que ni siquiera es una sesión', async () => {
      store('hola')

      await useAuthStore.persist.rehydrate()

      expect(useAuthStore.getState().token).toBeNull()
    })
  })
})
