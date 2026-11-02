import { describe, expect, it } from 'vitest'
import { ContractError } from '@/shared/contracts/ContractError'
import { fakeBeyblades } from '../mocks/fakeBeybladesRepository'
import { getBeyblades } from './beyblades.api'

// Datos escritos a mano a propósito: la factory no permite construir beyblades inválidos.
const valid = { name: 'Pegasus', type: 'attack', blader: 'Gingka', wins: 3 }

describe('getBeyblades', () => {
  it('devuelve los documentos válidos con el id del documento', async () => {
    fakeBeyblades.seedRaw([{ id: 'b-1', data: valid }])

    await expect(getBeyblades()).resolves.toEqual([{ id: 'b-1', ...valid }])
  })

  it('ignora los campos que no conoce', async () => {
    fakeBeyblades.seedRaw([{ id: 'b-1', data: { ...valid, image: 'pegasus.png' } }])

    await expect(getBeyblades()).resolves.toEqual([{ id: 'b-1', ...valid }])
  })

  it('rechaza con un ContractError que nombra el documento si un campo tiene otro tipo', async () => {
    fakeBeyblades.seedRaw([
      { id: 'b-1', data: valid },
      { id: 'b-2', data: { ...valid, wins: 'diez' } },
    ])

    const error = await getBeyblades().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ContractError)
    expect(error).toMatchObject({ source: 'beyblades/b-2' })
  })

  it('rechaza si a un documento le falta un campo', async () => {
    const { name: _name, ...withoutName } = valid
    fakeBeyblades.seedRaw([{ id: 'b-1', data: withoutName }])

    await expect(getBeyblades()).rejects.toBeInstanceOf(ContractError)
  })

  it('propaga los fallos de lectura', async () => {
    fakeBeyblades.failNext(new Error('permission-denied'))

    await expect(getBeyblades()).rejects.toThrow('permission-denied')
  })
})
