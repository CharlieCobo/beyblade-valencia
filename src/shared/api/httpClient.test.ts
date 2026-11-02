import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { server } from '@/mocks/server'
import { ContractError } from './ContractError'
import {
  apiUrl,
  HttpError,
  httpGet,
  httpPost,
  resetHttpTransport,
  setHttpTransport,
  type HttpTransport,
} from './httpClient'

const ItemSchema = z.object({ id: z.number(), name: z.string() })
const NewItemSchema = z.strictObject({ name: z.string().min(1) })
const OkSchema = z.object({ ok: z.boolean() })

describe('httpClient', () => {
  afterEach(() => {
    resetHttpTransport()
    server.events.removeAllListeners()
  })

  it('envía la petición al transporte inyectado con URL absoluta y cabeceras', async () => {
    const transport = vi.fn<HttpTransport>(async () => Response.json({ ok: true }))
    setHttpTransport(transport)

    await expect(httpGet('/ping', OkSchema, { headers: { 'X-Test': '1' } })).resolves.toEqual({ ok: true })

    const [request] = transport.mock.calls[0]
    expect(request.url).toBe(apiUrl('/ping'))
    expect(request.url).toMatch(/^https?:\/\//)
    expect(request.method).toBe('GET')
    expect(request.headers.get('Accept')).toBe('application/json')
    expect(request.headers.get('X-Test')).toBe('1')
  })

  it('lanza HttpError cuando la respuesta no es ok', async () => {
    setHttpTransport(async () => new Response(null, { status: 404 }))

    await expect(httpGet('/missing', OkSchema)).rejects.toMatchObject({ name: 'HttpError', status: 404 })
    await expect(httpGet('/missing', OkSchema)).rejects.toBeInstanceOf(HttpError)
  })

  it('envía un POST con el body serializado como JSON', async () => {
    const transport = vi.fn<HttpTransport>(async () => Response.json({ id: 1, name: 'Pegasus' }))
    setHttpTransport(transport)

    await expect(
      httpPost('/items', { name: 'Pegasus' }, { request: NewItemSchema, response: ItemSchema }),
    ).resolves.toEqual({ id: 1, name: 'Pegasus' })

    const [request] = transport.mock.calls[0]
    expect(request.url).toBe(apiUrl('/items'))
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Accept')).toBe('application/json')
    expect(await request.json()).toEqual({ name: 'Pegasus' })
  })

  it('lanza HttpError con el status cuando un POST no es ok', async () => {
    setHttpTransport(async () => new Response(null, { status: 401 }))

    await expect(
      httpPost('/items', { name: 'Pegasus' }, { request: NewItemSchema, response: ItemSchema }),
    ).rejects.toMatchObject({ name: 'HttpError', status: 401 })
  })

  it('usa la red (interceptada por MSW en tests) cuando no hay transporte inyectado', async () => {
    await expect(httpGet('/beyblades', z.array(z.unknown()))).resolves.toHaveLength(6)
  })

  describe('contratos', () => {
    it('devuelve los datos validados por el esquema', async () => {
      setHttpTransport(async () => Response.json([{ id: 1, name: 'Pegasus' }]))

      await expect(httpGet('/items', z.array(ItemSchema))).resolves.toEqual([{ id: 1, name: 'Pegasus' }])
    })

    it('descarta los campos que no están en el contrato', async () => {
      setHttpTransport(async () => Response.json({ id: 1, name: 'Pegasus', image: 'pegasus.png' }))

      await expect(httpGet('/items/1', ItemSchema)).resolves.toEqual({ id: 1, name: 'Pegasus' })
    })

    it('lanza ContractError si falta un campo', async () => {
      setHttpTransport(async () => Response.json({ id: 1 }))

      const error = await httpGet('/items/1', ItemSchema).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ContractError)
      expect(error).toMatchObject({ method: 'GET', path: '/items/1', direction: 'response' })
      expect((error as ContractError).issues[0].path).toEqual(['name'])
    })

    it('lanza ContractError si un campo tiene otro tipo', async () => {
      setHttpTransport(async () => Response.json({ id: 'uno', name: 'Pegasus' }))

      await expect(httpGet('/items/1', ItemSchema)).rejects.toBeInstanceOf(ContractError)
    })

    it('lanza ContractError si la respuesta no es JSON', async () => {
      setHttpTransport(async () => new Response('<html>', { status: 200 }))

      await expect(httpGet('/items/1', ItemSchema)).rejects.toMatchObject({
        name: 'ContractError',
        direction: 'response',
      })
    })

    it('no envía la petición si el cuerpo no cumple el contrato', async () => {
      const onRequest = vi.fn<() => void>()
      server.events.on('request:start', onRequest)

      const error = await httpPost(
        '/items',
        // Un campo de más es un bug nuestro: el contrato del cuerpo es estricto.
        { name: 'Pegasus', admin: true } as { name: string },
        { request: NewItemSchema, response: ItemSchema },
      ).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ContractError)
      expect(error).toMatchObject({ method: 'POST', path: '/items', direction: 'request' })
      expect(onRequest).not.toHaveBeenCalled()
    })
  })
})
