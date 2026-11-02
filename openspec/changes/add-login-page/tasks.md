# Tasks

## 1. Dependencias

- [x] 1.1 Instalar `react-router`, `@tanstack/react-query` y `zustand` como dependencias de ejecución. Verificar con `npm ls react-router @tanstack/react-query zustand` sin errores de peer dependencies y con `npm run typecheck` en verde.
- [x] 1.2 Comprobar que `react-router` v8 exporta en modo declarativo `BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Navigate`, `Outlet`, `useLocation` y `useNavigate`. Verificar con un import de prueba que compila. Si algo ha cambiado, actualizar la decisión 5 de `design.md` antes de seguir.

## 2. Cliente HTTP

- [x] 2.1 Extraer en `src/shared/api/httpClient.ts` una función interna `request(method, path, init)` usada por `httpGet`, y añadir `httpPost<TBody, TResponse>(path, body, init?)`, que envía JSON con `Content-Type: application/json`. Verificar en `httpClient.test.ts` que un transporte inyectado recibe un POST con la URL absoluta, la cabecera y el body serializado; que una respuesta no `ok` lanza `HttpError` con su `status`; y que los tests de `httpGet` siguen pasando.

## 3. Mocks de autenticación

- [x] 3.1 Crear `src/features/auth/types/auth.types.ts` (`LoginCredentials`, `LoginResponse`, `TokenPayload`, `Session`) y `src/features/auth/mocks/authUser.factory.ts` con `buildAuthUser(overrides)` (Faker) y `TEST_USER` (`test@mail.com` / `Test1234!`). Verificar con `authUser.factory.test.ts` que la factory respeta los overrides y genera correos válidos.
- [x] 3.2 Crear `src/features/auth/mocks/jwt.ts` con `buildFakeJwt(payload)` (`base64url(header).base64url(payload).fake-signature`). Verificar con `jwt.test.ts` que el token tiene tres partes y que el payload decodificado coincide con el de entrada.
- [x] 3.3 Crear `src/features/auth/api/auth.api.ts` (`LOGIN_PATH = '/auth/login'`, `login(credentials)` sobre `httpPost`) y `src/features/auth/mocks/auth.handlers.ts` (200 con `{ accessToken }` para `TEST_USER` con `exp = iat + 3600`; 401 con `{ message }` en otro caso), y registrarlos en `src/mocks/handlers.ts`. Verificar con `auth.api.test.ts` que `login(TEST_USER)` devuelve un token cuyo payload tiene `email` igual a `test@mail.com` y `exp - iat === 3600`, y que otras credenciales lanzan `HttpError` 401. Ampliar `src/mocks/transport.test.ts` con un caso de `POST /api/auth/login` resuelto por el transporte de mocks.

## 4. Sesión

- [x] 4.1 Crear `src/features/auth/lib/jwt.ts` con `decodeTokenPayload(token)` (base64url → JSON, sin verificar la firma, con un error si el formato no es válido). Verificar con `jwt.test.ts` un token generado con `buildFakeJwt`, un token con dos partes y un payload que no es JSON.
- [x] 4.2 Crear `src/features/auth/store/auth.store.ts` (`useAuthStore`: `{ token, email, exp }`, `setSession(accessToken)` y `clearSession()`, con `persist` sobre `localStorage`, clave `lvb-auth` y `partialize` de los datos). Verificar con `auth.store.test.ts` que `setSession` guarda el correo y el `exp` del payload, que lo persiste en `localStorage`, que un token inválido lanza un error sin modificar el estado y que `clearSession` lo vacía.
- [x] 4.3 Crear `src/features/auth/hooks/useUser.ts` (`{ token, email, isExpired }`, con `isExpired` calculado a partir de `exp` y `Date.now()`). Verificar con `useUser.test.ts` y `vi.useFakeTimers`/`vi.setSystemTime` los casos sin sesión (`isExpired: true`), con sesión vigente y con sesión caducada.
- [x] 4.4 Ampliar `src/test/setup.ts` para que en `afterEach` limpie `localStorage`, reinicie `useAuthStore` a la sesión vacía y ponga `onlineManager.setOnline(true)`. Verificar que los tests de 4.2 y 4.3 pasan en cualquier orden con `npx vitest run --sequence.shuffle`.

## 5. Infraestructura de app: Query, router y tests

- [x] 5.1 Crear `src/app/queryClient.ts`. En `src/main.tsx`, envolver `App` en `QueryClientProvider` y `BrowserRouter` con `basename={import.meta.env.BASE_URL}`. Verificar con `npm run typecheck` y con `npm run dev`: la app arranca sin errores en consola.
- [x] 5.2 Ampliar `renderWithProviders` en `src/test/test-utils.tsx` con un `QueryClient` nuevo por render (`retry: false`) y un `MemoryRouter` con la opción `route` (por defecto `/`). Verificar que los tests existentes (`BeybladeList`, `UpdatePrompt`) siguen pasando.

## 6. Login

- [x] 6.1 Crear `src/features/auth/hooks/useLogin.ts`: `useMutation` con `onSuccess` → `setSession`, y `submit(credentials)` que no llama a `mutate` si `onlineManager.isOnline()` es `false` y expone `isOffline`, `isPending` y `error`. Verificar con `useLogin.test.ts` que el login correcto guarda la sesión, que el 401 deja `error` con status 401 sin sesión, y que sin conexión no se hace ninguna petición ni se envía nada al volver a `setOnline(true)`.
- [x] 6.2 Crear `src/features/auth/components/LoginForm.tsx`: correo (`type="email"`, `required`, `autoComplete="email"`), contraseña (`type="password"`, `required`, `autoComplete="current-password"`), botón "Iniciar sesión" (deshabilitado y con "Iniciando sesión…" mientras se envía) y mensajes en `role="alert"` ("Correo o contraseña incorrectos", "No se pudo iniciar sesión. Inténtalo de nuevo.", "Sin conexión. Revisa tu conexión e inténtalo de nuevo."), con estilos en `index.css`. Verificar con `LoginForm.test.tsx`:
  - Los campos vacíos y un correo inválido no generan ninguna petición.
  - Se muestra el estado de envío.
  - Se muestra el mensaje de un 401 y el de un 500 (con `server.use`).
  - Se muestra el aviso sin conexión.
- [x] 6.3 Crear `src/features/auth/components/LoginPage.tsx`: redirige a `/` si hay sesión vigente y, tras el login, navega con `replace` a `state.from` o a `/`. Verificar con `LoginPage.test.tsx` (dentro de un `Routes` de prueba):
  - Login correcto sin `from` → `/`.
  - Login correcto con `from` → la ruta de origen.
  - Con sesión vigente → `/`.
  - Con sesión caducada → se muestra el formulario.
- [x] 6.4 Crear `src/features/auth/components/RequireAuth.tsx` (`<Outlet/>` o `<Navigate to="/login" replace state={{ from: location }}/>`) y exportar `LoginPage`, `RequireAuth` y `useUser` desde `src/features/auth/index.ts`. Verificar con `RequireAuth.test.tsx` que sin sesión y con sesión caducada se redirige a `/login` con `from`, y que con sesión se pinta la ruta hija.

## 7. Rutas y layout de la app

- [x] 7.1 Crear `src/app/layout/AppLayout.tsx` (`<main className="container">` con el `h1` y un `<Outlet/>`) y `src/app/pages/HomePage.tsx` (compone `BeybladeList`). Verificar con `AppLayout.test.tsx` que pinta el título y la ruta hija.
- [x] 7.2 Reescribir `src/app/App.tsx` con la tabla de rutas de `design.md` (`login`, `RequireAuth` > `AppLayout` > índice `HomePage`, `*` → `/`), manteniendo `UpdatePrompt` fuera de las rutas. Verificar con `App.test.tsx`:
  - Sin sesión, `/` muestra el formulario de login y no pide `/api/beyblades`.
  - Con sesión, `/` muestra las 6 tarjetas.
  - `/no-existe` sin sesión termina en el login.
  - El flujo completo: login con `TEST_USER` → lista de beyblades.
  - El aviso de actualización sigue sin mostrarse cuando no hay versión pendiente.

## 8. Build de demo y documentación

- [x] 8.1 Añadir en `vite.config.ts` un plugin en línea (`apply: 'build'`, solo con `mode === 'demo'`) que copie `dist/index.html` a `dist/404.html` en `closeBundle`, y añadir `globIgnores: ['404.html']` a la configuración de Workbox. Verificar que `npm run build:demo` genera `dist/404.html` idéntico a `index.html` y que no aparece en el precache de `dist/sw.js`, y que `npm run build` no genera `404.html`.
- [x] 8.2 Actualizar el README:
  - Añadir `auth`, `app/layout` y `app/pages` al árbol de arquitectura.
  - Mencionar la carpeta `lib/` de las features.
  - Explicar la sección de autenticación: usuario de prueba, sesión en `localStorage` (`lvb-auth`), rutas protegidas con `RequireAuth`.
  - Indicar que el estado de servidor va con TanStack Query y el de cliente con Zustand.
  - Explicar el `404.html` de la demo.

  Verificar que las rutas y los comandos citados existen.

## 9. Comprobación integrada

- [x] 9.1 Con `npm run build:demo` + `vite preview --mode demo` y Playwright:
  - Abrir directamente `/beyblade-valencia/login` sin service worker muestra el formulario.
  - El login con `test@mail.com` / `Test1234!` lleva a `/beyblade-valencia/` con las 6 tarjetas.
  - Tras recargar, la sesión se mantiene.
  - Con `context.setOffline(true)`, enviar el formulario (con la sesión borrada) muestra el aviso sin conexión.
  - Con sesión vigente, abrir `/beyblade-valencia/login` redirige a la lista.
- [x] 9.2 Ejecutar `npm run lint`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores.

## Workflow follow-up

- Archivar el cambio con `/opsx:archive` cuando esté revisado y desplegado.
- Siguiente iteración prevista:
  - `GET /api/auth/me` al arrancar.
  - La cabecera `Authorization` automática en `httpClient` (con un proveedor de token inyectado).
  - Logout, incluido el automático ante un 401.
  - Caducidad reactiva de la sesión.
  - Header y menú lateral en `AppLayout`.
