import { describe, expect, it } from 'vitest'
import { UserProfileSchema } from '../schemas/auth.schema'
import { buildUserProfile, TEST_ACCOUNT } from './userProfile.factory'

describe('userProfile.factory', () => {
  it('genera perfiles que cumplen el contrato', () => {
    for (let i = 0; i < 50; i++) {
      expect(UserProfileSchema.safeParse(buildUserProfile()).success).toBe(true)
    }
  })

  it('permite fijar el rol', () => {
    expect(buildUserProfile({ role: 'JUDGE' })).toEqual({ role: 'JUDGE' })
  })

  it('lanza si un override no cumple el contrato', () => {
    // @ts-expect-error rol inválido a propósito
    expect(() => buildUserProfile({ role: 'SUPERUSER' })).toThrow(/role/)
  })

  it('la cuenta de prueba es un miembro', () => {
    expect(TEST_ACCOUNT).toMatchObject({ email: 'test@mail.com', profile: { role: 'MEMBER' } })
  })
})
