import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  apiUrl,
  HttpError,
  httpGet,
  httpPost,
  resetHttpTransport,
  setHttpTransport,
  type HttpTransport,
} from './httpClient'

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

  it('envía un POST con el body serializado como JSON', async () => {
    const transport = vi.fn<HttpTransport>(async () => Response.json({ id: 1 }))
    setHttpTransport(transport)

    await expect(httpPost('/items', { name: 'Pegasus' })).resolves.toEqual({ id: 1 })

    const [request] = transport.mock.calls[0]
    expect(request.url).toBe(apiUrl('/items'))
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Accept')).toBe('application/json')
    expect(await request.json()).toEqual({ name: 'Pegasus' })
  })

  it('lanza HttpError con el status cuando un POST no es ok', async () => {
    setHttpTransport(async () => new Response(null, { status: 401 }))

    await expect(httpPost('/items', {})).rejects.toMatchObject({ name: 'HttpError', status: 401 })
  })

  it('usa la red (interceptada por MSW en tests) cuando no hay transporte inyectado', async () => {
    await expect(httpGet<unknown[]>('/beyblades')).resolves.toHaveLength(6)
  })
})
