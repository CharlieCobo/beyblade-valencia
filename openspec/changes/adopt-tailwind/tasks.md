# Tasks

## 1. Prettier

- [x] 1.1 Instalar `prettier` y `prettier-plugin-tailwindcss` como dependencias de desarrollo, crear `.prettierrc.json` y `.prettierignore` (design.md, decisión 6) y añadir los scripts `format` y `format:check`; verificar que `npm run format:check` se ejecuta y lista los archivos a formatear
- [x] 1.2 Ejecutar `npm run format` y hacer un commit solo con ese formateo; verificar que `npm run format:check`, `npm run lint` y `npm run test:run` pasan
- [x] 1.3 Añadir `npm run format:check` al workflow `deploy-demo.yml` después de `lint` y documentar en `README.md` (sección "Formato") los scripts y la ordenación de clases; verificar que el YAML del workflow es válido

## 2. Tailwind y tema oscuro

- [x] 2.1 Capturar con Playwright, con `colorScheme: 'dark'`, el login, el listado de beyblades y el aviso de actualización a 375 px y 1280 px en el scratchpad como referencia; verificar que existen las capturas
- [x] 2.2 Instalar `tailwindcss` y `@tailwindcss/vite` como dependencias de desarrollo y añadir el plugin en `vite.config.ts`; verificar que `npm run build` termina sin errores
- [x] 2.3 Reescribir la cabecera de `src/index.css` con `@import "tailwindcss"`, `@custom-variant dark`, las variables de `:root` y `.dark`, y `@theme inline` con los tokens (design.md, decisiones 2 y 3); verificar en `npm run dev` que `bg-card` y `text-accent` aplican los colores oscuros
- [x] 2.4 Añadir a `index.html` `class="dark"`, `style="color-scheme: dark"`, `<meta name="color-scheme" content="dark">` y `theme-color` `#121212`, y cambiar `background_color` y `theme_color` del manifest en `vite.config.ts`; verificar con Playwright, con `colorScheme: 'light'` y JavaScript desactivado, que el fondo de `body` es `#121212`, y en `dist/manifest.webmanifest` tras `npm run build` que los colores son `#121212`
- [x] 2.5 Añadir un test que compruebe que `index.html` declara la clase `dark` en `<html>` y el `color-scheme` oscuro; verificar que pasa

## 3. Migración de componentes

- [ ] 3.1 Crear `src/shared/ui/Button.tsx` (variantes `primary` y `secondary`, estado `disabled`) con su test (texto, `type`, `disabled` y `onClick`); verificar que el test pasa
- [x] 3.2 Migrar `AppLayout`, `BeybladeList`, `BeybladeCard` y `UpdatePrompt` (este último con `Button`) a utilidades de Tailwind; verificar que sus tests pasan sin cambios
- [x] 3.3 Migrar `LoginPage` y `LoginForm` a utilidades de Tailwind y `Button`, sin cambiar su lógica; verificar que los tests de `auth` pasan sin cambios
- [x] 3.4 Eliminar de `src/index.css` las clases antiguas (`.container`, `.grid`, `.card`, `.badge`, `.button*`, `.login-*`, `.field`, `.form-error`, `.update-prompt*`) y la media query de `prefers-color-scheme`; verificar con `grep` que ningún componente usa ya esas clases
- [x] 3.5 Repetir las capturas de 2.1, ahora también con `colorScheme: 'light'`, y compararlas con las de referencia; verificar que el aspecto oscuro se conserva y que con el sistema en claro la app también se ve oscura
- [x] 3.6 Documentar en `README.md` (sección "Estilos") los tokens, el tema oscuro por defecto, cómo funciona `dark:` por clase y la regla de extraer a `shared/ui` lo repetido, y añadir Tailwind y Prettier al stack en `openspec/config.yaml`; verificar que el README describe los nombres reales de los tokens

## 4. Verificación

- [x] 4.1 Ejecutar `npm run lint`, `npm run format:check`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores
- [x] 4.2 Ejecutar `npm run build:demo` y revisar en `npm run preview` las tres pantallas con el sistema en claro y en oscuro; verificar que se cumple la spec `theming`

## Workflow follow-up

- Archivar el cambio cuando se haya revisado y mergeado el PR.
