import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Credentials } from './auth.schema'
import { LoginFormSchema, type LoginFormOutput } from './loginForm.schema'

function errors(values: unknown) {
  const result = LoginFormSchema.safeParse(values)
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]))
}

describe('LoginFormSchema', () => {
  it('pide el correo y la contraseña si están vacíos', () => {
    expect(errors({ email: '', password: '' })).toEqual({
      email: 'Introduce tu correo',
      password: 'Introduce tu contraseña',
    })
  })

  it('trata un correo de solo espacios como vacío', () => {
    expect(errors({ email: '   ', password: 'x' })).toEqual({ email: 'Introduce tu correo' })
  })

  it('pide un correo válido', () => {
    expect(errors({ email: 'test-mail.com', password: 'Test1234!' })).toEqual({ email: 'Introduce un correo válido' })
  })

  it('quita los espacios alrededor del correo', () => {
    expect(LoginFormSchema.parse({ email: ' test@mail.com ', password: 'Test1234!' }).email).toBe('test@mail.com')
  })

  it('conserva los espacios de la contraseña', () => {
    expect(LoginFormSchema.parse({ email: 'test@mail.com', password: ' clave ' }).password).toBe(' clave ')
  })

  it('acepta datos válidos', () => {
    expect(LoginFormSchema.parse({ email: 'test@mail.com', password: 'Test1234!' })).toEqual({
      email: 'test@mail.com',
      password: 'Test1234!',
    })
  })

  it('produce exactamente el cuerpo del contrato de login', () => {
    expectTypeOf<LoginFormOutput>().toEqualTypeOf<Credentials>()
  })
})
