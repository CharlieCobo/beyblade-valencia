import { z } from 'zod'

// Contrato de la API. Las respuestas usan z.object: los campos que la app no conoce se descartan sin error.

export const BeybladeTypeSchema = z.enum(['attack', 'defense', 'stamina', 'balance'])

export const BeybladeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: BeybladeTypeSchema,
  blader: z.string().min(1),
  wins: z.number().int().nonnegative(),
})

export const BeybladeListSchema = z.array(BeybladeSchema)

export type BeybladeType = z.infer<typeof BeybladeTypeSchema>
export type Beyblade = z.infer<typeof BeybladeSchema>
