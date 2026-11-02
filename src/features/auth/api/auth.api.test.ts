import { describe, expect, it } from 'vitest'
import { buildAuthUser, TEST_USER } from '../mocks/authUser.factory'
import { login } from './auth.api'

function decodePayload(token: string) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')))
}

describe('login', () => {
  it('devuelve un token del usuario de prueba válido durante una hora', async () => {
    const { accessToken } = await login({ email: TEST_USER.email, password: TEST_USER.password })

    const payload = decodePayload(accessToken)
    expect(payload).toMatchObject({ sub: TEST_USER.id, email: 'test@mail.com' })
    expect(payload.exp - payload.iat).toBe(3600)
  })

  it('rechaza con 401 una contraseña incorrecta', async () => {
    await expect(login({ email: TEST_USER.email, password: 'otra' })).rejects.toMatchObject({ status: 401 })
  })

  it('rechaza con 401 un usuario desconocido', async () => {
    const user = buildAuthUser()

    await expect(login({ email: user.email, password: user.password })).rejects.toMatchObject({
      name: 'HttpError',
      status: 401,
    })
  })
})
