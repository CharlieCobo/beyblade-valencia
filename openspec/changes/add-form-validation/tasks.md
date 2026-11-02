# Tasks

## 1. Preparación

- [ ] 1.1 Comprobar que `adopt-tailwind` y `add-typed-contracts` están aplicados (existen `src/shared/ui/Button.tsx`, `LoginRequestSchema` y el script `format:check`); verificar con `openspec list` y `ls`
- [ ] 1.2 Instalar `react-hook-form` y `@hookform/resolvers` como dependencias de ejecución; verificar que `npm run typecheck` pasa

## 2. Piezas compartidas

- [ ] 2.1 Crear `src/shared/ui/TextField.tsx` (etiqueta, input con `ref` como prop, error en color `danger`, `aria-invalid` y `aria-describedby` solo con error, design.md decisión 3) con test: sin error no hay `aria-invalid`; con error, la descripción accesible incluye el texto; y la `ref` llega al input; verificar que pasa

## 3. Login

- [ ] 3.1 Crear `features/auth/schemas/loginForm.schema.ts` con los mensajes de la spec `auth` y test: vacío, correo inválido, correo con espacios recortado, contraseña con espacios conservada, datos válidos y test de tipos de que la salida coincide con `LoginRequest`; verificar que pasa
- [ ] 3.2 Migrar `LoginForm` a `useForm` (`zodResolver`, `mode: 'onTouched'`) + `TextField` + `noValidate`, registrando los campos en orden visual y con `isPending` de `useLogin` en el botón; verificar con `npm run typecheck`
- [ ] 3.3 Actualizar `LoginForm.test.tsx` con los escenarios de las specs `forms` y `auth`:
  - Campos vacíos: mensajes, `aria-invalid`, foco en el correo y sin petición (spy de MSW existente).
  - Correo inválido.
  - Sin errores al abrir y ningún error mientras se escribe por primera vez.
  - Error al salir del campo, sin mostrar los de los campos no tocados.
  - El error desaparece al corregir.
  - Correo con espacios enviado recortado (comprobar el cuerpo en el handler).

  Mantener los casos de éxito, 401, 500, envío pendiente, sin conexión y token inválido. Verificar que pasan. No hay endpoints ni entidades nuevas, así que no hacen falta factories ni handlers nuevos.

## 4. Documentación

- [ ] 4.1 Documentar en `README.md` (sección "Formularios") el patrón esquema de formulario + `useForm` + `zodResolver` + `TextField`, el modo `onTouched`, el orden de registro y la separación entre el esquema de formulario y el contrato; añadir React Hook Form al stack en `openspec/config.yaml`; verificar que el ejemplo del README coincide con `LoginForm`

## 5. Verificación

- [ ] 5.1 Ejecutar `npm run lint`, `npm run format:check`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores
- [ ] 5.2 Ejecutar `npm run build:demo` y probar en `npm run preview` el login con `test@mail.com` / `Test1234!`, los mensajes por campo, el foco al enviar vacío y la navegación con teclado; verificar que se cumplen las specs `forms` y `auth`

## Workflow follow-up

- Archivar el cambio cuando se haya revisado y mergeado el PR.
