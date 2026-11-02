import { authHandlers } from '@/features/auth/mocks/auth.handlers'
import { beybladesHandlers } from '@/features/beyblades/mocks/beyblades.handlers'

// Registra aquí los handlers de cada feature.
export const handlers = [...authHandlers, ...beybladesHandlers]
