import { describe, expect, it } from 'vitest'
import { BeybladeListSchema, BeybladeSchema } from '../schemas/beyblade.schema'
import { buildBeyblade, buildBeyblades } from './beyblade.factory'

describe('beyblade.factory', () => {
  it('genera beyblades que cumplen el contrato', () => {
    for (const beyblade of buildBeyblades(50)) {
      expect(BeybladeSchema.safeParse(beyblade).success).toBe(true)
    }
  })

  it('permite sobrescribir campos', () => {
    expect(buildBeyblade({ name: 'Valencia Spin' }).name).toBe('Valencia Spin')
  })

  it('lanza si un override no cumple el contrato', () => {
    expect(() => buildBeyblade({ wins: -1 })).toThrow(/wins/)
  })

  it('genera el número pedido de beyblades', () => {
    const beyblades = buildBeyblades(3)

    expect(beyblades).toHaveLength(3)
    expect(BeybladeListSchema.safeParse(beyblades).success).toBe(true)
  })
})
