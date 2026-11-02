import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('lee las variables válidas', () => {
    expect(parseEnv({ VITE_API_BASE_URL: 'https://api.lvb.es', VITE_API_MOCKING: 'enabled' })).toEqual({
      apiBaseUrl: 'https://api.lvb.es',
      apiMocking: 'enabled',
    })
  })

  it('usa los valores por defecto si no hay variables', () => {
    expect(parseEnv({})).toEqual({ apiBaseUrl: '/api', apiMocking: 'disabled' })
  })

  it('ignora las variables propias de Vite que no empiezan por VITE_', () => {
    expect(parseEnv({ MODE: 'test', DEV: true, BASE_URL: '/' })).toEqual({ apiBaseUrl: '/api', apiMocking: 'disabled' })
  })

  it('rechaza un valor no permitido nombrando la variable y los valores válidos', () => {
    expect(() => parseEnv({ VITE_API_MOCKING: 'yes' })).toThrow(/VITE_API_MOCKING/)
    expect(() => parseEnv({ VITE_API_MOCKING: 'yes' })).toThrow(/"enabled"\|"disabled"/)
  })

  it('rechaza una variable desconocida nombrándola', () => {
    expect(() => parseEnv({ VITE_API_BASEURL: '/api' })).toThrow(/VITE_API_BASEURL/)
  })

  it('rechaza una base de la API que no es una ruta ni una URL', () => {
    expect(() => parseEnv({ VITE_API_BASE_URL: 'api' })).toThrow(/VITE_API_BASE_URL/)
  })
})
