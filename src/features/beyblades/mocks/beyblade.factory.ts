import { faker } from '@faker-js/faker'
import { BeybladeSchema, BeybladeTypeSchema, type Beyblade } from '../schemas/beyblade.schema'

/** Beyblade aleatorio que cumple el contrato. Un override inválido lanza un error en el acto. */
export function buildBeyblade(overrides: Partial<Beyblade> = {}): Beyblade {
  return BeybladeSchema.parse({
    id: faker.string.uuid(),
    name: `${faker.word.adjective({ length: { min: 4, max: 8 } })} ${faker.word.noun()}`,
    type: faker.helpers.arrayElement(BeybladeTypeSchema.options),
    blader: faker.person.fullName(),
    wins: faker.number.int({ min: 0, max: 50 }),
    ...overrides,
  })
}

export function buildBeyblades(count = 5): Beyblade[] {
  return Array.from({ length: count }, () => buildBeyblade())
}
