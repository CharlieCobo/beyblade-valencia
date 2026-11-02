import { TokenPayloadSchema, type TokenPayload } from '../schemas/token.schema'

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
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

  const result = TokenPayloadSchema.safeParse(payload)
  if (!result.success) throw new Error('Token sin los campos esperados')
  return result.data
}
