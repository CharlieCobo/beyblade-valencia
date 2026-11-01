import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { apiUrl } from '@/shared/api/httpClient'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BEYBLADES_PATH } from '../api/beyblades.api'
import { buildBeyblade } from '../mocks/beyblade.factory'
import { BeybladeList } from './BeybladeList'

describe('BeybladeList', () => {
  it('muestra un estado de carga y después los beyblades', async () => {
    const beyblades = [buildBeyblade({ name: 'Dragon Storm' }), buildBeyblade({ name: 'Pegasus Blitz' })]
    server.use(http.get(apiUrl(BEYBLADES_PATH), () => HttpResponse.json(beyblades)))

    renderWithProviders(<BeybladeList />)

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i)
    expect(await screen.findByRole('article', { name: 'Dragon Storm' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Pegasus Blitz' })).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay beyblades', async () => {
    server.use(http.get(apiUrl(BEYBLADES_PATH), () => HttpResponse.json([])))

    renderWithProviders(<BeybladeList />)

    expect(await screen.findByText(/todavía no hay beyblades/i)).toBeInTheDocument()
  })

  it('muestra un error si la API falla', async () => {
    server.use(http.get(apiUrl(BEYBLADES_PATH), () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<BeybladeList />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudieron cargar/i)
  })

  it('usa los handlers por defecto de MSW', async () => {
    renderWithProviders(<BeybladeList />)

    expect(await screen.findAllByRole('article')).toHaveLength(6)
  })
})
