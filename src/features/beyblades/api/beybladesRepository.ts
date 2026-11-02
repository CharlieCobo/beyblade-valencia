/** Documento tal como está almacenado: el contrato se valida después, en `getBeyblades`. */
export interface StoredDocument {
  id: string
  data: Record<string, unknown>
}

/** Acceso a los beyblades almacenados. En la app es Firestore; en los tests, una implementación en memoria. */
export interface BeybladesRepository {
  list(): Promise<StoredDocument[]>
}

// La implementación real carga el SDK de Firebase solo cuando se usa por primera vez (chunk aparte).
const firestoreRepository: BeybladesRepository = {
  list: async () => (await import('./firestoreBeybladesRepository')).listBeybladeDocuments(),
}

let repository: BeybladesRepository = firestoreRepository

/** Sustituye el repositorio (los tests instalan uno en memoria). */
export function setBeybladesRepository(next: BeybladesRepository): void {
  repository = next
}

/** Vuelve al repositorio de Firestore. */
export function resetBeybladesRepository(): void {
  repository = firestoreRepository
}

export function beybladesRepository(): BeybladesRepository {
  return repository
}
