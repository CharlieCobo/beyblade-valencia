import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('pinta el título y la ruta hija', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<p>página hija</p>} />
        </Route>
      </Routes>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Beyblade Valencia' })).toBeInTheDocument()
    expect(screen.getByText('página hija')).toBeInTheDocument()
  })
})
