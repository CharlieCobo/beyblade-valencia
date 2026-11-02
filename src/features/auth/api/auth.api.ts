import { httpPost } from '@/shared/api/httpClient'
import { LoginRequestSchema, LoginResponseSchema, type LoginRequest, type LoginResponse } from '../schemas/auth.schema'

export const LOGIN_PATH = '/auth/login'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return httpPost(LOGIN_PATH, credentials, { request: LoginRequestSchema, response: LoginResponseSchema })
}
