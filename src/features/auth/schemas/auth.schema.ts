import { z } from 'zod'

/** Credenciales del login. Estricto: un campo de más es un bug nuestro. */
export const CredentialsSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
})

export const RoleSchema = z.enum(['ADMIN', 'MEMBER', 'JUDGE'])

/**
 * Perfil almacenado en `users/{uid}`. z.object: los campos que la app no usa (email, displayName…) se ignoran.
 * Sin perfil válido, la cuenta no está habilitada.
 */
export const UserProfileSchema = z.object({
  role: RoleSchema,
})

/** Último perfil validado, guardado en el navegador para arrancar sin conexión. */
export const CachedProfileSchema = z.object({
  uid: z.string().min(1),
  role: RoleSchema,
})

export type Credentials = z.infer<typeof CredentialsSchema>
export type Role = z.infer<typeof RoleSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type CachedProfile = z.infer<typeof CachedProfileSchema>

/** Usuario con sesión iniciada y cuenta habilitada. */
export interface SessionUser {
  uid: string
  email: string
  role: Role
}
