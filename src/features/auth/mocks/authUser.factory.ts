import { faker } from '@faker-js/faker'
import type { AuthUser } from '../types/auth.types'

/** Usuario de prueba aceptado por el endpoint simulado de login. */
export const TEST_USER: AuthUser = {
  id: 'user-test-1',
  email: 'test@mail.com',
  password: 'Test1234!',
}

export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  }
}
