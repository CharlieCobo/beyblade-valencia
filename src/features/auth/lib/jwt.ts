import type { TokenPayload } from '../types/auth.types'

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (typeof value !== 'object' || value === null) return false
  const payload = value as Record<string, unknown>
  return (
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number'
  )
}

/**
 * Lee el payload de un token con forma de JWT.
 * No verifica la firma: eso le corresponde al servidor.
 */
export function decodeTokenPayload(token: string): TokenPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Token con formato inválido')

  let payload: unknown
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    throw new Error('Token con payload ilegible')
  }

  if (!isTokenPayload(payload)) throw new Error('Token sin los campos esperados')
  return payload
}
