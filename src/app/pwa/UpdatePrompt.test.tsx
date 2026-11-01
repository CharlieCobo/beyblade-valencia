import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { UpdatePrompt } from './UpdatePrompt'

describe('UpdatePrompt', () => {
  it('no muestra nada si no hay una versión nueva', () => {
    renderWithProviders(<UpdatePrompt needRefresh={false} onUpdate={vi.fn<() => void>()} onDismiss={vi.fn<() => void>()} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('avisa de que hay una nueva versión', () => {
    renderWithProviders(<UpdatePrompt needRefresh onUpdate={vi.fn<() => void>()} onDismiss={vi.fn<() => void>()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Hay una nueva versión disponible')
  })

  it('llama a onUpdate al pulsar "Actualizar"', async () => {
    const onUpdate = vi.fn<() => void>()
    const onDismiss = vi.fn<() => void>()
    const { user } = renderWithProviders(<UpdatePrompt needRefresh onUpdate={onUpdate} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(onUpdate).toHaveBeenCalledOnce()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('llama a onDismiss al pulsar "Cerrar"', async () => {
    const onUpdate = vi.fn<() => void>()
    const onDismiss = vi.fn<() => void>()
    const { user } = renderWithProviders(<UpdatePrompt needRefresh onUpdate={onUpdate} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
