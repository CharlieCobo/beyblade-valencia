export const BEYBLADE_TYPES = ['attack', 'defense', 'stamina', 'balance'] as const

export type BeybladeType = (typeof BEYBLADE_TYPES)[number]

export interface Beyblade {
  id: string
  name: string
  type: BeybladeType
  blader: string
  wins: number
}
