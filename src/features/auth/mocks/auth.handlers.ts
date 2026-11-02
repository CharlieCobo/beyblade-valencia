import { http, HttpResponse } from 'msw'
import { apiUrl } from '@/shared/api/httpClient'
import { LOGIN_PATH } from '../api/auth.api'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'
import { TEST_USER } from './authUser.factory'
import { buildFakeJwt, buildTokenPayload } from './jwt'

export const authHandlers = [
  http.post(apiUrl(LOGIN_PATH), async ({ request }) => {
    const { email, password } = (await request.json()) as Partial<LoginCredentials>

    if (email !== TEST_USER.email || password !== TEST_USER.password) {
      return HttpResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 })
    }

    const accessToken = buildFakeJwt(buildTokenPayload({ sub: TEST_USER.id, email: TEST_USER.email }))
    return HttpResponse.json<LoginResponse>({ accessToken })
  }),
]
