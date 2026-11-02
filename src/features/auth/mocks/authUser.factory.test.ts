import { describe, expect, it } from 'vitest'
import { AuthUserSchema } from '../schemas/auth.schema'
import { buildAuthUser, TEST_USER } from './authUser.factory'

describe('authUser.factory', () => {
  it('genera un usuario con correo válido', () => {
    const user = buildAuthUser()

    expect(user.id).toEqual(expect.any(String))
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(user.password.length).toBeGreaterThan(0)
  })

  it('genera usuarios que cumplen el contrato', () => {
    for (let i = 0; i < 50; i++) {
      expect(AuthUserSchema.safeParse(buildAuthUser()).success).toBe(true)
    }
  })

  it('lanza si un override no cumple el contrato', () => {
    expect(() => buildAuthUser({ email: 'no-es-un-correo' })).toThrow(/email/)
  })

  it('permite sobrescribir campos', () => {
    expect(buildAuthUser({ email: 'blader@mail.com' }).email).toBe('blader@mail.com')
  })

  it('expone el usuario de prueba', () => {
    expect(TEST_USER).toMatchObject({ email: 'test@mail.com', password: 'Test1234!' })
  })
})
