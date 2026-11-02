import { z } from 'zod'

/**
 * Variables de configuración de la app (`VITE_*`). Estricto: una variable desconocida
 * (p. ej. una errata como VITE_API_BASEURL) es un error, igual que un valor no permitido.
 */
const EnvSchema = z.strictObject({
  VITE_API_BASE_URL: z.union([z.string().startsWith('/'), z.url()]).default('/api'),
  VITE_API_MOCKING: z.enum(['enabled', 'disabled']).default('disabled'),
})

export interface Env {
  apiBaseUrl: string
  apiMocking: 'enabled' | 'disabled'
}

/** Valida las variables `VITE_*` de `raw`. Lanza un error que nombra cada variable inválida o desconocida. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const viteVars = Object.fromEntries(Object.entries(raw).filter(([key]) => key.startsWith('VITE_')))
  const result = EnvSchema.safeParse(viteVars)
  if (!result.success) {
    throw new Error(`Configuración inválida (variables VITE_*):\n${z.prettifyError(result.error)}`)
  }
  return { apiBaseUrl: result.data.VITE_API_BASE_URL, apiMocking: result.data.VITE_API_MOCKING }
}

// Se valida al importar: con una configuración inválida la app no arranca.
export const env: Env = parseEnv(import.meta.env)
