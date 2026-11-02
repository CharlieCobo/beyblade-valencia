# Proposal

## Why

Los estilos viven en un único `src/index.css` con clases BEM globales (`.login-card`, `.update-prompt__actions`…) que crecerá con cada página nueva (header, menú lateral, perfil, inscripciones) y es fácil de romper sin darse cuenta. Los formularios, por su parte, dependen de la validación nativa del navegador: los mensajes no se pueden personalizar ni traducir de forma consistente, no se muestran junto al campo y el estado (valores, tocado, errores, envío) se gestiona a mano. Antes de añadir más pantallas con formularios conviene fijar ambas bases.

## What Changes

- **Tailwind CSS v4** como sistema de estilos, integrado en Vite. Los colores actuales (`bg`, `fg`, `card`, `accent` y el rojo de error) pasan a ser tokens del tema, con el mismo modo oscuro según `prefers-color-scheme`.
- Migración de todos los componentes existentes (`AppLayout`, `UpdatePrompt`, `LoginPage`, `LoginForm`, `BeybladeList`, `BeybladeCard`) a clases de utilidad. `src/index.css` queda reducido a la importación de Tailwind, el tema y los estilos base. El aspecto visual se mantiene.
- Componentes de UI compartidos en `src/shared/ui/` para lo que se repite: botón (primario y secundario) y campo de texto con etiqueta y mensaje de error.
- **Formik (`useFormik`) + Zod** para los formularios: el estado (valores, campos tocados, errores, envío) lo gestiona Formik y las reglas de validación se escriben como esquemas de Zod, de los que también se infieren los tipos de los valores.
- Adaptador propio Zod → Formik en `src/shared/` (sin `zod-formik-adapter`).
- `LoginForm` migra a `useFormik` con un esquema de Zod: los errores de validación se muestran bajo cada campo con mensajes en español, en lugar de los avisos nativos del navegador.
- **BREAKING (comportamiento)**: el formulario de login deja de usar la validación nativa (`noValidate`); el usuario ve mensajes propios por campo.

## Capabilities

### New Capabilities

- `forms`: Comportamiento común de los formularios de la aplicación: cuándo se valida, cómo y cuándo se muestran los errores por campo, accesibilidad de esos errores y bloqueo del envío mientras haya errores.

### Modified Capabilities

- `auth`: el requisito "Formulario de inicio de sesión" cambia: la validación deja de ser la nativa del navegador y pasa a mostrar mensajes propios por campo ("Introduce tu correo", "Introduce un correo válido", "Introduce tu contraseña").

<!-- La adopción de Tailwind no cambia comportamiento observable (solo implementación y aspecto, que se conserva), así que no genera specs. -->

## Impact

- **Dependencias nuevas**:
  - Ejecución: `formik`, `zod`.
  - Desarrollo: `tailwindcss`, `@tailwindcss/vite`.
- **Código**:
  - `vite.config.ts` (plugin de Tailwind) y `src/index.css`.
  - Nuevo `src/shared/ui/` (`Button`, `TextField`) y `src/shared/lib/forms/` (adaptador Zod → Formik).
  - `src/features/auth/` (`LoginForm`, `LoginPage` y nuevo `schemas/login.schema.ts`).
  - `src/app/layout/AppLayout.tsx`, `src/app/pwa/UpdatePrompt.tsx`, `src/features/beyblades/components/*`.
  - `README.md`: secciones de estilos y formularios.
- **Tests**: los de `LoginForm` que comprobaban la validación nativa (`toBeInvalid`) pasan a comprobar los mensajes por campo. Los demás tests consultan por rol y texto, no por clase, y no deberían cambiar.
- **Requisito previo**: el cambio `add-login-page` (ya mergeado) debe archivarse antes para que exista la spec principal `auth` sobre la que aplica la modificación.
- **Fuera de alcance**:
  - Nuevos formularios o pantallas.
  - Rediseño visual o librería de componentes (shadcn, Headless UI…).
  - Selector manual de tema claro/oscuro.
  - Validación de respuestas de la API con Zod.
