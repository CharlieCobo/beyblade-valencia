import { faker } from '@faker-js/faker'
import { AuthUserSchema, type AuthUser } from '../schemas/auth.schema'

/** Usuario de prueba aceptado por el endpoint simulado de login. */
export const TEST_USER: AuthUser = AuthUserSchema.parse({
  id: 'user-test-1',
  email: 'test@mail.com',
  password: 'Test1234!',
})

/** Usuario aleatorio que cumple el contrato. Un override inválido lanza un error en el acto. */
export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return AuthUserSchema.parse({
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  })
}
