import { describe, expect, it, vi } from 'vitest'
import { apiUrl } from '@/shared/api/httpClient'
import { mockTransport } from './transport'

describe('mockTransport', () => {
  it('responde con el handler correspondiente sin salir a la red', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const response = await mockTransport(new Request(apiUrl('/beyblades')))

    expect(response.status).toBe(200)
    expect(await response.json()).toHaveLength(6)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('resuelve el login simulado', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const request = new Request(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@mail.com', password: 'Test1234!' }),
    })

    const response = await mockTransport(request)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ accessToken: expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/) })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('envía a la red las peticiones sin handler', async () => {
    const networkResponse = Response.json({ from: 'network' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(networkResponse)
    const request = new Request(apiUrl('/sin-handler'))

    const response = await mockTransport(request)

    expect(fetchSpy).toHaveBeenCalledWith(request)
    expect(await response.json()).toEqual({ from: 'network' })
  })
})
