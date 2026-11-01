# Design

## Context

- La simulación de la API en el navegador usa hoy `setupWorker` de MSW: `src/main.tsx` registra `public/mockServiceWorker.js` cuando `VITE_API_MOCKING=enabled` (desarrollo y build `--mode demo`).
- La demo de GitHub Pages se sirve bajo `/beyblade-valencia/` (`base` en `vite.config.ts` según el modo) y se publica en la rama `gh-pages`.
- Todas las llamadas a la API pasan por `src/shared/api/httpClient.ts` (`httpGet` + `apiUrl`, que devuelve URLs absolutas).
- Los tests usan `setupServer` de `msw/node` con `src/mocks/handlers.ts`, que reúne los handlers de cada feature.
- Un navegador admite un único service worker por scope, de ahí el conflicto descrito en proposal.md.

## Goals / Non-Goals

**Goals:**
- Un único service worker en el navegador (el de la PWA) en todos los entornos.
- Mantener una sola definición de handlers para desarrollo, demo y tests.
- Que el build de producción sin mocks no incluya MSW, Faker ni los handlers.

**Non-Goals:**
- Caché de datos de la API o sincronización offline (background sync).
- Notificaciones push.
- Vectorizar el logo: los iconos salen del raster del logo LVB. Si más adelante hay un SVG oficial, se regeneran sin tocar código.
- Tests end-to-end permanentes en CI: la verificación de instalación y modo offline se hace con un script puntual de Playwright.

## Decisions

### 1. Mocks resueltos en el cliente HTTP con `getResponse` de MSW

`httpClient` deja de llamar directamente al `fetch` global y usa un transporte configurable, por defecto `fetch`. Con los mocks activos, `main.tsx` importa de forma dinámica `src/mocks/transport.ts` y lo registra como transporte. Ese transporte construye un `Request`, lo resuelve con `getResponse(handlers, request)` y, si ningún handler coincide, hace `fetch(request)` a la red.

```
main.tsx --(VITE_API_MOCKING === 'enabled')--> import('@/mocks/transport')
                                                  |
                                                  v
httpClient.setTransport(mockTransport)
   httpGet/httpPost --> transport(request)
                          |-- getResponse(handlers, request) --> Response simulada
                          '-- sin coincidencia --> fetch(request)
```

- `src/shared/` no importa nada de `src/mocks/`; es la app quien inyecta el transporte. Se respeta así la regla de dependencias.
- La condición `import.meta.env.VITE_API_MOCKING === 'enabled'` se evalúa en tiempo de build, y Vite elimina el import dinámico del bundle de producción, como ocurre hoy.
- En los tests no se configura transporte: el `fetch` global lo intercepta `msw/node` y los tests no cambian.

**Alternativas descartadas:**
- *MSW con service worker* (lo actual): choca con el service worker de la PWA.
- *MSW con interceptor dentro de la página* (`defineNetwork` + `InterceptorSource`): funcionaría, pero es una API `experimental` de MSW 3.
- *Adaptadores en memoria por feature*: duplican los mocks respecto a los tests y no ejercitan la capa HTTP.
- *Backend falso aparte*: GitHub Pages es estático y habría que alojarlo en otro sitio.

### 2. `vite-plugin-pwa` con `generateSW`

Workbox genera el service worker a partir de la lista de recursos del build. No hace falta un service worker propio porque no hay lógica personalizada (ni push ni sincronización).

- `registerType: 'prompt'` y `injectRegister: false`: el registro lo hace la app con `useRegisterSW` de `virtual:pwa-register/react`, que expone `needRefresh` y `updateServiceWorker`.
- `workbox.navigateFallback: 'index.html'` con `navigateFallbackDenylist` para la ruta base de la API.
- Sin `runtimeCaching`: las peticiones que no están precacheadas, incluida la API, van a la red. Esto cumple el requisito de no cachear la API sin reglas adicionales.
- `devOptions.enabled: false`: no hay service worker en `npm run dev`.
- El `scope` y la `start_url` del manifest no se fijan a mano: el plugin los toma de `base`, que ya cambia según el modo (`/` o `/beyblade-valencia/`).

**Alternativa:** `injectManifest` con un service worker propio. Se descarta mientras no haga falta lógica a medida.

### 3. Iconos generados a partir del logo LVB y guardados en `public/`

Los iconos se han generado a partir del logo del club (`public/logo.png`, logo recortado con fondo transparente) y se guardan en el repositorio:

| Archivo | Uso |
|---|---|
| `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` | Iconos `any` del manifest: logo sobre círculo blanco, esquinas transparentes |
| `maskable-icon-512x512.png` | Icono `maskable`: fondo blanco a sangre, logo dentro de la zona segura (radio máximo 0.38 frente al límite de 0.4) |
| `apple-touch-icon-180x180.png` | iOS: fondo blanco opaco |
| `favicon.ico` | 16, 32, 48 y 64 px |

El manifest referencia estos archivos directamente.

**Alternativa descartada:** `@vite-pwa/assets-generator` en build. El logo original es un raster con artefactos JPEG y la zona segura del icono maskable necesita un ajuste manual. Generar los iconos una vez y revisarlos a ojo da más control y quita una dependencia.

### 4. Aviso de actualización en `src/app/pwa/`

El registro del service worker es un asunto de toda la aplicación, no de una feature ni código compartido genérico:

- `usePwaUpdate.ts`: envuelve `useRegisterSW` y expone `{ needRefresh, update, dismiss }`.
- `UpdatePrompt.tsx`: componente de presentación que recibe esas props y muestra el aviso con "Actualizar" y "Cerrar" (`role="status"`, accesible).
- `App.tsx` monta el aviso.

Al separar la presentación del hook, el componente se testea sin service worker, y el hook se prueba con `vi.mock('virtual:pwa-register/react')`.

### 5. Metadatos en `index.html`

`theme-color`, `description` y `apple-touch-icon`. El enlace al manifest lo inyecta el plugin.

## Risks / Trade-offs

- [Los visitantes de la demo ya tienen registrado `mockServiceWorker.js` en `/beyblade-valencia/`] → El service worker de la PWA se registra en el mismo scope y lo sustituye. Se verifica abriendo la demo con el service worker antiguo instalado (tarea 5.2).
- [Las peticiones simuladas ya no aparecen en la pestaña Network de DevTools] → En desarrollo, el transporte de mocks escribe en `console.debug` el método, la URL y el estado de cada petición resuelta.
- [Los usuarios pueden quedarse con una versión vieja si nunca pulsan "Actualizar"] → Es lo que se ha decidido a cambio de no perder formularios. El aviso se vuelve a mostrar en cada carga mientras haya una versión pendiente.
- [Compatibilidad de los tipos de `vite-plugin-pwa` con TypeScript 7] → Se comprueba con `npm run typecheck` en la tarea de instalación. Si falla, se declara el módulo virtual a mano en `vite-env.d.ts`.
- [`getResponse` no aplica todas las semánticas de red (cookies, CORS)] → Es aceptable para una API simulada. El backend real se probará contra la red.

## Migration Plan

1. Desplegar con el workflow actual (push a `master` → rama `gh-pages`).
2. Rollback: revertir el commit. El workflow vuelve a publicar la versión anterior y el service worker de MSW reaparece en el mismo scope.

## Open Questions

- Nombre corto y colores definitivos del manifest. Por ahora: "Beyblade Valencia" / "LVB", `theme_color` `#dd6e2f` (naranja del logo) y fondo `#ffffff` (el mismo que los iconos). Cambiarlos solo toca la configuración.
