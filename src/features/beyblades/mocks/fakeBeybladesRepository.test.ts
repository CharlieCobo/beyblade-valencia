import { describe, expect, it } from 'vitest'
import { buildBeyblade } from './beyblade.factory'
import { createFakeBeybladesRepository } from './fakeBeybladesRepository'

describe('fakeBeybladesRepository', () => {
  it('empieza vacío', async () => {
    expect(await createFakeBeybladesRepository().list()).toEqual([])
  })

  it('devuelve los beyblades sembrados como documentos con su id', async () => {
    const fake = createFakeBeybladesRepository()
    const beyblade = buildBeyblade({ id: 'b-1' })
    fake.seed([beyblade])

    const [document] = await fake.list()

    expect(document.id).toBe('b-1')
    expect(document.data).not.toHaveProperty('id')
    expect(document.data).toMatchObject({ name: beyblade.name, wins: beyblade.wins })
  })

  it('falla solo en la siguiente lectura tras failNext', async () => {
    const fake = createFakeBeybladesRepository()
    fake.failNext(new Error('sin red'))

    await expect(fake.list()).rejects.toThrow('sin red')
    await expect(fake.list()).resolves.toEqual([])
  })

  it('reset borra los datos y el fallo pendiente', async () => {
    const fake = createFakeBeybladesRepository()
    fake.seed([buildBeyblade()])
    fake.failNext(new Error('x'))
    fake.reset()

    await expect(fake.list()).resolves.toEqual([])
  })
})
