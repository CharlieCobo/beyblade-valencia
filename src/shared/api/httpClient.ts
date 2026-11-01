import { env } from '@/shared/config/env'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/** Construye una URL absoluta de la API. La usan tanto el cliente como los handlers de MSW. */
export function apiUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, '')
  return new URL(`${base}${path}`, window.location.origin).toString()
}

export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new HttpError(response.status, `GET ${path} falló con ${response.status}`)
  }

  return (await response.json()) as T
}
