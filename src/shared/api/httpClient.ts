import { env } from '@/shared/config/env'

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

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const request = new Request(apiUrl(path), {
    ...init,
    method: 'GET',
    headers: { Accept: 'application/json', ...init?.headers },
  })
  const response = await transport(request)

  if (!response.ok) {
    throw new HttpError(response.status, `GET ${path} falló con ${response.status}`)
  }

  return (await response.json()) as T
}
