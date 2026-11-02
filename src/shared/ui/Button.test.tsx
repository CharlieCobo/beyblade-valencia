import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('muestra su texto y es de tipo button por defecto', () => {
    render(<Button>Cerrar</Button>)

    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('type', 'button')
  })

  it('respeta el type indicado', () => {
    render(<Button type="submit">Enviar</Button>)

    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit')
  })

  it('llama a onClick al pulsarlo', async () => {
    const onClick = vi.fn<() => void>()
    render(<Button onClick={onClick}>Actualizar</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('no llama a onClick si está deshabilitado', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <Button variant="primary" disabled onClick={onClick}>
        Enviando…
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Enviando…' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
