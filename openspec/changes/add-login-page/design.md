# Design

## Context

- `src/app/App.tsx` pinta directamente `<main>` con `BeybladeList` y el aviso de actualización de la PWA. No hay router ni providers.
- `src/shared/api/httpClient.ts` expone `httpGet`, `apiUrl` y un transporte configurable (`setHttpTransport`). Con los mocks activos, el transporte resuelve contra los handlers de MSW en memoria, sin red (ver la spec `api-mocking`).
- `useBeyblades` gestiona el estado de la petición a mano con `useState` y `useEffect`.
- `renderWithProviders` (`src/test/test-utils.tsx`) envuelve en un `AllProviders` vacío, preparado para añadir providers.
- La demo se publica en GitHub Pages bajo `/beyblade-valencia/`. Pages no tiene fallback para SPA. El service worker de la PWA usa `navigateFallback: 'index.html'`, pero solo desde la segunda visita.
- Restricciones del repositorio:
  - `src/shared/` no importa de `features/`.
  - Cada feature expone su API pública en `index.ts`.
  - Cada entidad tiene una factory con Faker y cada endpoint un handler de MSW.
- Versiones actuales: `react-router` 8.x, `@tanstack/react-query` 5.x y `zustand` 5.x.

## Goals / Non-Goals

**Goals:**
- Dejar montada la infraestructura de router, layout, TanStack Query y Zustand, para que las próximas páginas y features solo añadan rutas, queries y stores.
- Separar el control de acceso (`RequireAuth`) de la estructura visual (`AppLayout`).
- Que la sesión se lea de forma síncrona al arrancar, sin un parpadeo del login con una sesión válida guardada.

**Non-Goals:**
- Validar la sesión contra el servidor (`/api/auth/me`) y adjuntar el token a las peticiones. Se hará en la siguiente iteración.
- Refresh tokens y logout.
- Migrar `useBeyblades` a TanStack Query. Se hará en un cambio aparte.
- Validación de formularios con librería o esquemas: basta la validación nativa de HTML.

## Decisions

### 1. Estructura de la feature `auth`

```
src/features/auth/
  api/auth.api.ts              LOGIN_PATH, login(credentials) -> httpPost
  types/auth.types.ts          LoginCredentials, LoginResponse, Session, TokenPayload
  store/auth.store.ts          useAuthStore (Zustand + persist)
  lib/jwt.ts                   decodeTokenPayload(token) -> TokenPayload (sin verificar firma)
  hooks/useUser.ts             { token, email, isExpired }
  hooks/useLogin.ts            useMutation(login) + comprobación de conexión
  components/LoginForm.tsx     formulario, estados de envío y error
  components/LoginPage.tsx     página: redirige si hay sesión y navega tras el login
  components/RequireAuth.tsx   ruta de layout: <Outlet/> o <Navigate to="/login">
  mocks/authUser.factory.ts    buildAuthUser(overrides), TEST_USER
  mocks/jwt.ts                 buildFakeJwt(payload)
  mocks/auth.handlers.ts       POST /api/auth/login
  index.ts                     LoginPage, RequireAuth, useUser
```

`lib/` es una carpeta nueva dentro de la convención de features. Contiene utilidades puras de la feature que no son API, hooks ni componentes. Decodificar el token lo usan el store y los tests, así que no debe vivir en `mocks/`.

### 2. Sesión: Zustand con `persist` y `isExpired` derivado

El store guarda `{ token, email, exp }`, con `exp` en segundos tomado del payload, y las acciones `setSession(accessToken)` y `clearSession()`. `setSession` decodifica el payload (base64url → JSON) y lanza un error si el token no tiene la forma esperada. El token devuelto por el servidor es la única fuente del correo y de la expiración.

`useUser()` lee el store y calcula `isExpired = token === null || exp * 1000 <= Date.now()` en cada render. No se guarda un booleano `expired` porque se quedaría desactualizado: nadie lo pasaría a `true` al llegar la hora.

- **Persistencia**: el middleware `persist` con `localStorage` (clave `lvb-auth`) y `partialize` para guardar solo los datos, no las acciones. Con un storage síncrono, Zustand rehidrata al crear el store, así que en el primer render ya se conoce la sesión y no hace falta un estado de carga.
- **Sesión expirada**: se queda en el store hasta que un nuevo login la sobrescribe. `RequireAuth` solo redirige y no borra nada durante el render. El borrado llegará con el logout en la siguiente iteración.
- **Alternativa descartada: `tokenStorage` propio sobre `localStorage`.** Zustand ya da suscripción reactiva y persistencia, y el estado del usuario crecerá (nombre, roles…).
- **Alternativa descartada: guardar el token solo en memoria.** Es más resistente a XSS, pero la sesión se perdería al recargar, en contra de la spec.

### 3. Peticiones con TanStack Query

- Un único `QueryClient` en `src/app/queryClient.ts` y `QueryClientProvider` en `main.tsx`. Las mutaciones no reintentan (comportamiento por defecto).
- `useLogin()` envuelve `useMutation({ mutationFn: login, onSuccess: ({ accessToken }) => setSession(accessToken) })`.
- **Sin conexión**: con el `networkMode: 'online'` por defecto, una mutación sin red queda en pausa y se reanuda sola al volver la conexión, y eso iniciaría la sesión sin que el usuario actúe. Para evitarlo, `useLogin` expone un `submit(credentials)` que primero consulta `onlineManager.isOnline()`. Si no hay red, activa un estado `offline` y no llama a `mutate`. Funciona igual en la demo, donde los mocks no necesitan red, porque `onlineManager` se basa en los eventos `online`/`offline` del navegador.
- **Distinguir errores**: `HttpError` con `status === 401` muestra el mensaje de credenciales incorrectas. Cualquier otro error muestra el genérico.
- **Alternativa descartada: `networkMode: 'always'` y detectar el `TypeError` de `fetch`.** En la demo nunca habría error de red, así que el aviso no se vería.

### 4. `httpPost` en el cliente HTTP

`httpGet` y `httpPost` comparten una función interna `request(method, path, init)` que construye el `Request`, lo pasa al transporte y lanza un `HttpError` si `!response.ok`. `httpPost<TBody, TResponse>(path, body, init?)` serializa `body` como JSON con `Content-Type: application/json`. La API pública de `httpGet` no cambia.

### 5. Router: `react-router` en modo declarativo

- `main.tsx` monta `<BrowserRouter basename={import.meta.env.BASE_URL}>`. `BASE_URL` ya vale `/` o `/beyblade-valencia/` según el modo.
- `App.tsx` contiene las `<Routes>` y el `UpdatePrompt`, que sigue siendo global y queda fuera de las rutas. Como el router está fuera de `App`, los tests pueden envolver `App` en un `MemoryRouter`.

```
<Routes>
  <Route path="login" element={<LoginPage/>} />
  <Route element={<RequireAuth/>}>
    <Route element={<AppLayout/>}>
      <Route index element={<HomePage/>} />
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>} />
</Routes>
```

- **`RequireAuth`**: si `isExpired`, devuelve `<Navigate to="/login" replace state={{ from: location }}/>`. Si no, devuelve `<Outlet/>`.
- **`LoginPage`**: si hay sesión no expirada, devuelve `<Navigate to="/" replace/>`. Tras el `onSuccess`, navega a `state.from.pathname` (más `search` y `hash`) con `replace`, o a `/` si no hay `from`. Solo usa `from` si es un objeto location del propio router, nunca una URL arbitraria.
- **`AppLayout`** (`src/app/layout/AppLayout.tsx`): de momento `<main className="container"><h1>Beyblade Valencia</h1><Outlet/></main>`, que es lo que pintaba `App`. El header y el menú lateral se añadirán aquí.
- **`HomePage`** (`src/app/pages/HomePage.tsx`): compone `BeybladeList`.
- **Alternativa descartada: un HOC `withAuth`.** Protege página a página y es fácil olvidarlo en una página nueva. La ruta de layout protege un subárbol entero y se ve en la tabla de rutas.
- **Alternativa descartada: el modo de datos (`createBrowserRouter` con loaders).** Los loaders no pueden usar hooks como `useUser` y no aportan nada sin data fetching por ruta.
- **Alternativa descartada: `HashRouter`.** Funciona en Pages sin pasos extra, pero obliga a usar URLs con `#`, que habría que migrar con un hosting real.

### 6. `404.html` para la demo en GitHub Pages

Un plugin pequeño de Vite, definido en línea en `vite.config.ts` con `apply: 'build'`, copia `dist/index.html` a `dist/404.html` en `closeBundle`, solo cuando `mode === 'demo'`. Pages sirve `404.html` ante cualquier ruta inexistente. Ese HTML es la app, que arranca y el router resuelve la URL.

`workbox.globIgnores` excluye `404.html` del precache, porque duplicaría `index.html` sin aportar nada.

**Alternativa descartada: un script `postbuild` en `package.json`.** Lo ejecutarían todos los builds y no conoce el modo.

### 7. Mocks

- `buildAuthUser(overrides)` genera `{ id, email, password }` con Faker. `TEST_USER` es el usuario fijo `test@mail.com` / `Test1234!`, con `id` estable.
- `buildFakeJwt({ sub, email, iat, exp })` crea `base64url(header).base64url(payload).fake-signature`.
- El handler compara el body con `TEST_USER` y responde con `iat = now` y `exp = iat + 3600`. Si no coincide, responde 401 con `{ message }`.
- Los handlers se registran en `src/mocks/handlers.ts`.

### 8. Tests

- `renderWithProviders(ui, { route })` crea un `QueryClient` nuevo por render (sin reintentos) y un `MemoryRouter` con `initialEntries={[route ?? '/']}`. Para probar `App` se renderiza `<App/>` dentro, sin `BrowserRouter`.
- `src/test/setup.ts` hace en `afterEach`:
  - `localStorage.clear()`.
  - `useAuthStore.setState` con la sesión vacía.
  - `onlineManager.setOnline(true)`.
- Los tests con sesión la crean con `useAuthStore.getState().setSession(buildFakeJwt(...))`.
- Los tests de `App` pasan a tener dos casos: sin sesión se ve el login, y con sesión se ve la lista.

## Risks / Trade-offs

- **[El token en `localStorage` es accesible ante XSS]** → Se acepta en esta fase: no hay backend real y React escapa la salida. Cuando exista backend se valorará una cookie `httpOnly`, cambiando solo el store y `httpClient`.
- **[`isExpired` no provoca un re-render al caducar]** → La protección se evalúa al navegar o recargar. Basta para esta iteración. La siguiente puede añadir un temporizador hasta `exp` y la validación con `/me`.
- **[API de `react-router` v8 desconocida en detalle]** → La tarea de instalación comprueba que el modo declarativo (`BrowserRouter`, `Routes`, `Navigate`, `Outlet`, `MemoryRouter`) sigue disponible en `react-router`. Si algo cambia, se ajusta este diseño antes de seguir.
- **[Compatibilidad de tipos con TypeScript 7]** → Se comprueba con `npm run typecheck` tras instalar.
- **[`onlineManager` se fía de `navigator.onLine`, que puede dar falsos positivos]** → Si el navegador cree que hay red pero no la hay, la petición falla y se muestra el error genérico. El usuario puede reintentar.
- **[GitHub Pages responde 404 en los enlaces profundos aunque la página carga]** → Sin impacto para el usuario. Desaparece con un hosting que admita rewrites.
- **[La lista deja de ser pública en la demo]** → Es intencionado. Las credenciales de prueba se documentan en el README.

## Migration Plan

1. Desplegar con el workflow actual (push a `master` → `gh-pages`).
2. Los usuarios con la versión anterior verán el aviso de nueva versión. Al actualizar, aparece el login.
3. **Rollback**: revertir el commit. La clave `lvb-auth` de `localStorage` que quede no afecta a la versión anterior.
