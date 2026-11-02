import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { buildBeyblade } from '../mocks/beyblade.factory'
import { fakeBeyblades } from '../mocks/fakeBeybladesRepository'
import { BeybladeList } from './BeybladeList'

describe('BeybladeList', () => {
  it('muestra un estado de carga y después los beyblades', async () => {
    fakeBeyblades.seed([buildBeyblade({ name: 'Dragon Storm' }), buildBeyblade({ name: 'Pegasus Blitz' })])

    renderWithProviders(<BeybladeList />)

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i)
    expect(await screen.findByRole('article', { name: 'Dragon Storm' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Pegasus Blitz' })).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay beyblades', async () => {
    renderWithProviders(<BeybladeList />)

    expect(await screen.findByText(/todavía no hay beyblades/i)).toBeInTheDocument()
  })

  it('muestra un error si la lectura falla', async () => {
    fakeBeyblades.failNext(new Error('unavailable'))

    renderWithProviders(<BeybladeList />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudieron cargar/i)
  })

  describe('contrato de los datos almacenados', () => {
    // Datos escritos a mano a propósito: la factory no permite construir beyblades inválidos.
    const valid = { name: 'Pegasus', type: 'attack', blader: 'Gingka', wins: 3 }

    it('muestra el error si un documento tiene un campo de tipo inesperado', async () => {
      fakeBeyblades.seedRaw([
        { id: 'b-1', data: valid },
        { id: 'b-2', data: { ...valid, wins: 'diez' } },
      ])

      renderWithProviders(<BeybladeList />)

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los beyblades.')
      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })

    it('muestra el error si a un documento le falta un campo', async () => {
      const { name: _name, ...withoutName } = valid
      fakeBeyblades.seedRaw([{ id: 'b-1', data: withoutName }])

      renderWithProviders(<BeybladeList />)

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los beyblades.')
    })

    it('muestra el listado aunque los documentos tengan campos nuevos', async () => {
      fakeBeyblades.seedRaw([{ id: 'b-1', data: { ...valid, image: 'pegasus.png' } }])

      renderWithProviders(<BeybladeList />)

      expect(await screen.findByRole('article', { name: 'Pegasus' })).toBeInTheDocument()
    })
  })
})
