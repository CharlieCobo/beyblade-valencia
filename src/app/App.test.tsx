import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { App } from './App'

describe('App', () => {
  it('renderiza el título principal', async () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /beyblade valencia/i })).toBeInTheDocument()
    expect(await screen.findByRole('region', { name: /listado de beyblades/i })).toBeInTheDocument()
  })
})
