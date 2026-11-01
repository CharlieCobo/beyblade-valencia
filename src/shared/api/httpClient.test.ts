import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiUrl, HttpError, httpGet, resetHttpTransport, setHttpTransport, type HttpTransport } from './httpClient'

describe('httpClient', () => {
  afterEach(() => resetHttpTransport())

  it('envía la petición al transporte inyectado con URL absoluta y cabeceras', async () => {
    const transport = vi.fn<HttpTransport>(async () => Response.json({ ok: true }))
    setHttpTransport(transport)

    await expect(httpGet('/ping', { headers: { 'X-Test': '1' } })).resolves.toEqual({ ok: true })

    const [request] = transport.mock.calls[0]
    expect(request.url).toBe(apiUrl('/ping'))
    expect(request.url).toMatch(/^https?:\/\//)
    expect(request.method).toBe('GET')
    expect(request.headers.get('Accept')).toBe('application/json')
    expect(request.headers.get('X-Test')).toBe('1')
  })

  it('lanza HttpError cuando la respuesta no es ok', async () => {
    setHttpTransport(async () => new Response(null, { status: 404 }))

    await expect(httpGet('/missing')).rejects.toMatchObject({ name: 'HttpError', status: 404 })
    await expect(httpGet('/missing')).rejects.toBeInstanceOf(HttpError)
  })

  it('usa la red (interceptada por MSW en tests) cuando no hay transporte inyectado', async () => {
    await expect(httpGet<unknown[]>('/beyblades')).resolves.toHaveLength(6)
  })
})
