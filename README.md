# Beyblade Valencia

PWA con React 19 + Vite + TypeScript, con Vitest y Testing Library para tests, y MSW + Faker para mocks.

## Scripts

| Comando                 | Descripción                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (con la API simulada por defecto) |
| `npm run build`         | Type-check + build de producción                     |
| `npm run build:demo`    | Build de demo con MSW activo (GitHub Pages)          |
| `npm run preview`       | Sirve el build                                       |
| `npm run lint`          | Lint con oxlint                                      |
| `npm run typecheck`     | Sólo comprobación de tipos                           |
| `npm test`              | Vitest en modo watch                                 |
| `npm run test:run`      | Vitest una sola vez (CI)                             |
| `npm run test:coverage` | Tests con cobertura (v8)                             |

## Arquitectura

Organización **por features**: cada dominio vive en su carpeta y expone una API pública mínima.

```
src/
├── app/                 # Composición de la app: App, providers, rutas
│   └── pwa/             # Registro del service worker y aviso de actualización
├── features/
│   └── beyblades/       # Una feature = un dominio
│       ├── api/         # Llamadas HTTP de la feature
│       ├── components/  # Componentes (+ tests colocados *.test.tsx)
│       ├── hooks/       # Lógica de estado / data fetching
│       ├── mocks/       # Factories (Faker) y handlers (MSW) de la feature
│       ├── types/       # Tipos del dominio
│       └── index.ts     # API pública: lo único que importa el resto de la app
├── shared/              # Código reutilizable sin dominio
│   ├── api/             # Cliente HTTP (httpGet, apiUrl, HttpError)
│   └── config/          # Variables de entorno tipadas
├── mocks/               # Ensamblado de MSW
│   ├── handlers.ts      # Agrega los handlers de todas las features
│   ├── transport.ts     # mockTransport: mocks en el navegador (desarrollo y demo)
│   └── server.ts        # setupServer (tests en Node)
├── test/
│   ├── setup.ts         # jest-dom, cleanup y ciclo de vida del server MSW
│   └── test-utils.tsx   # renderWithProviders (+ userEvent) y re-exports de RTL
└── main.tsx
```

### Reglas

- `features/*` puede importar de `shared/`, nunca de otra feature salvo por su `index.ts`.
- `shared/` no importa nada de `features/`.
- Alias `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).
- Los tests van junto al código que prueban (`Foo.tsx` → `Foo.test.tsx`).

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
    como `[mock] GET <url> -> <status>` (nivel *Verbose*/`debug`).
  - El build de producción (`npm run build`) no incluye MSW, Faker ni los handlers.

### Añadir una nueva feature

1. Crea `src/features/<nombre>/` con la estructura anterior.
2. Añade su factory y sus handlers en `mocks/`.
3. Registra los handlers en `src/mocks/handlers.ts`.
4. Exporta lo necesario desde `index.ts`.

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

| Archivo | Uso |
| --- | --- |
| `logo.png` | Logo LVB con fondo transparente, origen del resto |
| `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` | Iconos `any` del manifest (logo sobre círculo blanco) |
| `maskable-icon-512x512.png` | Icono `maskable` (fondo blanco, logo dentro de la zona segura del 80 %) |
| `apple-touch-icon-180x180.png` | Icono de iOS |
| `favicon.ico` | Favicon (16, 32, 48 y 64 px) |

Para cambiar el logo, regenera estos archivos a partir de un `logo.png` cuadrado nuevo, con los mismos
nombres y tamaños; el icono maskable debe dejar el logo dentro de un círculo del 80 % del lado.
Puedes comprobarlo en <https://maskable.app/>.

## Demo en GitHub Pages

El workflow `.github/workflows/deploy-demo.yml` publica en cada push a `master` (o manualmente
desde *Actions → Run workflow*) un build con `--mode demo`:

- `.env.demo` activa los mocks, así que la API se simula en el navegador con datos de Faker.
- `base` es `/beyblade-valencia/`.

URL: https://charliecobo.github.io/beyblade-valencia/

El workflow publica `dist/` en la rama `gh-pages`. Si la web no aparece, revisa
*Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`*.
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
