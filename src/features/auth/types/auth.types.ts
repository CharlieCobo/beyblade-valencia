export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

/** Payload del token. Los instantes van en segundos desde epoch, como en un JWT. */
export interface TokenPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

/** Sesión guardada en el cliente. `exp` en segundos. */
export interface Session {
  token: string | null
  email: string | null
  exp: number | null
}

export interface AuthUser {
  id: string
  email: string
  password: string
}
