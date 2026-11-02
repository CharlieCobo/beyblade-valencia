import { describe, expect, it } from 'vitest'
import { BeybladeListSchema, BeybladeSchema, BeybladeTypeSchema } from './beyblade.schema'

const valid = { id: 'b-1', name: 'Pegasus', type: 'attack', blader: 'Gingka', wins: 3 }

describe('BeybladeSchema', () => {
  it('acepta un beyblade válido', () => {
    expect(BeybladeSchema.parse(valid)).toEqual(valid)
  })

  it('descarta los campos que no conoce', () => {
    expect(BeybladeSchema.parse({ ...valid, image: 'pegasus.png' })).toEqual(valid)
  })

  it.each([
    ['falta name', { ...valid, name: undefined }],
    ['name vacío', { ...valid, name: '' }],
    ['wins no numérico', { ...valid, wins: 'diez' }],
    ['wins negativo', { ...valid, wins: -1 }],
    ['wins decimal', { ...valid, wins: 1.5 }],
    ['type desconocido', { ...valid, type: 'speed' }],
    ['blader null', { ...valid, blader: null }],
  ])('rechaza un beyblade con %s', (_, value) => {
    expect(BeybladeSchema.safeParse(value).success).toBe(false)
  })

  it('expone los tipos de beyblade', () => {
    expect(BeybladeTypeSchema.options).toEqual(['attack', 'defense', 'stamina', 'balance'])
  })

  it('valida cada elemento de un listado', () => {
    expect(BeybladeListSchema.safeParse([valid, { ...valid, wins: 'diez' }]).success).toBe(false)
    expect(BeybladeListSchema.parse([])).toEqual([])
  })
})
