import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { env } from '@/shared/config/env'

/*
 * Punto único de inicialización de Firebase. Solo lo importan las implementaciones reales de los
 * accesos a datos de cada feature, y siempre con `import()` dinámico: así el SDK queda en un chunk
 * aparte y los tests (que usan implementaciones en memoria) nunca lo cargan.
 */

export function firebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(env.firebase)
}

export function firebaseAuth(): Auth {
  return getAuth(firebaseApp())
}

export function firestore(): Firestore {
  return getFirestore(firebaseApp())
}
