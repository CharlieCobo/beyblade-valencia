import { describe, expect, it } from 'vitest'
import { CachedProfileSchema, CredentialsSchema, UserProfileSchema } from './auth.schema'

describe('CredentialsSchema', () => {
  it('acepta correo y contraseña', () => {
    expect(CredentialsSchema.parse({ email: 'test@mail.com', password: 'Test1234!' })).toEqual({
      email: 'test@mail.com',
      password: 'Test1234!',
    })
  })

  it('rechaza campos de más', () => {
    expect(CredentialsSchema.safeParse({ email: 'test@mail.com', password: 'x', remember: true }).success).toBe(false)
  })

  it.each([
    ['un correo inválido', { email: 'test-mail.com', password: 'x' }],
    ['una contraseña vacía', { email: 'test@mail.com', password: '' }],
  ])('rechaza %s', (_, value) => {
    expect(CredentialsSchema.safeParse(value).success).toBe(false)
  })
})

describe('UserProfileSchema', () => {
  it.each(['ADMIN', 'MEMBER', 'JUDGE'])('acepta el rol %s', (role) => {
    expect(UserProfileSchema.parse({ role })).toEqual({ role })
  })

  it('ignora los campos que no usa', () => {
    expect(UserProfileSchema.parse({ role: 'MEMBER', email: 'a@b.es' })).toEqual({ role: 'MEMBER' })
  })

  it.each([
    ['un rol desconocido', { role: 'SUPERUSER' }],
    ['un rol en minúsculas', { role: 'admin' }],
    ['sin rol', {}],
  ])('rechaza %s', (_, value) => {
    expect(UserProfileSchema.safeParse(value).success).toBe(false)
  })
})

describe('CachedProfileSchema', () => {
  it('exige uid y rol', () => {
    expect(CachedProfileSchema.safeParse({ uid: 'u1', role: 'JUDGE' }).success).toBe(true)
    expect(CachedProfileSchema.safeParse({ role: 'JUDGE' }).success).toBe(false)
  })
})
