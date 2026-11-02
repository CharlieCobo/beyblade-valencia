import { z } from 'zod'

/**
 * Payload del token. Los instantes van en segundos desde epoch, como en un JWT.
 * z.object: los JWT reales traen claims adicionales (iss, aud…) que se descartan.
 */
export const TokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().min(1),
  iat: z.number(),
  exp: z.number(),
})

export type TokenPayload = z.infer<typeof TokenPayloadSchema>
