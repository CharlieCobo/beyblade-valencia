# Design

## Context

Ver proposal.md para la motivación. Estado actual relevante:

- Todo acceso a datos pasa por `src/shared/api/httpClient.ts` (`httpGet`/`httpPost` validados con Zod), con un transporte intercambiable (`setHttpTransport`) que en desarrollo y demo resuelven los handlers de MSW y en los tests `msw/node` (`src/test/setup.ts`).
- La sesión es un JWT decodificado en cliente y persistido con Zustand (`lvb-auth` en `localStorage`); `useUser().isExpired` se calcula con `exp`, y `RequireAuth` decide de forma síncrona.
- `LoginForm` distingue errores con `HttpError.status === 401`.
- `useBeyblades` hace la petición en un `useEffect` con `AbortController` y expone `loading | error | success`.
- Tres ficheros de test usan `server.use(...)` para casos concretos (`LoginForm`, `useLogin`, `BeybladeList`), además de los tests de `httpClient`, `auth.api`, `jwt` y `env`.
- Convenciones del proyecto: features con `index.ts` como API pública, `shared/` sin dependencias de `features/`, contratos en Zod como fuente de verdad, factories de Faker validadas por esquema.

## Goals / Non-Goals

**Goals:**

- Sustituir el backend simulado por Firebase Authentication (correo/contraseña) y Firestore sin cambiar la experiencia del login ni del listado.
- Que ningún test de componentes o hooks cargue el SDK de Firebase ni necesite red o emulador.
- Que las reglas de acceso de `access-control` se prueben de verdad contra el emulador de Firestore.
- Mantener la validación de contratos con Zod en el borde de entrada de datos.

**Non-Goals:**

- Registro de usuarios, recuperación de contraseña o gestión de roles desde la app (se hace en la consola de Firebase).
- Perfiles de jugador y datos de menores (cambio `player-profiles`).
- Caché persistente de Firestore / datos disponibles sin conexión: se usa la caché en memoria por defecto.
- Firebase App Check y entornos separados (dev/demo/prod).
- Escrituras de datos desde la aplicación.

## Decisions

### 1. Firestore (no Realtime Database)

Firestore da consultas por campo, reglas que pueden leer otros documentos (`get()` del perfil para conocer el rol) y un modelo de documentos que encaja con los esquemas de Zod por entidad. Realtime Database solo aportaría sincronización en vivo más simple, que no se necesita.

### 2. Puertos por feature con implementación de Firebase intercambiable

Cada feature define una interfaz pequeña para su acceso a datos y la implementa dos veces:

```
features/auth/api/
  authGateway.ts          interface AuthGateway { signIn, signOut, onSessionChange }
  firebaseAuthGateway.ts  implementación real (firebase/auth + perfil en Firestore)
features/auth/mocks/
  fakeAuthGateway.ts      implementación en memoria para tests (cuentas, perfiles, fallos)

features/beyblades/api/
  beybladesRepository.ts          interface BeybladesRepository { list }
  firestoreBeybladesRepository.ts implementación real
features/beyblades/mocks/
  fakeBeybladesRepository.ts      en memoria, sembrada con buildBeyblade()
```

Cada feature expone un `setXxx()`/`resetXxx()` con el mismo patrón que hoy tiene `setHttpTransport`: la implementación por defecto es la de Firebase (cargada con `import()` dinámico la primera vez que se usa), y `src/test/setup.ts` instala los fakes en `beforeEach`. Los tests sustituyen `server.use(...)` por operaciones del fake (`fake.seed([...])`, `fake.failNext(error)`, `fake.addAccount({ email, password, role })`).

Alternativas descartadas:
- *Firebase Emulator Suite para todos los tests*: realista, pero exige Java y un proceso externo en cada `npm run test:run`, y ralentiza mucho el bucle de TDD.
- *`vi.mock('firebase/...')`*: acopla los tests a la API del SDK y se rompe en cada actualización.
- *Contexto de React con todos los servicios*: obligaría a que `shared/` o `app/` conozcan las interfaces de cada feature, contra la regla de dependencias.

### 3. Inicialización de Firebase en `shared/firebase`

`src/shared/firebase/app.ts` crea perezosamente la `FirebaseApp`, `Auth` y `Firestore` a partir de `env`. Solo la importan las implementaciones reales de los puertos, mediante `import()` dinámico, de modo que el SDK queda en un chunk aparte y nunca se carga en tests. Se importa solo `firebase/app`, `firebase/auth` y `firebase/firestore` (SDK modular) para limitar el tamaño.

### 4. Sesión: Firebase como fuente, Zustand como reflejo

`AuthGateway.onSessionChange(cb)` traduce `onAuthStateChanged` a un estado de dominio:

```
  checking --(sin usuario)----------------------------> signedOut
     |
     +--(usuario)--> leer users/{uid} --(perfil válido)--> signedIn { uid, email, role }
                                     \--(sin perfil / rol inválido / error de lectura)
                                         --> signOut() --> signedOut (+ motivo "no habilitada")
```

El store de Zustand deja de persistir (se quita `persist`) y solo guarda `{ status, user }`; lo mantiene al día el hook `useAuthSessionSync()`, montado una vez en `App`. (No hace falta guardar el motivo de un cierre por cuenta no habilitada: el mensaje solo se muestra al intentar iniciar sesión, desde el error de `signIn`.) Al arrancar se borra la clave antigua `lvb-auth` de `localStorage`.

`useUser()` pasa a devolver `{ status: 'checking' | 'signedIn' | 'signedOut', email, role }`; `RequireAuth` y `LoginPage` muestran "Comprobando sesión…" en `checking`. Se eliminan `lib/jwt.ts`, `token.schema.ts`, `LoginResponseSchema`, `SessionSchema` y `isExpired`.

El perfil se valida con `UserProfileSchema = z.object({ role: z.enum(['ADMIN', 'MEMBER', 'JUDGE']) })` (más campos opcionales que se ignoran). Un perfil inexistente o inválido es "cuenta no habilitada", no un `ContractError`, porque tiene un mensaje específico para el usuario.

`useLogin` mantiene la mutación de TanStack Query y la comprobación de `onlineManager`. `signIn` resuelve cuando el perfil se ha validado, así el `onSuccess` que navega ocurre ya con la sesión `signedIn`.

### 5. Errores de dominio en lugar de `HttpError`

El gateway traduce los códigos de Firebase a errores propios de la feature, para que la UI no dependa del SDK:

| Firebase | Error de dominio | Mensaje |
|---|---|---|
| `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-email` | `InvalidCredentialsError` | "Correo o contraseña incorrectos" |
| perfil ausente / rol inválido / `permission-denied` al leer el perfil | `AccountNotEnabledError` | "Tu cuenta no está habilitada. Contacta con un administrador." |
| cualquier otro (`auth/network-request-failed`, `auth/too-many-requests`, …) | se propaga | "No se pudo iniciar sesión. Inténtalo de nuevo." |

Desaparecen `HttpError`, `httpClient` y `apiUrl`.

### 6. Contratos con Zod al leer, comunes a Firebase y a los fakes

El repositorio devuelve los documentos tal cual (`{ id, data }`) y `getBeyblades()` compone `{ ...data, id }` y lo valida con `BeybladeSchema` (`z.object`, así que los campos extra se ignoran) mediante `parseContract`. Si algún documento no cumple, rechaza con un `ContractError` y no devuelve datos parciales.

Se descartó validar en un `FirestoreDataConverter` (lo que preveía la primera versión de este diseño): la validación quedaría solo en la implementación de Firebase y los tests con el fake no la ejercitarían. Así, los escenarios de `api-contracts` se prueban con la misma función que corre en producción.

`ContractError` se mueve a `src/shared/contracts/ContractError.ts` y cambia `method`/`path`/`direction` por `source` (p. ej. `beyblades/abc123`); `parseContract(schema, data, source)` lo lanza y lo registra en consola en desarrollo.

`useBeyblades` mantiene su forma de estado. Firestore no admite cancelar `getDocs`, así que se ignora el resultado tras desmontar (bandera en el cleanup del efecto) en lugar de `AbortController`.

### 7. Modelo de datos y reglas

```
users/{uid}        { role: 'ADMIN' | 'MEMBER' | 'JUDGE', email?: string, displayName?: string }
beyblades/{id}     { name, type, blader, wins }   (id = id del documento)
```

`firestore.rules` (resumen):

```
function signedIn()   { return request.auth != null; }
function profile()    { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
function hasRole()    { return signedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
                               && profile().role in ['ADMIN', 'MEMBER', 'JUDGE']; }
function isAdmin()    { return hasRole() && profile().role == 'ADMIN'; }

match /users/{uid}     { allow read: if (signedIn() && request.auth.uid == uid) || isAdmin();
                         allow write: if isAdmin(); }
match /beyblades/{id}  { allow read: if hasRole();
                         allow write: if isAdmin(); }
```

Cualquier persona con la `apiKey` pública puede crear una cuenta de correo/contraseña con la API REST de Firebase aunque la app no tenga registro; por eso las reglas exigen **perfil**, no solo sesión. Además se recomienda desactivar la creación de cuentas por clientes en la consola (Authentication > Settings > User actions).

### 8. Tests de reglas con el emulador, fuera de `test:run`

`firestore.rules.test.ts` en `firebase/` (fuera de `src/`) con `@firebase/rules-unit-testing`, ejecutado por `npm run test:rules` = `firebase emulators:exec --only firestore "vitest run --config vitest.rules.config.ts"`. Necesita Java 21 (`actions/setup-java` en CI). Para que el paso se compruebe antes de fusionar, el workflow pasa a ejecutarse también en `pull_request`, y solo publica la demo en `push`/`workflow_dispatch`. No bloquea el bucle local de `npm run test:run`.

### 9. Configuración

`EnvSchema` pasa a `z.strictObject({ VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID })`, todas `z.string().min(1)` y sin valores por defecto. Los valores no se versionan: en local van en `.env.local` (ignorado por Git, igual que `.env`) y en CI en variables del repositorio de GitHub que el workflow pasa al build de la demo, fallando al publicar si falta alguna. Se borran `.env.development` y `.env.demo`; `.env.example` documenta las variables. La configuración web de Firebase no es un secreto (acaba en el bundle): no versionarla es higiene y facilita cambiar de proyecto; la seguridad la dan las reglas y la restricción de la API key por referente. En tests, `parseEnv` se prueba con objetos explícitos y el `env` del módulo recibe valores ficticios desde `vitest` (`test.env`), lo que no importa porque los fakes no usan Firebase.

### 10. PWA

Las peticiones de Firebase van a otros orígenes (`*.googleapis.com`) y el service worker solo precachea recursos propios sin `runtimeCaching`, así que no se cachean. Se elimina el `navigateFallbackDenylist` basado en `VITE_API_BASE_URL` y el `loadEnv` asociado en `vite.config.ts`. El login por correo/contraseña no usa las rutas `/__/auth/*`, así que el fallback de navegación no interfiere.

## Risks / Trade-offs

- [Desarrollo y demo escriben y leen datos reales del mismo proyecto] → No hay escrituras desde la app en este cambio; las cuentas de prueba se marcan como tales; separar proyectos más adelante solo requiere otros valores por modo o entorno.
- [Los fakes pueden divergir del comportamiento real de Firebase] → Los fakes implementan la misma interfaz y devuelven los mismos errores de dominio; las reglas se prueban con el emulador; verificación manual del login y del listado contra Firebase en la tarea final.
- [Creación de cuentas por terceros vía API REST] → Reglas que exigen perfil; desactivar el alta por clientes en la consola.
- [Tamaño del bundle con el SDK de Firebase] → SDK modular, import dinámico en un chunk aparte; se compara el tamaño del build antes y después.
- [`onAuthStateChanged` tarda en responder al arrancar] → Estado `checking` explícito.
- [Arranque sin conexión: Firebase recupera el usuario de su caché, pero el perfil no se puede leer] → El gateway guarda el último perfil validado en `localStorage` (`lvb-profile`, con `uid` y validado con Zod al leerlo). Si la lectura del perfil falla **por red** (`unavailable`), se usa ese perfil si es del mismo `uid`; si no hay, `signedOut`. Un perfil inexistente o `permission-denied` siempre cierra la sesión. El rol en cliente solo decide qué se muestra; la seguridad está en las reglas.
- [Usuarios con sesión antigua en `lvb-auth`] → Se borra la clave al arrancar; tendrán que iniciar sesión una vez.
- [Java necesario para `test:rules`] → Script separado y paso propio en CI.

## Migration Plan

1. Crear el proyecto de Firebase: activar Authentication (correo/contraseña, sin alta por clientes), crear Firestore, añadir `charliecobo.github.io` y `localhost` a los dominios autorizados.
2. Desplegar `firestore.rules` (`npx firebase deploy --only firestore:rules`).
3. Crear en la consola las cuentas iniciales y sus documentos `users/{uid}` (al menos un `ADMIN`), y los beyblades iniciales.
4. Crear las variables `VITE_FIREBASE_*` del repositorio en GitHub y restringir la API key por referente; fusionar el cambio y el workflow construye la demo con ellas.
5. Rollback: revertir el merge vuelve a la demo con MSW; el proyecto de Firebase puede quedarse sin uso.

## Open Questions

- Nombre e id definitivos del proyecto de Firebase (solo cambian los valores de `.env.local` y de las variables del repositorio).
- Si el botón "Cerrar sesión" va en una cabecera nueva o en el `AppLayout` actual junto al título (detalle visual; el comportamiento está en el spec).
