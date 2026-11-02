# Proposal

## Why

Los tipos de datos están escritos a mano (`auth.types.ts`, `beyblade.types.ts`) y nada comprueba que lo que llega de fuera los cumpla. `httpGet<T>` hace un `as T` sobre la respuesta, la sesión guardada en `localStorage` se da por buena y las variables de entorno se leen sin validar. Hoy no falla porque los mocks y el código se escriben a la vez, pero cuando llegue el backend real, un campo renombrado o un `null` inesperado romperá la interfaz lejos de donde se originó. Queremos que Zod sea el contrato: una sola definición de la que salen los tipos y que se comprueba en cada frontera.

## What Changes

- **Esquemas de Zod como fuente única de verdad** en `features/<feature>/schemas/`. Los tipos se infieren con `z.infer`/`z.input`/`z.output` y la carpeta `types/` desaparece.
- **El cliente HTTP valida en la frontera**:
  - `httpGet` y `httpPost` reciben el esquema de la respuesta y devuelven datos ya validados.
  - `httpPost` también valida el cuerpo antes de enviarlo.
  - Si algo no cumple el contrato, se lanza un `ContractError`, distinto de `HttpError`, que la interfaz trata como un error inesperado.
- **Reglas de rigor**:
  - Respuestas de la API: se toleran campos adicionales, que se descartan.
  - Lo que enviamos y la configuración: no se aceptan campos de más.
- **Configuración validada al arrancar**: `env.ts` valida las variables `VITE_*`. Un valor inválido o una variable desconocida (por ejemplo, una errata) impide arrancar con un error que nombra la variable.
- **Sesión guardada validada**: si lo guardado en `localStorage` no cumple el contrato, se descarta y el usuario queda sin sesión.
- **Token validado como parte del contrato del login**: un `accessToken` sin el payload esperado se trata como respuesta inválida.
- **Mocks atados al contrato**: las factories devuelven datos validados por el esquema y los handlers de MSW leen los cuerpos con el esquema de la petición.

## Capabilities

### New Capabilities

- `api-contracts`: Comprobación de que los datos intercambiados con la API y la configuración de la aplicación cumplen un contrato, y comportamiento de la aplicación cuando no lo cumplen.

### Modified Capabilities

- `auth`: se añaden dos requisitos: una sesión guardada inválida se descarta, y un login cuya respuesta no trae un token con el payload esperado no inicia sesión.

## Impact

- **Dependencias nuevas (ejecución)**: `zod`.
- **Código**:
  - `src/shared/api/httpClient.ts` (firmas de `httpGet`/`httpPost`) y nuevo `src/shared/api/ContractError.ts`.
  - `src/shared/config/env.ts`.
  - `src/features/auth/`: `schemas/`, `api`, `lib/jwt`, `store`, `hooks`, `mocks` y la eliminación de `types/`.
  - `src/features/beyblades/`: `schemas/`, `api`, `hooks`, `components`, `mocks` y la eliminación de `types/`.
  - `README.md` y `openspec/config.yaml` (la carpeta `schemas/` sustituye a `types/` en la estructura de features).
- **API pública de las features**: `index.ts` exporta los mismos tipos, ahora inferidos. Quien los importe no nota el cambio.
- **Tests**:
  - Nuevos tests de contrato por endpoint.
  - Las factories se comprueban contra su esquema.
  - Los tests existentes deberían pasar sin cambios.
- **Depende de** `adopt-tailwind` (Prettier). `add-form-validation` reutilizará los esquemas de auth.
- **Fuera de alcance**:
  - Tipos de marca (`Email`, `UserId`).
  - Generar esquemas desde OpenAPI.
  - Migrar `useBeyblades` a `useQuery`.
  - Validación de formularios (va en `add-form-validation`).
