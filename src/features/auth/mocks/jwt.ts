import { TokenPayloadSchema, type TokenPayload } from '../schemas/token.schema'

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Crea un token con forma de JWT. La firma es falsa: el cliente no la verifica. */
export function buildFakeJwt(payload: TokenPayload): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

/** Payload de un token vigente durante `ttlSeconds` a partir de ahora. Cumple el contrato del payload. */
export function buildTokenPayload(overrides: Partial<TokenPayload> = {}, ttlSeconds = 3600): TokenPayload {
  const iat = Math.floor(Date.now() / 1000)
  return TokenPayloadSchema.parse({
    sub: 'user-test-1',
    email: 'test@mail.com',
    iat,
    exp: iat + ttlSeconds,
    ...overrides,
  })
}
