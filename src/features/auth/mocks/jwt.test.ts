import { describe, expect, it } from 'vitest'
import { buildFakeJwt, buildTokenPayload } from './jwt'

function decodePart(part: string): unknown {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))))
}

describe('buildFakeJwt', () => {
  it('genera un token de tres partes en base64url con el payload indicado', () => {
    const payload = buildTokenPayload({ email: 'ñandú@mail.com' })

    const parts = buildFakeJwt(payload).split('.')

    expect(parts).toHaveLength(3)
    expect(decodePart(parts[0])).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(decodePart(parts[1])).toEqual(payload)
    expect(parts[1]).not.toMatch(/[+/=]/)
  })

  it('crea payloads con una hora de validez por defecto', () => {
    const payload = buildTokenPayload()

    expect(payload.exp - payload.iat).toBe(3600)
  })
})
