# Proposal

## Why

La aplicación necesita zonas privadas (perfil, inscripciones a torneos…) y hoy no tiene ni identificación de usuarios ni navegación entre páginas: `App` pinta directamente la lista de beyblades. Este cambio añade la página de login contra la API simulada, la sesión en el cliente y la protección de páginas. Así quedan listas las bases (router, layout, gestión de peticiones y estado) sobre las que se construirán el header, el menú lateral y el resto de páginas.

## What Changes

- Nueva página `/login` con un formulario de correo y contraseña, validación nativa de HTML, mensaje de error ante credenciales incorrectas y aviso sin conexión. Usuario de prueba: `test@mail.com` / `Test1234!`.
- Endpoint simulado `POST /api/auth/login`, que devuelve `{ accessToken }` con un JWT falso (`header.payload.firma-falsa` con `sub`, `email`, `iat` y `exp`) o un 401 si las credenciales no coinciden.
- Sesión en el cliente: un store de Zustand persistido en `localStorage` que guarda el token, el correo y la expiración. El hook `useUser` expone `{ token, email, isExpired }`.
- Router con `react-router` (`BrowserRouter` con `basename` igual a la ruta base). La lista de beyblades pasa a ser la página `/`, protegida.
- Protección de páginas mediante una ruta de layout (`RequireAuth`): sin sesión válida redirige a `/login` y, tras iniciar sesión, devuelve a la página solicitada. Si ya hay sesión, `/login` redirige a `/`.
- Layout visual `AppLayout`, separado del guard, donde vivirán el header y el menú lateral.
- TanStack Query para las peticiones: el login es una mutación. `QueryClientProvider` se monta en la app y en `renderWithProviders`.
- `httpPost` en `src/shared/api/httpClient.ts`.
- El build de demo genera `404.html` (copia de `index.html`) para que GitHub Pages sirva la app en los enlaces profundos.
- **BREAKING (comportamiento)**: la lista de beyblades deja de ser pública; sin sesión, la app muestra el login.

## Capabilities

### New Capabilities

- `auth`: Inicio de sesión con correo y contraseña, sesión del usuario en el cliente (token, correo y expiración, persistidos entre recargas) y protección de páginas que requieren sesión.
- `routing`: Navegación entre páginas con URLs propias bajo la ruta base de la aplicación, incluido el acceso directo a una URL profunda en la demo de GitHub Pages.

### Modified Capabilities

<!-- Ninguna. `pwa` ya cubre la navegación con `navigateFallback` y no cachea la API (el POST de login tampoco se cachea). `api-mocking` no cambia: el nuevo endpoint se simula con un handler más. -->

## Impact

- **Dependencias nuevas**: `react-router`, `@tanstack/react-query` y `zustand` (de ejecución).
- **Código**:
  - Nueva feature `src/features/auth/` (api, store, hooks, components y mocks).
  - `src/shared/api/httpClient.ts` (`httpPost`).
  - `src/app/` (rutas, `AppLayout`, `HomePage`, providers).
  - `src/main.tsx`, `src/mocks/handlers.ts` y `src/test/test-utils.tsx` (providers y router en los tests).
- **Build y despliegue**: el build de demo copia `index.html` como `404.html`. El workflow de GitHub Pages no cambia.
- **Tests**: los tests de `App` pasan a tener en cuenta la sesión (sin sesión se muestra el login; con sesión, la lista).
- **Fuera de alcance**:
  - `GET /api/auth/me`.
  - La cabecera `Authorization` automática.
  - El logout, incluido el automático ante un 401.
  - La caducidad de la sesión mientras la página está abierta sin navegar.
  - Migrar `useBeyblades` a `useQuery`.
  - El header y el menú lateral.
