import { httpPost } from '@/shared/api/httpClient'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

export const LOGIN_PATH = '/auth/login'

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return httpPost<LoginCredentials, LoginResponse>(LOGIN_PATH, credentials)
}
