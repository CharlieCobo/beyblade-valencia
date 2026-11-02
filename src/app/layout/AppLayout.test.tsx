import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { AppLayout } from './AppLayout'

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<p>página hija</p>} />
      </Route>
      <Route path="/login" element={<p>página de login</p>} />
    </Routes>,
  )
}

describe('AppLayout', () => {
  it('pinta el título y la ruta hija', () => {
    renderLayout()

    expect(screen.getByRole('heading', { level: 1, name: 'Beyblade Valencia' })).toBeInTheDocument()
    expect(screen.getByText('página hija')).toBeInTheDocument()
  })

  it('ofrece cerrar sesión, que lleva al login', async () => {
    const { user } = renderLayout()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('página de login')).toBeInTheDocument()
  })
})
