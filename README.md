# Beyblade Valencia

React 19 + Vite + TypeScript, con Vitest y Testing Library para tests, y MSW + Faker para mocks.

## Scripts

| Comando                 | Descripción                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (con MSW activado por defecto) |
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
│   ├── browser.ts       # setupWorker (desarrollo)
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
  - En desarrollo se activa con `VITE_API_MOCKING=enabled` (ver `.env.development`). Nunca se incluye en el build de producción.

### Añadir una nueva feature

1. Crea `src/features/<nombre>/` con la estructura anterior.
2. Añade su factory y sus handlers en `mocks/`.
3. Registra los handlers en `src/mocks/handlers.ts`.
4. Exporta lo necesario desde `index.ts`.

## Demo en GitHub Pages

El workflow `.github/workflows/deploy-demo.yml` publica en cada push a `master` (o manualmente
desde *Actions → Run workflow*) un build con `--mode demo`:

- `.env.demo` activa MSW, así que la API se sirve desde el navegador con datos de Faker.
- `base` es `/beyblade-valencia/` y el service worker se registra desde esa ruta.

URL: https://charliecobo.github.io/beyblade-valencia/

Requisito (una sola vez): *Settings → Pages → Build and deployment → Source: GitHub Actions*.
Para retirar la demo, borra el workflow y desactiva Pages.
