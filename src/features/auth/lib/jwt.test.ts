import { describe, expect, it } from 'vitest'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
import { decodeTokenPayload } from './jwt'

describe('decodeTokenPayload', () => {
  it('devuelve el payload de un token válido', () => {
    const payload = buildTokenPayload({ email: 'ñandú@mail.com' })

    expect(decodeTokenPayload(buildFakeJwt(payload))).toEqual(payload)
  })

  it('rechaza un token que no tiene tres partes', () => {
    expect(() => decodeTokenPayload('abc.def')).toThrow(/formato inválido/)
  })

  it('rechaza un payload que no es JSON', () => {
    expect(() => decodeTokenPayload(`x.${btoa('no es json')}.y`)).toThrow(/ilegible/)
  })

  it('rechaza un payload sin los campos esperados', () => {
    expect(() => decodeTokenPayload(`x.${btoa(JSON.stringify({ sub: 'a' }))}.y`)).toThrow(/campos esperados/)
  })
})
