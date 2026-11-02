import { faker } from '@faker-js/faker'
import { RoleSchema, UserProfileSchema, type UserProfile } from '../schemas/auth.schema'

/** Perfil aleatorio que cumple el contrato. Un override inválido lanza un error en el acto. */
export function buildUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return UserProfileSchema.parse({
    role: faker.helpers.arrayElement(RoleSchema.options),
    ...overrides,
  })
}

/** Cuenta habilitada de los tests (en Firebase existe una equivalente para probar a mano). */
export const TEST_ACCOUNT = {
  uid: 'user-test-1',
  email: 'test@mail.com',
  password: 'Test1234!',
  profile: buildUserProfile({ role: 'MEMBER' }),
} as const
