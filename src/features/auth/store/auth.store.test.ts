import { describe, expect, it } from 'vitest'
import { useAuthStore } from './auth.store'

describe('auth.store', () => {
  it('guarda el usuario al iniciar sesión', () => {
    const user = { uid: 'u1', email: 'a@b.es', role: 'ADMIN' as const }

    useAuthStore.getState().setSignedIn(user)

    expect(useAuthStore.getState()).toMatchObject({ status: 'signedIn', user })
  })

  it('vacía el usuario al cerrar sesión', () => {
    useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' })

    useAuthStore.getState().setSignedOut()

    expect(useAuthStore.getState()).toMatchObject({ status: 'signedOut', user: null })
  })

  it('no persiste la sesión en el navegador', () => {
    useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' })

    expect(localStorage.length).toBe(0)
  })
})
