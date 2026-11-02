# Tasks

## 1. Base: Zod y cliente HTTP con contratos

- [x] 1.1 Instalar `zod` como dependencia de ejecución; verificar que `npm run typecheck` pasa
- [x] 1.2 Crear `src/shared/api/ContractError.ts` (`method`, `path`, `direction`, `issues` y mensaje con `z.prettifyError`) con test; verificar que el test pasa
- [x] 1.3 Cambiar `httpGet(path, responseSchema, init?)` y `httpPost(path, body, { request, response }, init?)` para validar el cuerpo antes de enviar y la respuesta tras `response.ok`, con `console.error` en desarrollo (design.md, decisión 3). Ampliar `httpClient.test.ts` con: respuesta válida, campo ausente, tipo incorrecto, JSON ilegible, campo extra descartado y cuerpo inválido sin petición (comprobado con `server.events`); verificar que pasa

## 2. Feature beyblades

- [x] 2.1 Crear `features/beyblades/schemas/beyblade.schema.ts` (`BeybladeTypeSchema`, `BeybladeSchema`, `BeybladeListSchema` y tipos inferidos) con test de casos válidos e inválidos; verificar que pasa
- [x] 2.2 Hacer que `buildBeyblade` devuelva `BeybladeSchema.parse(...)` y usar `BeybladeTypeSchema.options`; ampliar `beyblade.factory.test.ts` para comprobar que la salida cumple el esquema y que un override inválido lanza; verificar que pasa
- [x] 2.3 Pasar `BeybladeListSchema` en `getBeyblades`, actualizar los imports de `useBeyblades`, `BeybladeCard`, `BeybladeList` e `index.ts`, y eliminar `types/beyblade.types.ts`; verificar con `npm run typecheck`
- [x] 2.4 Añadir a `BeybladeList.test.tsx` los escenarios de la spec `api-contracts` (`wins: "diez"`, sin `name` y campo extra `image`) con `server.use(...)`; verificar que pasan

## 3. Feature auth

- [x] 3.1 Crear `features/auth/schemas/auth.schema.ts` (`LoginRequestSchema` estricto, `LoginResponseSchema` con comprobación del token, `TokenPayloadSchema`, `SessionSchema` y `AuthUserSchema`) con test, incluido un token sin payload legible rechazado; verificar que pasa
- [x] 3.2 Sustituir `isTokenPayload` por `TokenPayloadSchema` en `lib/jwt.ts` y en `mocks/jwt.ts`; verificar que `jwt.test.ts` y `mocks/jwt.test.ts` pasan
- [x] 3.3 Pasar los esquemas en `auth.api.ts`; actualizar `useLogin`, `auth.store`, `useUser`, los componentes e `index.ts`, y eliminar `types/auth.types.ts`; verificar con `npm run typecheck`
- [x] 3.4 Hacer que `buildAuthUser` y `buildTokenPayload` devuelvan datos validados por su esquema y que `auth.handlers.ts` lea el cuerpo con `LoginRequestSchema.safeParse` (inválido → 401); ampliar `authUser.factory.test.ts` y `auth.api.test.ts` (cuerpo enviado solo con `email` y `password`); verificar que pasan
- [x] 3.5 Validar la sesión al rehidratar con `merge` en `persist` (design.md, decisión 5) y añadir a `auth.store.test.ts` el escenario "Sesión corrupta en el almacenamiento" (`exp: "mañana"` → sesión vacía); verificar que pasa
- [x] 3.6 Añadir a `LoginForm.test.tsx` el escenario "Token sin payload legible" (200 con `accessToken: "no-es-un-jwt"` → mensaje genérico y sin sesión); verificar que pasa

## 4. Configuración

- [x] 4.1 Reescribir `src/shared/config/env.ts` con `parseEnv(raw)` sobre las claves `VITE_*` y `z.strictObject` con valores por defecto (design.md, decisión 6), exportando `apiBaseUrl` y `apiMocking`; crear `env.test.ts` con valores válidos, omitidos, `VITE_API_MOCKING=yes` y `VITE_API_BASEURL`; verificar que pasa y que `main.tsx` sigue comparando `import.meta.env.VITE_API_MOCKING` literalmente
- [x] 4.2 Ejecutar `npm run build` y comprobar con `grep` en `dist/assets` que MSW y Faker no están en el bundle de producción; verificar que no aparecen

## 5. Documentación

- [x] 5.1 Actualizar `README.md` (estructura de features con `schemas/` en lugar de `types/`, y nueva sección "Contratos" con la tabla de rigor por dirección del dato, `ContractError` y las factories validadas) y `openspec/config.yaml` (estructura de features, stack con Zod y uso de esquemas en `httpGet`/`httpPost`); verificar que no quedan referencias a `types/` con `grep`

## 6. Verificación

- [x] 6.1 Ejecutar `npm run lint`, `npm run format:check`, `npm run typecheck` y `npm run test:run` y verificar que terminan sin errores
- [x] 6.2 Ejecutar `npm run dev` con `VITE_API_MOCKING=yes` y verificar que la app no arranca y el error nombra la variable; después, con la configuración normal, verificar que el login y el listado funcionan

## Workflow follow-up

- Archivar el cambio cuando se haya revisado y mergeado el PR.
