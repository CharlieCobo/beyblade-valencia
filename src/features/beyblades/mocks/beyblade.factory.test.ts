import { describe, expect, it } from 'vitest'
import { BEYBLADE_TYPES } from '../types/beyblade.types'
import { buildBeyblade, buildBeyblades } from './beyblade.factory'

describe('beyblade.factory', () => {
  it('genera un beyblade válido', () => {
    const beyblade = buildBeyblade()

    expect(beyblade.id).toEqual(expect.any(String))
    expect(BEYBLADE_TYPES).toContain(beyblade.type)
    expect(beyblade.wins).toBeGreaterThanOrEqual(0)
  })

  it('permite sobrescribir campos', () => {
    expect(buildBeyblade({ name: 'Valencia Spin' }).name).toBe('Valencia Spin')
  })

  it('genera el número pedido de beyblades', () => {
    expect(buildBeyblades(3)).toHaveLength(3)
  })
})
