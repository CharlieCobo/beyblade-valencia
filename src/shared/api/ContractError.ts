import { z } from 'zod'

/** `request`: lo que íbamos a enviar no cumple el contrato. `response`: lo recibido no lo cumple. */
export type ContractDirection = 'request' | 'response'

interface ContractErrorOptions {
  method: string
  path: string
  direction: ContractDirection
  issues: z.core.$ZodIssue[]
}

/**
 * Datos que no cumplen el contrato de un endpoint. Es distinto de `HttpError`:
 * la petición respondió bien (o ni se envió), pero los datos no tienen la forma esperada.
 */
export class ContractError extends Error {
  readonly method: string
  readonly path: string
  readonly direction: ContractDirection
  readonly issues: z.core.$ZodIssue[]

  constructor({ method, path, direction, issues }: ContractErrorOptions) {
    const what = direction === 'request' ? 'La petición' : 'La respuesta'
    super(`${what} de ${method} ${path} no cumple el contrato:\n${z.prettifyError({ issues })}`)
    this.name = 'ContractError'
    this.method = method
    this.path = path
    this.direction = direction
    this.issues = issues
  }
}
