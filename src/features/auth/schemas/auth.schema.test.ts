import { describe, expect, it } from 'vitest'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
import { LoginRequestSchema, LoginResponseSchema, SessionSchema, TokenPayloadSchema } from './auth.schema'

describe('LoginRequestSchema', () => {
  it('acepta correo y contraseña', () => {
    expect(LoginRequestSchema.parse({ email: 'test@mail.com', password: 'Test1234!' })).toEqual({
      email: 'test@mail.com',
      password: 'Test1234!',
    })
  })

  it('rechaza campos de más', () => {
    expect(LoginRequestSchema.safeParse({ email: 'test@mail.com', password: 'x', remember: true }).success).toBe(false)
  })

  it.each([
    ['un correo inválido', { email: 'test-mail.com', password: 'x' }],
    ['una contraseña vacía', { email: 'test@mail.com', password: '' }],
    ['sin contraseña', { email: 'test@mail.com' }],
  ])('rechaza %s', (_, value) => {
    expect(LoginRequestSchema.safeParse(value).success).toBe(false)
  })
})

describe('LoginResponseSchema', () => {
  it('acepta un token con el payload esperado', () => {
    const accessToken = buildFakeJwt(buildTokenPayload())

    expect(LoginResponseSchema.parse({ accessToken })).toEqual({ accessToken })
  })

  it('rechaza un token sin forma de JWT', () => {
    expect(LoginResponseSchema.safeParse({ accessToken: 'no-es-un-jwt' }).success).toBe(false)
  })

  it('rechaza un token cuyo payload no tiene los campos esperados', () => {
    const accessToken = buildFakeJwt({ ...buildTokenPayload(), exp: 'mañana' } as never)

    expect(LoginResponseSchema.safeParse({ accessToken }).success).toBe(false)
  })

  it('rechaza una respuesta sin token', () => {
    expect(LoginResponseSchema.safeParse({}).success).toBe(false)
  })
})

describe('TokenPayloadSchema', () => {
  it('descarta claims que la app no usa', () => {
    const payload = buildTokenPayload()

    expect(TokenPayloadSchema.parse({ ...payload, iss: 'lvb' })).toEqual(payload)
  })
})

describe('SessionSchema', () => {
  it('acepta la sesión vacía y una sesión completa', () => {
    expect(SessionSchema.safeParse({ token: null, email: null, exp: null }).success).toBe(true)
    expect(SessionSchema.safeParse({ token: 't', email: 'test@mail.com', exp: 1 }).success).toBe(true)
  })

  it('rechaza una expiración que no es un número', () => {
    expect(SessionSchema.safeParse({ token: 't', email: 'test@mail.com', exp: 'mañana' }).success).toBe(false)
  })
})
