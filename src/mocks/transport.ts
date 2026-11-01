import { getResponse } from 'msw'
import type { HttpTransport } from '@/shared/api/httpClient'
import { handlers } from './handlers'

/**
 * Resuelve las peticiones contra los handlers de MSW sin service worker ni interceptar la red.
 * Si ningún handler coincide, la petición sale a la red.
 */
export const mockTransport: HttpTransport = async (request) => {
  const mocked = await getResponse(handlers, request.clone())

  if (!mocked) return fetch(request)

  if (import.meta.env.DEV) {
    console.debug(`[mock] ${request.method} ${request.url} -> ${mocked.status}`)
  }

  return mocked
}
