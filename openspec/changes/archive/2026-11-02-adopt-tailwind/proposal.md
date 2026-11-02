# Proposal

## Why

Los estilos viven en un único `src/index.css` con clases BEM globales (`.login-card`, `.update-prompt__actions`…) que crecerá con cada página nueva (header, menú lateral, perfil, inscripciones) y es fácil de romper sin darse cuenta. Además, la identidad visual de la liga encaja mejor con un tema oscuro, y hoy la app cambia de aspecto según la preferencia del sistema. Antes de añadir más pantallas conviene fijar el sistema de estilos, el tema y el formato del código.

## What Changes

- **Tailwind CSS v4** como sistema de estilos, integrado en Vite. Los colores pasan a ser tokens del tema: `background`, `foreground`, `card`, `accent` y `danger`.
- **Tema oscuro por defecto**, independiente de la preferencia del sistema. La variante `dark:` funciona por clase (`.dark` en `<html>`), de modo que un selector de tema futuro solo tenga que cambiar esa clase. Los valores del tema claro quedan definidos, pero no se usan todavía.
- La pantalla de arranque de la PWA y el color de la barra del navegador pasan a ser oscuros para que no haya un destello claro al abrir la app.
- Migración de todos los componentes (`AppLayout`, `UpdatePrompt`, `LoginPage`, `LoginForm`, `BeybladeList`, `BeybladeCard`) a utilidades de Tailwind. `src/index.css` queda reducido a la importación de Tailwind, los tokens y los estilos base.
- `Button` compartido en `src/shared/ui/` (variantes `primary` y `secondary`).
- **Prettier** con `prettier-plugin-tailwindcss` para formatear el código y ordenar las clases. Scripts `format` y `format:check`, y comprobación en CI.
- **BREAKING (visual)**: quien use el sistema en modo claro verá ahora la app en oscuro.

## Capabilities

### New Capabilities

- `theming`: Tema visual de la aplicación: cuál se aplica por defecto y cómo se evita mostrar un tema distinto mientras carga.

### Modified Capabilities

<!-- Ninguna. La spec `pwa` exige que el manifest tenga `background_color` y `theme_color`, pero no su valor. -->

## Impact

- **Dependencias nuevas (desarrollo)**: `tailwindcss`, `@tailwindcss/vite`, `prettier`, `prettier-plugin-tailwindcss`.
- **Código**:
  - `vite.config.ts` (plugin de Tailwind y colores del manifest) e `index.html` (clase `dark`, `color-scheme` y `theme-color`).
  - `src/index.css`, nuevo `src/shared/ui/Button.tsx` y los 6 componentes con estilos.
  - `package.json` (scripts), `.prettierrc.json`, `.prettierignore` y `.github/workflows/deploy-demo.yml` (`format:check`).
  - `README.md`: secciones "Estilos" y "Formato".
- **Tests**: ninguno consulta clases, así que no deberían cambiar. Se añade el de `Button`.
- **Siguientes cambios**: `add-typed-contracts` y `add-form-validation` se apoyan en este (Prettier, tokens y `shared/ui`).
- **Fuera de alcance**:
  - Selector de tema en la interfaz.
  - Rediseño visual o librería de componentes.
  - Formularios y validación (van en `add-form-validation`).
