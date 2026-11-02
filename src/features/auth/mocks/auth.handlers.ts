import { http, HttpResponse } from 'msw'
import { apiUrl } from '@/shared/api/httpClient'
import { LOGIN_PATH } from '../api/auth.api'
import { LoginRequestSchema, type LoginResponse } from '../schemas/auth.schema'
import { TEST_USER } from './authUser.factory'
import { buildFakeJwt, buildTokenPayload } from './jwt'

const unauthorized = () => HttpResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 })

export const authHandlers = [
  http.post(apiUrl(LOGIN_PATH), async ({ request }) => {
    // Un cuerpo que no cumple el contrato se trata como credenciales incorrectas (spec "Endpoint simulado de login").
    const body = LoginRequestSchema.safeParse(await request.json().catch(() => null))
    if (!body.success) return unauthorized()

    const { email, password } = body.data
    if (email !== TEST_USER.email || password !== TEST_USER.password) return unauthorized()

    const accessToken = buildFakeJwt(buildTokenPayload({ sub: TEST_USER.id, email: TEST_USER.email }))
    return HttpResponse.json<LoginResponse>({ accessToken })
  }),
]
