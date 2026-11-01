# Tasks

## 1. Mocks sin service worker

- [x] 1.1 Añadir a `src/shared/api/httpClient.ts` un transporte configurable (`setHttpTransport`, por defecto el `fetch` global) que reciba un `Request`, y hacer que `httpGet` lo use; verificar con un test que un transporte inyectado recibe la petición con la URL absoluta y las cabeceras, y que los tests existentes siguen pasando
- [x] 1.2 Crear `src/mocks/transport.ts` (`mockTransport`) que resuelva con `getResponse(handlers, request)`, haga `fetch` a la red si no hay coincidencia y escriba en `console.debug` en desarrollo; verificar con `src/mocks/transport.test.ts` que `GET /api/beyblades` devuelve 6 beyblades del handler existente y que una ruta sin handler llama al `fetch` de red
- [x] 1.3 En `src/main.tsx`, sustituir `setupWorker`/`worker.start` por el import dinámico de `@/mocks/transport` y `setHttpTransport(mockTransport)` bajo `import.meta.env.VITE_API_MOCKING === 'enabled'`; verificar que `npm run build` no genera ningún chunk con MSW/Faker y que `npm run build:demo` sí
- [x] 1.4 Eliminar `src/mocks/browser.ts`, `public/mockServiceWorker.js` y la clave `msw.workerDirectory` de `package.json`; verificar con `npm run dev` + Playwright que se ven las 6 tarjetas y que `navigator.serviceWorker.getRegistrations()` devuelve una lista vacía
- [x] 1.5 Actualizar la sección "Mocks" del README (cómo funciona el transporte, que los tests siguen con `msw/node`, cómo ver las peticiones simuladas en consola); verificar que los comandos y rutas citados existen

## 2. Configuración PWA

- [x] 2.0 Generar los iconos a partir del logo LVB (`public/logo.png`, `pwa-64/192/512`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`) y sustituir el favicon de Vite en `index.html`; verificado con revisión visual sobre fondo claro y oscuro, zona segura del maskable (radio 0.38 < 0.4) y `dist/index.html` del build de demo con rutas `/beyblade-valencia/...`
- [x] 2.1 Instalar `vite-plugin-pwa` y `workbox-window` como dependencias de desarrollo; verificar con `npm ls vite-plugin-pwa` sin errores de peer dependencies
- [x] 2.2 Configurar `VitePWA` en `vite.config.ts`: `registerType: 'prompt'`, `injectRegister: false`, manifest (nombre, nombre corto, colores, `display: standalone`, iconos de `public/` con `purpose` `any` y `maskable`), `includeAssets` para favicon y apple-touch-icon, `workbox.navigateFallback` con denylist para la API, sin `runtimeCaching`, `devOptions.enabled: false`; verificar que `npm run build:demo` genera `manifest.webmanifest` y `sw.js` en `dist/`, que el manifest tiene `scope` y `start_url` igual a `/beyblade-valencia/` y que los iconos están precacheados
- [x] 2.3 Verificar que `npm run build` (sin modo demo) genera un manifest con `scope` y `start_url` igual a `/`
- [x] 2.4 Añadir la referencia de tipos `vite-plugin-pwa/react` en `src/vite-env.d.ts` (o declarar el módulo virtual a mano si los tipos no encajan con TypeScript 7); verificar con `npm run typecheck`
- [x] 2.5 Añadir a `index.html` `theme-color` y `description` (el `apple-touch-icon` ya está); verificar que aparecen en `dist/index.html` tras el build

## 3. Aviso de actualización

- [x] 3.1 Crear `src/app/pwa/UpdatePrompt.tsx` (props `needRefresh`, `onUpdate`, `onDismiss`; `role="status"`, botones "Actualizar" y "Cerrar") con estilos en `index.css`; verificar con `UpdatePrompt.test.tsx` que no se muestra sin `needRefresh`, que se muestra el texto "Hay una nueva versión disponible" y que cada botón llama a su callback
- [x] 3.2 Crear `src/app/pwa/usePwaUpdate.ts` sobre `useRegisterSW` de `virtual:pwa-register/react` (`update` llama a `updateServiceWorker(true)`, `dismiss` pone `needRefresh` a false); verificar con `usePwaUpdate.test.ts` usando `vi.mock('virtual:pwa-register/react')`
- [x] 3.3 Montar el aviso en `src/app/App.tsx`; verificar que `App.test.tsx` sigue pasando con el módulo virtual mockeado y que, sin versión pendiente, no se muestra ningún aviso
- [x] 3.4 Documentar en el README la sección PWA (instalación, caché del esqueleto, la API nunca se cachea, aviso de actualización, qué icono es cada archivo de `public/` y cómo regenerarlos desde `public/logo.png`); verificar que las rutas citadas existen

## 4. Comprobación en el navegador

- [x] 4.1 Con `npm run build:demo` + `vite preview --mode demo` y Playwright: verificar que hay un único service worker registrado (el de la PWA), que se ven las 6 tarjetas simuladas, que el manifest es válido y que, tras `context.setOffline(true)`, la recarga muestra el título "Beyblade Valencia"
- [x] 4.2 Con Playwright, verificar que con el service worker activo una petición a `/api/beyblades` no aparece en `caches` (Cache Storage)
- [x] 4.3 Simular una nueva versión (segundo build con un cambio, recarga sin cerrar la pestaña) y verificar que aparece el aviso y que "Actualizar" carga la nueva versión

## 5. Integración y despliegue

- [x] 5.1 Ejecutar `npm run lint`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores
- [ ] 5.2 Tras el despliegue en GitHub Pages, verificar con la consola del navegador o Playwright (si la red lo permite) que la demo registra `sw.js` en `/beyblade-valencia/`, que sustituye al antiguo `mockServiceWorker.js` y que la app se puede instalar

## Workflow follow-up

- Archivar el cambio con `/opsx:archive` cuando esté revisado y desplegado.
- Siguiente cambio previsto: página de login (`test@mail.com` / `Test1234!`, token tipo JWT) usando el transporte de mocks.
