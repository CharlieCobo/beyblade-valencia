import { z } from 'zod'

const required = z.string().trim().min(1, 'No puede estar vacía')

/**
 * Variables de configuración de la app (`VITE_*`). Estricto: una variable desconocida
 * (p. ej. una errata como VITE_FIREBASE_PROJECTID) es un error, igual que una ausente o vacía.
 * La configuración web de Firebase es pública por diseño: la seguridad la dan las reglas de Firestore.
 */
const EnvSchema = z.strictObject({
  VITE_FIREBASE_API_KEY: required,
  VITE_FIREBASE_AUTH_DOMAIN: required,
  VITE_FIREBASE_PROJECT_ID: required,
  VITE_FIREBASE_APP_ID: required,
})

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

export interface Env {
  firebase: FirebaseConfig
}

/** Valida las variables `VITE_*` de `raw`. Lanza un error que nombra cada variable inválida, ausente o desconocida. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const viteVars = Object.fromEntries(Object.entries(raw).filter(([key]) => key.startsWith('VITE_')))
  const result = EnvSchema.safeParse(viteVars)
  if (!result.success) {
    throw new Error(`Configuración inválida (variables VITE_*):\n${z.prettifyError(result.error)}`)
  }
  const data = result.data
  return {
    firebase: {
      apiKey: data.VITE_FIREBASE_API_KEY,
      authDomain: data.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: data.VITE_FIREBASE_PROJECT_ID,
      appId: data.VITE_FIREBASE_APP_ID,
    },
  }
}

// Se valida al importar: con una configuración inválida la app no arranca.
export const env: Env = parseEnv(import.meta.env)
