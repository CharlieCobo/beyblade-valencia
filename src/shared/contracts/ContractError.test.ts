import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ContractError, parseContract } from './ContractError'

const Schema = z.object({ wins: z.number() })

describe('ContractError', () => {
  const { error } = Schema.safeParse({ wins: 'diez' })

  it('guarda el origen de los datos y los problemas', () => {
    const contractError = new ContractError({ source: 'beyblades/abc', issues: error!.issues })

    expect(contractError).toBeInstanceOf(Error)
    expect(contractError).toMatchObject({ name: 'ContractError', source: 'beyblades/abc' })
    expect(contractError.issues).toHaveLength(1)
  })

  it('explica en el mensaje qué campo falla', () => {
    const contractError = new ContractError({ source: 'beyblades/abc', issues: error!.issues })

    expect(contractError.message).toMatch(/^Los datos de beyblades\/abc no cumplen el contrato/)
    expect(contractError.message).toMatch(/wins/)
  })
})

describe('parseContract', () => {
  it('devuelve los datos validados', () => {
    expect(parseContract(Schema, { wins: 3, extra: true }, 'x')).toEqual({ wins: 3 })
  })

  it('lanza un ContractError con el origen si los datos no cumplen', () => {
    expect(() => parseContract(Schema, { wins: 'diez' }, 'beyblades/abc')).toThrow(ContractError)
    expect(() => parseContract(Schema, { wins: 'diez' }, 'beyblades/abc')).toThrow(/beyblades\/abc/)
  })
})
