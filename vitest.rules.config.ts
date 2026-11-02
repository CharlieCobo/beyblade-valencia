import { defineConfig } from 'vitest/config'

// Tests de las reglas de Firestore. Necesitan el emulador (y Java): se ejecutan con `npm run test:rules`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['firebase/**/*.test.ts'],
    // Todos los ficheros comparten el mismo emulador: en serie para que no se pisen los datos.
    fileParallelism: false,
  },
})
