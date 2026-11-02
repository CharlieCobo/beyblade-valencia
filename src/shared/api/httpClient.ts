import type { z } from 'zod'
import { env } from '@/shared/config/env'
import { ContractError } from './ContractError'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/** Función que resuelve una petición HTTP. Por defecto, la red (`fetch`). */
export type HttpTransport = (request: Request) => Promise<Response>

// Se lee `fetch` en cada llamada para respetar a quien lo parchee después (p. ej. msw/node en tests).
const networkTransport: HttpTransport = (request) => fetch(request)

let transport: HttpTransport = networkTransport

/** Sustituye el transporte (la app lo usa para inyectar los mocks en desarrollo y en la demo). */
export function setHttpTransport(next: HttpTransport): void {
  transport = next
}

/** Vuelve al transporte de red. */
export function resetHttpTransport(): void {
  transport = networkTransport
}

/** Construye una URL absoluta de la API. La usan tanto el cliente como los handlers de MSW. */
export function apiUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, '')
  return new URL(`${base}${path}`, window.location.origin).toString()
}

/** Esquemas de un POST: el del cuerpo que se envía y el de la respuesta. */
export interface PostSchemas<TRequest extends z.ZodType, TResponse extends z.ZodType> {
  request: TRequest
  response: TResponse
}

function reportContractError(error: ContractError): ContractError {
  // Sin backend real, este log es la pista principal de qué campo no cumple el contrato.
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') console.error(error)
  return error
}

async function request<S extends z.ZodType>(
  method: string,
  path: string,
  responseSchema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  const httpRequest = new Request(apiUrl(path), {
    ...init,
    method,
    headers: { Accept: 'application/json', ...init?.headers },
  })
  const response = await transport(httpRequest)

  if (!response.ok) {
    throw new HttpError(response.status, `${method} ${path} falló con ${response.status}`)
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw reportContractError(
      new ContractError({
        method,
        path,
        direction: 'response',
        issues: [{ code: 'custom', path: [], message: 'La respuesta no es JSON válido', input: undefined }],
      }),
    )
  }

  const result = responseSchema.safeParse(json)
  if (!result.success) {
    throw reportContractError(new ContractError({ method, path, direction: 'response', issues: result.error.issues }))
  }
  return result.data
}

/** GET que devuelve la respuesta ya validada con `responseSchema`. */
export function httpGet<S extends z.ZodType>(
  path: string,
  responseSchema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  return request('GET', path, responseSchema, init)
}

/**
 * POST que valida `body` con `schemas.request` antes de enviarlo (si no cumple, no hay petición)
 * y devuelve la respuesta validada con `schemas.response`. Se envía la salida del esquema, serializada como JSON.
 */
export async function httpPost<TRequest extends z.ZodType, TResponse extends z.ZodType>(
  path: string,
  body: z.input<TRequest>,
  schemas: PostSchemas<TRequest, TResponse>,
  init?: RequestInit,
): Promise<z.output<TResponse>> {
  const parsedBody = schemas.request.safeParse(body)
  if (!parsedBody.success) {
    throw reportContractError(
      new ContractError({ method: 'POST', path, direction: 'request', issues: parsedBody.error.issues }),
    )
  }

  return request('POST', path, schemas.response, {
    ...init,
    body: JSON.stringify(parsedBody.data),
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}
