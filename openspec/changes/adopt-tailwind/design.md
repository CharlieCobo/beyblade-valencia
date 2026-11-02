# Design

## Context

- Estilos: un único `src/index.css` (~135 líneas) con variables CSS (`--bg`, `--fg`, `--card`, `--accent`), modo oscuro por `@media (prefers-color-scheme: dark)` y clases globales usadas por 6 componentes. Ningún test consulta clases: todos buscan por rol, etiqueta o texto.
- `index.html` no fija tema. `vite.config.ts` publica `background_color: '#ffffff'` y `theme_color: '#dd6e2f'` en el manifest.
- No hay formateador. El estilo actual es: comillas simples, sin `;`, comas finales y líneas de hasta ~120 caracteres (24 líneas pasan de 100 y 2 de 120).
- CI (`deploy-demo.yml`) ejecuta `lint`, `test:run` y `build:demo`.
- Versiones: `tailwindcss` y `@tailwindcss/vite` 4.3 (admite Vite 8).
- Motivación: ver proposal.md. Comportamiento del tema: ver `specs/theming`.

## Goals / Non-Goals

**Goals:**
- Que añadir una pantalla no requiera tocar CSS global.
- Tema oscuro fijo hoy, con un selector futuro reducido a cambiar una clase en `<html>`.
- Formato y orden de clases automáticos, sin debates en las revisiones.

**Non-Goals:**
- Selector de tema ni persistencia de la preferencia.
- Tests de regresión visual automáticos.
- Cambiar oxlint por otra herramienta.

## Decisions

### 1. Tailwind v4 con `@tailwindcss/vite` y configuración en CSS
Se añade el plugin a `vite.config.ts` y la configuración vive en `src/index.css` (`@import "tailwindcss"` + `@theme`), sin `tailwind.config.js` ni PostCSS.
- *Alternativa*: Tailwind v3 con PostCSS → configuración en JS y más piezas. Descartada.

### 2. Tokens semánticos sobre variables CSS
Las variables viven en `:root` (tema claro) y en `.dark` (tema oscuro). Tailwind las expone con `@theme inline`:

| Token | Claro (`:root`) | Oscuro (`.dark`) | Uso |
|---|---|---|---|
| `background` | `#ffffff` | `#121212` | fondo de página e inputs |
| `foreground` | `#1a1a1a` | `#f1f1f1` | texto |
| `card` | `#f4f4f5` | `#1f1f22` | tarjetas, login, aviso de actualización |
| `accent` | `#dd6e2f` | `#dd6e2f` | botón primario, badge, foco |
| `danger` | `#c62828` | `#ef5350` | errores |

Los componentes escriben `bg-card text-foreground` y no necesitan `dark:` para los colores base. `dark:` queda para excepciones puntuales. El rojo de error se aclara en oscuro para mantener el contraste.
- *Alternativa*: paleta de Tailwind directa (`bg-zinc-900`) → duplica cada color en cada componente y pierde el color de marca. Descartada.
- Los nombres siguen la convención de shadcn/ui, por si se adopta más adelante.

### 3. `dark:` por clase y `.dark` fijo en `index.html`
- `@custom-variant dark (&:where(.dark, .dark *));` en `src/index.css`.
- `index.html`: `<html lang="es" class="dark" style="color-scheme: dark">` y `<meta name="color-scheme" content="dark">`. Al estar en el HTML estático, el primer pintado ya es oscuro sin esperar a JavaScript (spec `theming`, "Sin destello").
- `.dark { color-scheme: dark; }` en el CSS para que los controles nativos sigan al tema.
- Un selector futuro solo tendrá que poner o quitar `.dark` (y guardar la preferencia).
- *Alternativa*: aplicar la clase desde React → hay un destello claro hasta que se monta la app. Descartada.
- *Alternativa*: hacer oscuros los valores de `:root` → más simple hoy, pero el selector futuro obligaría a redefinir todos los tokens. Descartada.

### 4. Colores de la PWA y del navegador
- Manifest: `background_color: '#121212'` (pantalla de arranque) y `theme_color: '#121212'`.
- `<meta name="theme-color" content="#121212">` en `index.html`.
- El naranja de marca queda para los acentos dentro de la app. Si se prefiere mantener la barra en naranja, solo cambia `theme_color`.

### 5. Reutilización con componentes de React, no con `@apply`
- `Button` en `src/shared/ui/` con variantes `primary` y `secondary`.
- Las clases repetidas se extraen a componentes de `shared/ui` cuando aparecen en dos sitios.
- Sin `clsx` ni `tailwind-merge` por ahora: con dos variantes basta un objeto de clases. Se reconsiderará cuando los componentes acepten `className` externos que choquen.
- *Alternativa*: `.button` con `@apply` → reintroduce CSS global. Descartada.

### 6. Prettier ajustado al estilo actual
- `.prettierrc.json`: `{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 120, "plugins": ["prettier-plugin-tailwindcss"], "tailwindStylesheet": "./src/index.css" }`.
- `.prettierignore`: `dist`, `coverage`, `dev-dist`, `public`, `package-lock.json` y `openspec/changes/archive`.
- Scripts `format` (`prettier --write .`) y `format:check` (`prettier --check .`). CI ejecuta `format:check` después de `lint`.
- El primer `npm run format` va en un commit propio, sin otros cambios, para que la migración se pueda revisar aparte.
- oxlint no formatea, así que no hay conflicto con Prettier.
- *Alternativa*: oxfmt (formateador de Oxc) → encajaría con oxlint, pero el orden de clases de Tailwind depende del plugin de Prettier. Descartada por ahora.

## Risks / Trade-offs

- [Regresiones visuales sin tests visuales] → Capturas de Playwright antes y después, en móvil y escritorio. La comparación del antes se hace con el sistema en oscuro, que es el aspecto que se conserva.
- [Usuarios con preferencia clara] → Es una decisión de producto (proposal.md). El selector futuro lo resolverá sin rehacer tokens.
- [Tailwind v4 requiere navegadores modernos (Safari 16.4+, Chrome 111+, Firefox 128+)] → Aceptable para una PWA nueva; ya se usa `color-mix`.
- [El primer formateo toca muchos archivos] → Commit aislado y sin otros cambios.
- [Clases largas en JSX] → Prettier las ordena; lo repetido se extrae a `shared/ui`.

## Migration Plan

1. Prettier y formateo inicial (commit aislado).
2. Tailwind, tokens, tema oscuro y colores de la PWA.
3. Migración componente a componente, con los tests existentes pasando sin cambios.
4. Limpieza del CSS antiguo y comparación visual.

Rollback: revertir el PR. No hay datos ni APIs afectadas.
