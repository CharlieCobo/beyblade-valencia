import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ContractError } from './ContractError'

describe('ContractError', () => {
  const { error } = z.object({ wins: z.number() }).safeParse({ wins: 'diez' })

  it('guarda el endpoint, la dirección y los problemas', () => {
    const contractError = new ContractError({
      method: 'GET',
      path: '/beyblades',
      direction: 'response',
      issues: error!.issues,
    })

    expect(contractError).toBeInstanceOf(Error)
    expect(contractError).toMatchObject({ name: 'ContractError', method: 'GET', path: '/beyblades' })
    expect(contractError.direction).toBe('response')
    expect(contractError.issues).toHaveLength(1)
  })

  it('explica en el mensaje qué campo falla', () => {
    const contractError = new ContractError({
      method: 'POST',
      path: '/auth/login',
      direction: 'request',
      issues: error!.issues,
    })

    expect(contractError.message).toMatch(/^La petición de POST \/auth\/login no cumple el contrato/)
    expect(contractError.message).toMatch(/wins/)
  })
})
