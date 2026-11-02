import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('asocia la etiqueta al campo y pasa las props al input', () => {
    render(<TextField label="Correo electrónico" name="email" type="email" autoComplete="email" />)

    const input = screen.getByLabelText('Correo electrónico')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('sin error no marca el campo como inválido ni tiene descripción', () => {
    render(<TextField label="Correo electrónico" />)

    const input = screen.getByLabelText('Correo electrónico')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('con error marca el campo como inválido y lo describe con el mensaje', () => {
    render(<TextField label="Correo electrónico" error="Introduce tu correo" />)

    const input = screen.getByLabelText('Correo electrónico')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Introduce tu correo')
    expect(screen.getByText('Introduce tu correo')).toBeVisible()
  })

  it('entrega la ref al input para poder enfocarlo', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField label="Contraseña" ref={ref} />)

    ref.current?.focus()

    expect(ref.current).toBe(screen.getByLabelText('Contraseña'))
    expect(ref.current).toHaveFocus()
  })
})
