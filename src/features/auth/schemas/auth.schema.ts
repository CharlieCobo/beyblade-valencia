import { z } from 'zod'
import { decodeTokenPayload } from '../lib/jwt'

export { TokenPayloadSchema, type TokenPayload } from './token.schema'

/** Cuerpo de POST /auth/login. Estricto: un campo de más es un bug nuestro. */
export const LoginRequestSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
})

function isDecodableToken(token: string): boolean {
  try {
    decodeTokenPayload(token)
    return true
  } catch {
    return false
  }
}

/** Respuesta de POST /auth/login. El token debe tener forma de JWT y el payload esperado. */
export const LoginResponseSchema = z.object({
  accessToken: z.string().refine(isDecodableToken, 'El token no tiene forma de JWT o le faltan campos del payload'),
})

/** Sesión guardada en el navegador. Vacía: los tres campos a null. `exp` en segundos. */
export const SessionSchema = z.object({
  token: z.string().nullable(),
  email: z.string().nullable(),
  exp: z.number().nullable(),
})

/** Usuario de la API simulada (solo mocks). */
export const AuthUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type Session = z.infer<typeof SessionSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
