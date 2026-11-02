# Proposal

## Why

La aplicación no tiene backend: en desarrollo, en la demo y en los tests todo lo responde MSW, y en producción las peticiones a `/api` no llegan a ningún sitio. Para que el club pueda usarla de verdad hace falta un backend real con usuarios y datos persistentes. Firebase (Authentication + Firestore) lo da sin tener que operar un servidor propio, y permite introducir los roles que necesita la comunidad (administradores, miembros y jueces).

## What Changes

- **BREAKING** El inicio de sesión con correo y contraseña pasa a hacerse contra Firebase Authentication en lugar de `POST /api/auth/login`. El formulario y sus mensajes se mantienen.
- **BREAKING** La sesión deja de ser un JWT guardado por la aplicación: la gestiona Firebase, se conserva hasta que el usuario cierra sesión y deja de caducar a la hora.
- Nuevo: al arrancar, la aplicación indica que está comprobando la sesión en lugar de redirigir al login antes de saber si hay sesión.
- Nuevo: el usuario puede cerrar sesión desde las páginas privadas.
- Nuevo: cada cuenta tiene un perfil en la base de datos con un rol (`ADMIN`, `MEMBER` o `JUDGE`). Una cuenta sin perfil válido no puede entrar en la aplicación.
- Nuevo: reglas de seguridad de Firestore que exigen sesión y perfil para leer datos, y reservan a `ADMIN` la escritura de beyblades y la gestión de perfiles.
- El listado de beyblades se lee de Firestore, validando cada documento con su contrato.
- **BREAKING** Se elimina MSW y la API simulada (`src/mocks`, handlers, `mockTransport`, `VITE_API_MOCKING`) junto con el cliente HTTP (`httpClient`, `apiUrl`, `HttpError`). Los tests sustituyen los handlers por implementaciones en memoria de los accesos a datos de cada feature.
- **BREAKING** La configuración pasa de `VITE_API_BASE_URL` / `VITE_API_MOCKING` a las variables `VITE_FIREBASE_*`, que son obligatorias.
- La demo de GitHub Pages deja de usar datos simulados y se conecta al mismo proyecto de Firebase que el desarrollo y la producción.

Supuestos registrados (acordados o por defecto):

- Un único proyecto de Firebase para desarrollo, demo y producción.
- No hay registro de usuarios desde la aplicación: un `ADMIN` crea las cuentas y sus perfiles desde la consola de Firebase. El registro y la gestión de roles desde la app quedan para otro cambio.
- Los perfiles de jugador (incluidos menores gestionados por su tutor) quedan fuera; irán en un cambio posterior (`player-profiles`).

## Capabilities

### New Capabilities

- `access-control`: perfiles de usuario con rol (`ADMIN`, `MEMBER`, `JUDGE`), cuentas no habilitadas y reglas de acceso a los datos almacenados según sesión y rol.

### Modified Capabilities

- `auth`: el login se hace contra el servicio de autenticación; la sesión se conserva hasta cerrar sesión (sin expiración por token); se añaden la comprobación de sesión al arrancar y el cierre de sesión; se eliminan el endpoint simulado, la sesión guardada por la app y la validación del token.
- `api-contracts`: los contratos se aplican a los documentos leídos de la base de datos en lugar de a respuestas HTTP; la configuración validada pasa a ser la de Firebase; se eliminan los requisitos ligados a peticiones HTTP y a datos simulados.
- `api-mocking`: se elimina la capacidad completa (todos sus requisitos).
- `pwa`: el requisito de no cachear la API pasa a referirse a las peticiones a los servicios de Firebase.

## Impact

- **Código**: `src/features/auth` (api, hooks, store, schemas, componentes `LoginForm`, `RequireAuth`, `LoginPage`), `src/features/beyblades` (api, hooks, mocks), `src/shared/api` (se elimina `httpClient`; `ContractError` se adapta), `src/shared/config/env.ts`, `src/main.tsx`, `src/app/layout/AppLayout.tsx`, `src/mocks/` (se elimina), `src/test/setup.ts` y `src/test/test-utils.tsx`, `vite.config.ts` (denylist de la API en Workbox).
- **Dependencias**: se añaden `firebase` y, para probar las reglas, `firebase-tools` y `@firebase/rules-unit-testing` (desarrollo). Se elimina `msw`. Faker se mantiene para las factories.
- **Ficheros nuevos**: `firebase.json`, `firestore.rules`, `.env` con la configuración pública de Firebase; desaparecen `.env.development`/`.env.demo` de mocks.
- **Infraestructura**: proyecto de Firebase con Authentication (correo/contraseña) y Firestore; `charliecobo.github.io` en los dominios autorizados; despliegue manual de las reglas. El workflow `deploy-demo.yml` deja de construir con MSW.
- **Documentación y convenciones**: `README.md` y el `context`/`rules` de `openspec/config.yaml`, que hoy describen MSW como fuente de mocks.
- **Datos**: los usuarios y beyblades de prueba de los mocks desaparecen; los datos reales se crean en Firestore.
