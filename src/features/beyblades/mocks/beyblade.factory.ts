import { faker } from '@faker-js/faker'
import { BEYBLADE_TYPES, type Beyblade } from '../types/beyblade.types'

export function buildBeyblade(overrides: Partial<Beyblade> = {}): Beyblade {
  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective({ length: { min: 4, max: 8 } })} ${faker.word.noun()}`,
    type: faker.helpers.arrayElement(BEYBLADE_TYPES),
    blader: faker.person.fullName(),
    wins: faker.number.int({ min: 0, max: 50 }),
    ...overrides,
  }
}

export function buildBeyblades(count = 5): Beyblade[] {
  return Array.from({ length: count }, () => buildBeyblade())
}
