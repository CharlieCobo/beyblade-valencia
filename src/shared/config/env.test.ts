import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

const VALID = {
  VITE_FIREBASE_API_KEY: 'AIza-clave',
  VITE_FIREBASE_AUTH_DOMAIN: 'lvb.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'lvb',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
}

describe('parseEnv', () => {
  it('lee una configuración válida', () => {
    expect(parseEnv(VALID)).toEqual({
      firebase: { apiKey: 'AIza-clave', authDomain: 'lvb.firebaseapp.com', projectId: 'lvb', appId: '1:123:web:abc' },
    })
  })

  it('ignora las variables propias de Vite que no empiezan por VITE_', () => {
    expect(() => parseEnv({ ...VALID, MODE: 'test', DEV: true, BASE_URL: '/' })).not.toThrow()
  })

  it('rechaza una variable obligatoria ausente nombrándola', () => {
    const { VITE_FIREBASE_PROJECT_ID: _omitted, ...rest } = VALID
    expect(() => parseEnv(rest)).toThrow(/VITE_FIREBASE_PROJECT_ID/)
  })

  it('rechaza una configuración sin ninguna variable', () => {
    expect(() => parseEnv({})).toThrow(/VITE_FIREBASE_API_KEY/)
  })

  it('rechaza una variable vacía nombrándola', () => {
    expect(() => parseEnv({ ...VALID, VITE_FIREBASE_AUTH_DOMAIN: '' })).toThrow(/VITE_FIREBASE_AUTH_DOMAIN/)
    expect(() => parseEnv({ ...VALID, VITE_FIREBASE_AUTH_DOMAIN: '   ' })).toThrow(/VITE_FIREBASE_AUTH_DOMAIN/)
  })

  it('rechaza una variable desconocida nombrándola', () => {
    expect(() => parseEnv({ ...VALID, VITE_FIREBASE_PROJECTID: 'lvb' })).toThrow(/VITE_FIREBASE_PROJECTID/)
  })

  it('rechaza la variable antigua de la API simulada', () => {
    expect(() => parseEnv({ ...VALID, VITE_API_MOCKING: 'enabled' })).toThrow(/VITE_API_MOCKING/)
  })
})
