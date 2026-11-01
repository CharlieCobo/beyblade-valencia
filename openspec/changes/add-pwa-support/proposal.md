# Proposal

## Why

La aplicación se va a construir como PWA (instalable y con el esqueleto de la app disponible sin conexión). Antes de añadir más pantallas, como el login, conviene tener la base PWA lista. Hoy no es posible tal cual: la demo de GitHub Pages usa el service worker de MSW para simular la API, y un navegador solo admite un service worker por scope, así que el de la PWA y el de MSW se pisarían.

## What Changes

- La aplicación pasa a ser instalable: web app manifest con nombre, colores, iconos, `scope` y `start_url` correctos tanto en la raíz como bajo `/beyblade-valencia/`.
- Se añade un service worker de PWA que precachea el esqueleto de la app (HTML, JS, CSS, iconos) para que arranque sin conexión. Las peticiones a la API nunca se cachean.
- Cuando se despliega una versión nueva, se muestra un aviso con un botón "Actualizar"; la app no se recarga sola.
- **BREAKING (interno)**: la simulación de la API en desarrollo y en la demo deja de usar el service worker de MSW. Pasa a resolver las peticiones del cliente HTTP directamente contra los handlers de MSW, sin interceptar la red. Se eliminan `public/mockServiceWorker.js`, el registro del worker en `main.tsx` y la configuración `msw.workerDirectory`.
- Los tests no cambian: siguen usando `msw/node` con los mismos handlers.

## Capabilities

### New Capabilities

- `pwa`: Instalación de la aplicación, funcionamiento sin conexión del esqueleto de la app y aviso de nuevas versiones.
- `api-mocking`: Simulación de la API del backend en desarrollo y en la demo, a partir de una única definición de mocks compartida con los tests.

### Modified Capabilities

<!-- No hay specs existentes en openspec/specs/. -->

## Impact

- **Dependencias nuevas (dev)**: `vite-plugin-pwa` (compatible con Vite 8), `workbox-window` y `@vite-pwa/assets-generator`.
- **Código**: `vite.config.ts` (plugin PWA y manifest), `src/main.tsx` (sin registro de MSW), `src/shared/api/httpClient.ts` (transporte de mocks), nuevo componente de aviso de actualización en `src/shared/`, `index.html` (metadatos PWA), `public/` (iconos generados; se elimina `mockServiceWorker.js`).
- **Despliegue**: la demo de GitHub Pages pasa a ser una PWA instalable con datos simulados. El workflow no cambia.
- **Desarrollo**: el service worker de la PWA no se activa en `npm run dev`, para que la caché no oculte cambios.
- **Fuera de alcance**: el login, la autenticación y las notificaciones push.
