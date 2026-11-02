# Beyblade Valencia

PWA con React 19 + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query y Zustand, con Vitest y Testing Library para tests, y MSW + Faker para mocks.

## Scripts

| Comando                 | Descripción                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (con la API simulada por defecto) |
| `npm run build`         | Type-check + build de producción                         |
| `npm run build:demo`    | Build de demo con MSW activo (GitHub Pages)              |
| `npm run preview`       | Sirve el build                                           |
| `npm run lint`          | Lint con oxlint                                          |
| `npm run typecheck`     | Sólo comprobación de tipos                               |
| `npm run format`        | Formatea el código con Prettier                          |
| `npm run format:check`  | Comprueba el formato sin escribir (CI)                   |
| `npm test`              | Vitest en modo watch                                     |
| `npm run test:run`      | Vitest una sola vez (CI)                                 |
| `npm run test:coverage` | Tests con cobertura (v8)                                 |

### Formato

El formato lo aplica Prettier (`.prettierrc.json`): comillas simples, sin `;`, comas finales y líneas de hasta 120 caracteres. `prettier-plugin-tailwindcss` ordena las clases de Tailwind en `className`, así que no hace falta cuidar su orden a mano. CI ejecuta `npm run format:check` y falla si algún archivo no está formateado.

`openspec/` y `.claude/` quedan fuera (`.prettierignore`), porque los generan o reescriben herramientas.

## Arquitectura

Organización **por features**: cada dominio vive en su carpeta y expone una API pública mínima.

```
src/
├── app/                 # Composición de la app: App (rutas), queryClient
│   ├── layout/          # AppLayout: estructura visual común (header y menú lateral, más adelante)
│   ├── pages/           # Páginas que componen features (HomePage)
│   └── pwa/             # Registro del service worker y aviso de actualización
├── features/
│   ├── auth/            # Login, sesión (useUser) y protección de rutas (RequireAuth)
│   └── beyblades/       # Una feature = un dominio
│       ├── api/         # Llamadas HTTP de la feature
│       ├── components/  # Componentes (+ tests colocados *.test.tsx)
│       ├── hooks/       # Lógica de estado / data fetching
│       ├── lib/         # (opcional) Utilidades puras de la feature
│       ├── mocks/       # Factories (Faker) y handlers (MSW) de la feature
│       ├── store/       # (opcional) Estado de cliente con Zustand
│       ├── types/       # Tipos del dominio
│       └── index.ts     # API pública: lo único que importa el resto de la app
├── shared/              # Código reutilizable sin dominio
│   ├── api/             # Cliente HTTP (httpGet, httpPost, apiUrl, HttpError)
│   ├── config/          # Variables de entorno tipadas
│   └── ui/              # Componentes de interfaz sin dominio (Button)
├── mocks/               # Ensamblado de MSW
│   ├── handlers.ts      # Agrega los handlers de todas las features
│   ├── transport.ts     # mockTransport: mocks en el navegador (desarrollo y demo)
│   └── server.ts        # setupServer (tests en Node)
├── index.css            # Tailwind, tokens del tema y estilos base
├── test/
│   ├── setup.ts         # jest-dom, cleanup y ciclo de vida del server MSW
│   └── test-utils.tsx   # renderWithProviders (QueryClient + MemoryRouter, + userEvent) y re-exports de RTL
└── main.tsx
```

### Reglas

- `features/*` puede importar de `shared/`, nunca de otra feature salvo por su `index.ts`.
- `shared/` no importa nada de `features/`.
- Alias `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).
- Los tests van junto al código que prueban (`Foo.tsx` → `Foo.test.tsx`).

## Estilos

Los estilos se escriben con utilidades de **Tailwind CSS v4** directamente en `className`. No hay hojas de estilo por componente ni clases globales: la configuración vive en `src/index.css` (`@import 'tailwindcss'` + `@theme`), sin `tailwind.config.js`.

### Tokens del tema

Usa siempre los tokens semánticos en lugar de colores de la paleta de Tailwind (`bg-card`, no `bg-zinc-900`):

| Token        | Ejemplo de uso                            | Oscuro    | Claro     |
| ------------ | ----------------------------------------- | --------- | --------- |
| `background` | `bg-background` (página, inputs)          | `#121212` | `#ffffff` |
| `foreground` | `text-foreground`, `border-foreground/30` | `#f1f1f1` | `#1a1a1a` |
| `card`       | `bg-card` (tarjetas, login, avisos)       | `#1f1f22` | `#f4f4f5` |
| `accent`     | `bg-accent`, `outline-accent`             | `#dd6e2f` | `#dd6e2f` |
| `danger`     | `border-danger`, `bg-danger/12`           | `#ef5350` | `#c62828` |

Cada token es una variable CSS (`--bg`, `--fg`, `--card`, `--accent`, `--danger`) con un valor en `:root` (claro) y otro en `.dark` (oscuro).

### Tema oscuro por defecto

La app es **siempre oscura**, sea cual sea la preferencia del sistema. `index.html` pone `class="dark"` y `color-scheme: dark` en `<html>`, así que el primer pintado ya es oscuro, antes de que se ejecute JavaScript. El manifest de la PWA usa `#121212` como `background_color` y `theme_color`.

- Como los tokens cambian solos con la clase `.dark`, los componentes **no necesitan `dark:`** para los colores base.
- La variante `dark:` funciona por clase (`@custom-variant dark` en `index.css`), no por `prefers-color-scheme`. Úsala solo para excepciones puntuales.
- Los valores del tema claro están definidos pero no se usan. Un selector de tema futuro solo tendrá que poner o quitar `.dark` en `<html>` (y recordar la preferencia).

### Componentes compartidos

Cuando unas mismas clases se repiten en dos sitios, se extraen a un componente en `src/shared/ui/` en vez de crear una clase CSS con `@apply`. Por ahora existe `Button` (variantes `primary` y `secondary`; por defecto `type="button"`).

## Mocks

- **Faker**: cada entidad tiene una factory `buildX(overrides)` en `features/<feature>/mocks/`.
- **MSW**: los handlers por defecto viven en la feature y se registran en `src/mocks/handlers.ts`.
  - En tests, `server` se arranca en `src/test/setup.ts` con `onUnhandledFrame: 'error'`, así que cualquier petición no mockeada hace fallar el test.
  - Para un caso concreto, sobrescribe con `server.use(...)` (se resetea tras cada test):

    ```ts
    server.use(http.get(apiUrl(BEYBLADES_PATH), () => new HttpResponse(null, { status: 500 })))
    ```
- **En el navegador (desarrollo y demo)** no hay service worker de MSW: con `VITE_API_MOCKING=enabled`
  (ver `.env.development` y `.env.demo`), `src/main.tsx` inyecta `mockTransport` (`src/mocks/transport.ts`)
  en el cliente HTTP con `setHttpTransport`. Ese transporte resuelve cada petición con `getResponse` de MSW
  contra los mismos handlers, y si ninguno coincide la envía a la red. Así el único service worker es el de la PWA.
  - Solo se simulan las peticiones que pasan por `src/shared/api/httpClient.ts`.
  - Las peticiones simuladas no aparecen en la pestaña Network; en desarrollo se registran en la consola
    como `[mock] GET <url> -> <status>` (nivel _Verbose_/`debug`).
  - El build de producción (`npm run build`) no incluye MSW, Faker ni los handlers.

### Estado y peticiones

- **Estado de servidor** (datos de la API, mutaciones): TanStack Query. El `QueryClient` de la app está en
  `src/app/queryClient.ts`; en los tests, `renderWithProviders` crea uno nuevo por render, sin reintentos.
- **Estado de cliente** (sesión, preferencias…): Zustand, con un store por feature en `store/`.
- **Rutas**: React Router en modo declarativo. La tabla de rutas está en `src/app/App.tsx` y el `BrowserRouter`
  en `src/main.tsx`, con `basename` igual a la ruta base. `renderWithProviders(ui, { route: '/login' })` fija la
  ruta inicial en los tests.

### Añadir una nueva feature

1. Crea `src/features/<nombre>/` con la estructura anterior.
2. Añade su factory y sus handlers en `mocks/`.
3. Registra los handlers en `src/mocks/handlers.ts`.
4. Exporta lo necesario desde `index.ts`.

## Autenticación

- **Usuario de prueba** (API simulada): `test@mail.com` / `Test1234!`.
- `POST /api/auth/login` devuelve `{ accessToken }`, un JWT falso (`header.payload.fake-signature`) con `sub`,
  `email`, `iat` y `exp` (una hora de validez), o un 401 si las credenciales no coinciden. El cliente no
  verifica la firma: solo lee el payload.
- **Sesión**: `useAuthStore` (`src/features/auth/store/auth.store.ts`) guarda `{ token, email, exp }` en
  `localStorage` con la clave `lvb-auth`. Fuera de la feature se usa `useUser()`, que devuelve
  `{ token, email, isExpired }`. `isExpired` se calcula a partir de `exp` en cada render.
- **Páginas privadas**: se anidan bajo la ruta de layout `RequireAuth` en `src/app/App.tsx`. Sin una sesión
  vigente, redirige a `/login` y, tras iniciar sesión, vuelve a la página pedida.
- **Sin conexión**: el login no se envía (ni se reanuda solo al volver la red) y se muestra un aviso.
- En los tests, `src/test/setup.ts` vacía la sesión y `localStorage` tras cada test. Para empezar con
  sesión: `useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload()))`.

## PWA

Configurada con [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) en `vite.config.ts`.

- **Instalable**: el manifest (`manifest.webmanifest`) toma `scope` y `start_url` de `base`
  (`/` o `/beyblade-valencia/` en la demo). Nombre, colores e iconos están en la opción `manifest`.
- **Sin conexión**: el service worker precachea el esqueleto de la app (HTML, JS, CSS, iconos),
  que arranca sin red después de la primera visita.
- **La API nunca se cachea**: no hay `runtimeCaching`, y las rutas bajo `VITE_API_BASE_URL` quedan
  fuera del fallback de navegación.
- **Actualizaciones**: con `registerType: 'prompt'`, cuando hay una versión nueva aparece el aviso
  "Hay una nueva versión disponible" (`src/app/pwa/UpdatePrompt.tsx`). La app solo se recarga si
  el usuario pulsa "Actualizar".
- **Desarrollo**: el service worker no se registra en `npm run dev`. Para probarlo:
  `npm run build:demo && npx vite preview --mode demo`.

### Iconos (`public/`)

| Archivo                                               | Uso                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `logo.png`                                            | Logo LVB con fondo transparente, origen del resto                       |
| `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` | Iconos `any` del manifest (logo sobre círculo blanco)                   |
| `maskable-icon-512x512.png`                           | Icono `maskable` (fondo blanco, logo dentro de la zona segura del 80 %) |
| `apple-touch-icon-180x180.png`                        | Icono de iOS                                                            |
| `favicon.ico`                                         | Favicon (16, 32, 48 y 64 px)                                            |

Para cambiar el logo, regenera estos archivos a partir de un `logo.png` cuadrado nuevo, con los mismos
nombres y tamaños; el icono maskable debe dejar el logo dentro de un círculo del 80 % del lado.
Puedes comprobarlo en <https://maskable.app/>.

## Demo en GitHub Pages

El workflow `.github/workflows/deploy-demo.yml` publica en cada push a `master` (o manualmente
desde _Actions → Run workflow_) un build con `--mode demo`:

- `.env.demo` activa los mocks, así que la API se simula en el navegador con datos de Faker.
- `base` es `/beyblade-valencia/`.
- GitHub Pages no tiene fallback para SPA, así que el build de demo copia `index.html` como `404.html`
  (plugin `spaFallback404` en `vite.config.ts`). Así, abrir directamente una URL como
  `/beyblade-valencia/login` carga la app, aunque Pages responda con estado 404. `404.html` no se precachea.

URL: https://charliecobo.github.io/beyblade-valencia/

El workflow publica `dist/` en la rama `gh-pages`. Si la web no aparece, revisa
_Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`_.
Para retirar la demo, borra el workflow, la rama `gh-pages` y desactiva Pages.

## Nuevas features con OpenSpec

El proyecto usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) (spec-driven development) integrado con Claude Code.
Las specs viven en `openspec/specs/`, los cambios en curso en `openspec/changes/` y el contexto del
proyecto (stack, arquitectura, convenciones de mocks y tests) en `openspec/config.yaml`.

Flujo en Claude Code:

1. `/opsx:explore` — (opcional) explorar la idea antes de proponer.
2. `/opsx:propose "descripción de la feature"` — genera `proposal.md`, specs delta, `design.md` y `tasks.md`.
3. Revisar y ajustar la propuesta (`/opsx:update` si hace falta).
4. `/opsx:apply` — implementa las tareas.
5. `/opsx:archive` — archiva el cambio y actualiza las specs principales.

CLI: `npm run openspec -- list`, `npm run openspec -- view`, `npm run openspec -- validate --all`.
Los comandos de Claude invocan `openspec` directamente, así que conviene tenerlo global:
`npm i -g @fission-ai/openspec`.
