import { z } from 'zod'

interface ContractErrorOptions {
  /** De dónde salen los datos, p. ej. `beyblades/abc123` (colección y documento). */
  source: string
  issues: z.core.$ZodIssue[]
}

/**
 * Datos leídos que no cumplen el contrato de su entidad: la lectura funcionó,
 * pero los datos no tienen la forma esperada.
 */
export class ContractError extends Error {
  readonly source: string
  readonly issues: z.core.$ZodIssue[]

  constructor({ source, issues }: ContractErrorOptions) {
    super(`Los datos de ${source} no cumplen el contrato:\n${z.prettifyError({ issues })}`)
    this.name = 'ContractError'
    this.source = source
    this.issues = issues
  }
}

/**
 * Valida `data` con `schema`. Si no cumple, lanza un `ContractError` con `source`
 * y lo registra en consola en desarrollo (es la pista de qué campo almacenado está mal).
 */
export function parseContract<S extends z.ZodType>(schema: S, data: unknown, source: string): z.output<S> {
  const result = schema.safeParse(data)
  if (result.success) return result.data

  const error = new ContractError({ source, issues: result.error.issues })
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') console.error(error)
  throw error
}
