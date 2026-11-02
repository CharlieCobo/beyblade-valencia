import type { BeybladesRepository, StoredDocument } from '../api/beybladesRepository'
import type { Beyblade } from '../schemas/beyblade.schema'

/** Repositorio en memoria para los tests. Empieza vacío; `src/test/setup.ts` lo reinicia antes de cada test. */
export interface FakeBeybladesRepository extends BeybladesRepository {
  /** Guarda beyblades válidos (p. ej. de `buildBeyblade()`). */
  seed(beyblades: Beyblade[]): void
  /** Guarda documentos tal cual, para probar datos almacenados fuera de contrato. */
  seedRaw(documents: StoredDocument[]): void
  /** La próxima lectura falla con `error`. */
  failNext(error: Error): void
  reset(): void
}

export function createFakeBeybladesRepository(): FakeBeybladesRepository {
  let documents: StoredDocument[] = []
  let nextError: Error | null = null

  return {
    async list() {
      if (nextError) {
        const error = nextError
        nextError = null
        throw error
      }
      return documents.map((document) => ({ id: document.id, data: { ...document.data } }))
    },
    seed(beyblades) {
      documents = beyblades.map(({ id, ...data }) => ({ id, data }))
    },
    seedRaw(raw) {
      documents = raw
    },
    failNext(error) {
      nextError = error
    },
    reset() {
      documents = []
      nextError = null
    },
  }
}

/** Instancia que comparten `src/test/setup.ts` y los tests. */
export const fakeBeyblades = createFakeBeybladesRepository()
