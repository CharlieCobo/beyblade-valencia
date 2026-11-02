import { afterEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { apiUrl } from '@/shared/api/httpClient'
import { buildAuthUser, TEST_USER } from '../mocks/authUser.factory'
import { login, LOGIN_PATH } from './auth.api'

function decodePayload(token: string) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')))
}

describe('login', () => {
  afterEach(() => server.events.removeAllListeners())

  it('envía en el cuerpo solo el correo y la contraseña', async () => {
    const bodies: unknown[] = []
    server.events.on('request:start', async ({ request }) => {
      if (request.url === apiUrl(LOGIN_PATH)) bodies.push(await request.clone().json())
    })
    const credentials = { email: TEST_USER.email, password: TEST_USER.password, remember: true }

    // Un campo de más (p. ej. de un objeto de formulario) no llega a la API: la petición ni se envía.
    await expect(login(credentials)).rejects.toMatchObject({ name: 'ContractError', direction: 'request' })
    await login({ email: TEST_USER.email, password: TEST_USER.password })

    expect(bodies).toEqual([{ email: TEST_USER.email, password: TEST_USER.password }])
  })

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
