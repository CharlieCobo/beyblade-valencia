# Tasks

## 1. Preparación

- [ ] 1.1 Archivar `add-login-page` (`openspec archive add-login-page`) y verificar que existen `openspec/specs/auth/spec.md` y `openspec/specs/routing/spec.md`, y que `openspec validate adopt-tailwind-and-formik-zod` pasa
- [ ] 1.2 Capturar con Playwright el estado actual (login, listado de beyblades y aviso de actualización; claro y oscuro; 375 px y 1280 px) en el scratchpad como referencia visual, y verificar que existen las capturas

## 2. Tailwind CSS

- [ ] 2.1 Instalar `tailwindcss` y `@tailwindcss/vite` como dependencias de desarrollo y añadir el plugin en `vite.config.ts`; verificar que `npm run build` termina sin errores
- [ ] 2.2 Reescribir `src/index.css` con `@import "tailwindcss"`, las variables de `:root` (y su versión oscura) y `@theme inline` con los tokens `background`, `foreground`, `card`, `accent` y `danger` (design.md, decisión 2); verificar en `npm run dev` que `bg-card` y `text-accent` aplican el color en claro y en oscuro
- [ ] 2.3 Crear `src/shared/ui/Button.tsx` (variantes `primary` y `secondary`, estado `disabled`) con su test (renderiza el texto, respeta `type`, `disabled` y `onClick`); verificar que el test pasa
- [ ] 2.4 Migrar `AppLayout`, `BeybladeList`, `BeybladeCard` y `UpdatePrompt` (este último con `Button`) a utilidades de Tailwind; verificar que sus tests existentes pasan sin cambios
- [ ] 2.5 Migrar `LoginPage` y el marcado de `LoginForm` (aún sin Formik) a utilidades de Tailwind y `Button`; verificar que los tests de `auth` pasan sin cambios
- [ ] 2.6 Eliminar de `src/index.css` todas las clases antiguas (`.container`, `.card`, `.button`, `.login-*`, `.field`, `.form-error`, `.update-prompt*`…) y verificar con `grep` que ningún componente usa ya esas clases
- [ ] 2.7 Repetir las capturas de 1.2 y compararlas con las de referencia; verificar que no hay diferencias relevantes de color, espaciado ni modo oscuro
- [ ] 2.8 Documentar en `README.md` (nueva sección "Estilos") los tokens del tema, cuándo usar `dark:` y la regla de extraer a `shared/ui` lo repetido

## 3. Formularios con Formik y Zod

- [ ] 3.1 Instalar `formik` y `zod` como dependencias de ejecución; verificar que `npm run typecheck` pasa
- [ ] 3.2 Crear `src/shared/lib/forms/zodValidate.ts` (`toFormikValidate(schema)`) con test: sin errores devuelve `{}`, un error por campo con el primer mensaje, rutas anidadas (`address.city`) y varios errores en el mismo campo; verificar que el test pasa
- [ ] 3.3 Crear `src/shared/ui/TextField.tsx` (etiqueta, input y error; `aria-invalid` y `aria-describedby` solo con error visible, design.md decisión 7) con test que cubre ambos casos y que la descripción accesible incluye el error; verificar que el test pasa
- [ ] 3.4 Crear `src/features/auth/schemas/login.schema.ts` con los mensajes de la spec `auth` y test: vacío, correo inválido, correo con espacios que se recorta, contraseña con espacios que se conserva y datos válidos; verificar que el test pasa
- [ ] 3.5 Migrar `LoginForm` a `useFormik` + `toFormikValidate(loginSchema)` + `TextField`, con `noValidate`, `schema.parse` en `onSubmit` y `isPending` de `useLogin` en el botón; verificar con `npm run typecheck`
- [ ] 3.6 Actualizar `LoginForm.test.tsx`: campos vacíos (mensajes y `aria-invalid`, sin petición, usando el spy de MSW existente), correo inválido, sin errores al abrir, error al salir de un campo sin mostrar los no tocados, el error desaparece al corregir, correo con espacios enviado recortado (comprobar el body de la petición en el handler de MSW), y mantener los casos de éxito, 401, 500, envío pendiente y sin conexión; verificar que pasan. No hay endpoints ni entidades nuevas, así que no hacen falta factories ni handlers nuevos
- [ ] 3.7 Documentar en `README.md` (nueva sección "Formularios") el patrón esquema de Zod + `useFormik` + `TextField`, la carpeta `schemas/` dentro de las features y el uso de `toFormikValidate`; añadir Tailwind, Formik y Zod al stack en `openspec/config.yaml`

## 4. Verificación

- [ ] 4.1 Ejecutar `npm run lint`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores
- [ ] 4.2 Ejecutar `npm run build:demo` y probar en `npm run preview` el login con `test@mail.com` / `Test1234!`, los mensajes por campo y el modo oscuro; verificar que se comportan como describen las specs `forms` y `auth`

## Workflow follow-up

- Archivar el cambio cuando se haya revisado y mergeado el PR.
