# Design

## Context

- `httpClient.request<T>` hace `(await response.json()) as T`. `httpGet<T>` y `httpPost<TBody, TResponse>` no comprueban nada.
- Tipos a mano en `features/auth/types/auth.types.ts` (`LoginCredentials`, `LoginResponse`, `TokenPayload`, `Session`, `AuthUser`) y en `features/beyblades/types/beyblade.types.ts` (`BEYBLADE_TYPES`, `Beyblade`).
- `lib/jwt.ts` valida el payload con un type guard escrito a mano (`isTokenPayload`).
- `auth.store.ts` usa `persist` de Zustand y rehidrata desde `localStorage` sin validar.
- `useLogin` llama a `setSession(accessToken)` en `onSuccess`. Si el token no se puede decodificar, el error surge ahí en vez de en la frontera.
- `env.ts` solo lee `VITE_API_BASE_URL`. `main.tsx` compara `import.meta.env.VITE_API_MOCKING` directamente para que Vite elimine MSW y Faker del bundle de producción. Existen `.env.development`, `.env.demo` y `.env.example`.
- Las vistas ya distinguen un error genérico del 401 (`LoginForm.errorMessage`) y muestran un mensaje de error en el listado.
- Motivación: ver proposal.md. Comportamiento: ver `specs/api-contracts` y `specs/auth`.

## Goals / Non-Goals

**Goals:**
- Una definición por entidad: el esquema. Los tipos se derivan de él.
- Ningún dato externo (API, `localStorage`, configuración) entra en la app sin pasar por un esquema.
- Que los mocks no puedan desviarse del contrato.

**Non-Goals:**
- Tipos de marca (`Email`, `UserId`).
- Generar esquemas desde OpenAPI o compartirlos con un backend.
- Reintentos o recuperación ante respuestas inválidas.

## Decisions

### 1. Esquemas por feature en `schemas/`, tipos inferidos y adiós a `types/`
- `features/auth/schemas/auth.schema.ts`: `LoginRequestSchema`, `LoginResponseSchema`, `TokenPayloadSchema`, `SessionSchema` y `AuthUserSchema` (este solo para mocks).
- `features/beyblades/schemas/beyblade.schema.ts`: `BeybladeTypeSchema = z.enum([...])`, `BeybladeSchema` y `BeybladeListSchema`.
- Junto a cada esquema: `export type Beyblade = z.infer<typeof BeybladeSchema>`. Si la entrada y la salida difieren (transformaciones), se exportan ambas con `z.input` y `z.output`.
- `BEYBLADE_TYPES` pasa a ser `BeybladeTypeSchema.options`.
- `index.ts` de cada feature reexporta los mismos tipos, así que su API pública no cambia.
- Se mantiene `src/vite-env.d.ts` para el tipado de `import.meta.env`, que Vite necesita.
- *Alternativa*: mantener `types/` con interfaces y añadir los esquemas aparte → dos fuentes de verdad que se pueden desincronizar. Descartada.

### 2. Rigor según la dirección del dato
| Dato | Constructor | Motivo |
|---|---|---|
| Respuestas de la API | `z.object` (descarta extras) | Que el backend añada campos no debe romper la app |
| Cuerpos que enviamos | `z.strictObject` | Un campo de más es un bug nuestro |
| Configuración `VITE_*` | `z.strictObject` | Detecta erratas en el nombre de las variables |
| Sesión en `localStorage` | `z.object` | Lo escribe la propia app; tolera campos de versiones futuras |
| Payload del JWT | `z.object` | Los JWT reales traen claims extra (`iss`, `aud`…) |

### 3. Cliente HTTP con esquemas y `ContractError`
```
httpGet(path, responseSchema, init?)                      -> Promise<z.output<S>>
httpPost(path, body, { request, response }, init?)        -> Promise<z.output<R>>
```
- `httpPost` hace `request.safeParse(body)` antes de construir la `Request`. Si falla, lanza `ContractError` con `direction: 'request'` y no hay llamada de red.
- Tras `response.ok`, hace `response.safeParse(json)`. Si falla, lanza `ContractError` con `direction: 'response'`. Un JSON ilegible también es un `ContractError`.
- `ContractError extends Error` con `method`, `path`, `direction` e `issues`. El mensaje usa `z.prettifyError`. En desarrollo se registra con `console.error`, porque sin backend real es la pista principal.
- Los tipos genéricos se infieren del esquema, así que desaparecen los `httpGet<Beyblade[]>`.
- La UI no necesita cambios: `ContractError` no es `HttpError 401`, así que cae en el mensaje genérico que ya existe.
- *Alternativa*: validar en cada función de `api/` en lugar de en el cliente → más fácil de olvidar. Descartada.

### 4. El token se valida en el contrato del login
`LoginResponseSchema = z.object({ accessToken: z.string() }).check(...)` comprueba que `decodeTokenPayload(accessToken)` no lance. Así, un token inválido es un `ContractError` del login (spec `auth`, "Token de login inválido") y no un fallo dentro de `onSuccess`. `decodeTokenPayload` sustituye su type guard por `TokenPayloadSchema.safeParse`.

### 5. Sesión persistida validada al rehidratar
`persist` usa la opción `merge(persisted, current)`: si `SessionSchema.safeParse(persisted)` falla, devuelve `current` con la sesión vacía, y Zustand sobrescribe el almacenamiento en la siguiente escritura. `SessionSchema` admite `null` en `token`, `email` y `exp`, como el estado vacío actual.
- *Alternativa*: `version` + `migrate` → útil cuando cambie el formato. Se deja para entonces.

### 6. Configuración validada con detección de erratas
- `env.ts` toma de `import.meta.env` solo las claves que empiezan por `VITE_` y las valida con `z.strictObject({ VITE_API_BASE_URL: z.string().startsWith('/').or(z.url()).default('/api'), VITE_API_MOCKING: z.enum(['enabled', 'disabled']).default('disabled') })`.
- Si falla, lanza un `Error` con `z.prettifyError`. Las claves desconocidas aparecen como `Unrecognized key`. Como `httpClient` importa `env`, la app no arranca y el error se ve en la consola y en el overlay de Vite en desarrollo.
- Exporta `env.apiBaseUrl` y `env.apiMocking`.
- `main.tsx` **sigue** comparando `import.meta.env.VITE_API_MOCKING` literalmente para conservar la eliminación de MSW en el bundle; `env.ts` garantiza que el valor es válido.
- La lógica se separa en `parseEnv(raw)` para poder testearla sin depender de `import.meta.env`.

### 7. Mocks atados al contrato
- Las factories construyen el objeto por defecto, aplican `overrides` y devuelven `Schema.parse(result)`. Un override inválido en un test falla en el acto, con un mensaje claro.
- Los tests de contrato que necesitan datos inválidos los escriben a mano a propósito, sin pasar por la factory.
- `auth.handlers.ts` lee el cuerpo con `LoginRequestSchema.safeParse`. Si es inválido, responde 401, igual que hoy, para no cambiar la spec "Endpoint simulado de login".

### 8. Dónde viven los tests
- `httpClient.test.ts`:
  - Respuesta válida.
  - Campo ausente, tipo incorrecto y JSON ilegible → `ContractError`.
  - Campo extra descartado.
  - Cuerpo inválido → `ContractError` sin petición.
- `auth.schema.test.ts` y `beyblade.schema.test.ts`: la salida de las factories cumple el esquema y los casos límite.
- `env.test.ts`: `parseEnv` con valores válidos, ausentes, inválidos y desconocidos.
- Tests de integración en `BeybladeList.test.tsx`, `LoginForm.test.tsx` y `auth.store.test.ts` para los escenarios de las specs.

## Risks / Trade-offs

- [Validar cada respuesta tiene coste] → Insignificante con los volúmenes actuales. Si un listado crece mucho, se puede validar en un worker o por muestreo.
- [Un backend con datos ligeramente distintos deja la vista en error] → Es el comportamiento buscado. El `console.error` con `prettifyError` señala el campo exacto. Los campos extra no rompen nada.
- [Las factories lanzan con overrides inválidos] → Es deseable. Los tests que necesitan datos inválidos los construyen a mano, de forma explícita.
- [`env` lanza al importarse y puede romper tests] → Los tests usan `parseEnv` directamente. Vitest carga `.env` según el modo, así que con los `.env.*` actuales (todos válidos) no hay problema.
- [Zod aumenta el bundle] → Zod 4 es tree-shakable. Si molestara, existe `zod/mini` con la misma semántica.

## Migration Plan

1. Zod y `ContractError`, y nuevas firmas de `httpClient` con sus tests.
2. Feature `beyblades`: esquema, API, factory y tests.
3. Feature `auth`: esquemas, `jwt`, API, store, handlers, factories y tests.
4. `env.ts` validado.
5. Eliminar `types/` y actualizar `README.md` y `openspec/config.yaml`.

Rollback: revertir el PR. No cambia el formato de la sesión guardada, así que no hay migración de datos.
