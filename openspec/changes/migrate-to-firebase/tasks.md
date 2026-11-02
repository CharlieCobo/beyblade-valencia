# Tasks

## 1. Dependencias y configuración

- [x] 1.1 Instalar `firebase` (dependencia) y `firebase-tools` y `@firebase/rules-unit-testing` (desarrollo); verificar con `npm ls firebase firebase-tools @firebase/rules-unit-testing`
- [x] 1.2 Reescribir `EnvSchema` en `src/shared/config/env.ts` con las cuatro variables `VITE_FIREBASE_*` obligatorias (`z.string().min(1)`, sin valores por defecto) y adaptar `env.test.ts` a los escenarios de "Configuración validada al arrancar" (variable ausente, vacía, desconocida, `VITE_API_MOCKING` antigua, configuración válida); verificar con `npx vitest run src/shared/config`
- [ ] 1.3 Crear `.env` con la configuración pública del proyecto de Firebase, actualizar `.env.example`, borrar `.env.development` y `.env.demo`, y dar valores ficticios a las `VITE_FIREBASE_*` en `test.env` de `vite.config.ts`; verificar que `npm run dev` arranca sin error de configuración
- [x] 1.4 Crear `src/shared/firebase/app.ts` con la inicialización perezosa de `FirebaseApp`, `Auth` y `Firestore` a partir de `env`; verificar con `npm run typecheck` y que ningún módulo de `src/` lo importa de forma estática salvo las implementaciones reales de los puertos

## 2. Contratos

- [x] 2.1 Mover `ContractError` a `src/shared/contracts/ContractError.ts` con `source` en lugar de `method`/`path`/`direction`, y adaptar su test; verificar con `npx vitest run src/shared/contracts`

## 3. Beyblades sobre Firestore

- [x] 3.1 Definir `BeybladesRepository` y `setBeybladesRepository`/`resetBeybladesRepository` en `features/beyblades/api/`, con la implementación de Firestore cargada con `import()` dinámico por defecto; verificar con `npm run typecheck`
- [x] 3.2 Crear `fakeBeybladesRepository` en `features/beyblades/mocks/` (sembrado con `buildBeyblade()`, con `seed`, `seedRaw` para documentos fuera de contrato y `failNext`) y su test; verificar con `npx vitest run src/features/beyblades/mocks`
- [x] 3.3 Implementar `firestoreBeybladesRepository` con un `FirestoreDataConverter` que valida cada documento con `BeybladeSchema` y rechaza con `ContractError`; extraer la validación a una función pura y probarla con documentos válidos, con campo extra `image`, con `wins: "diez"` y sin `name`; verificar con `npx vitest run src/features/beyblades/api`
- [x] 3.4 Adaptar `useBeyblades` al repositorio (ignorando el resultado tras desmontar) y migrar `BeybladeList.test.tsx` de `server.use(...)` al fake cubriendo carga, vacío, error, éxito y los escenarios de `api-contracts`; verificar con `npx vitest run src/features/beyblades`

## 4. Autenticación sobre Firebase

- [x] 4.1 Añadir `UserProfileSchema` (`role: 'ADMIN' | 'MEMBER' | 'JUDGE'`), su factory `buildUserProfile()` con Faker y los errores `InvalidCredentialsError` y `AccountNotEnabledError`; eliminar `LoginResponseSchema`, `SessionSchema`, `AuthUserSchema`, `token.schema.ts`, `lib/jwt.ts` y `mocks/jwt.ts` con sus tests; verificar con `npx vitest run src/features/auth/schemas src/features/auth/mocks`
- [x] 4.2 Definir `AuthGateway` (`signIn`, `signOut`, `onSessionChange`) con `setAuthGateway`/`resetAuthGateway` y crear `fakeAuthGateway` (cuentas, perfiles, sesión inicial, fallos) con su test; verificar con `npx vitest run src/features/auth/mocks`
- [x] 4.3 Implementar `firebaseAuthGateway`: `signInWithEmailAndPassword`, lectura y validación de `users/{uid}`, traducción de códigos de Firebase a errores de dominio (tabla de design.md, decisión 5), `signOut` ante cuenta no habilitada y caché del último perfil en `lvb-profile` para fallos de red; probar la traducción de errores y la lectura de `lvb-profile` como funciones puras; verificar con `npx vitest run src/features/auth/api`
- [x] 4.4 Reescribir `auth.store` sin `persist` (`status`, `user`, `disabledReason`), borrar la clave antigua `lvb-auth` al arrancar y montar el listener de `onSessionChange` en la app; adaptar `auth.store.test.ts` y `useUser` (`status`, `email`, `role`) con su test; verificar con `npx vitest run src/features/auth/store src/features/auth/hooks/useUser.test.ts`
- [x] 4.5 Mostrar "Comprobando sesión…" en `RequireAuth` y `LoginPage` mientras `status` es `checking`, y adaptar sus tests (recarga con sesión sin redirección, comprobación sin sesión, login con sesión activa); verificar con `npx vitest run src/features/auth/components/RequireAuth.test.tsx src/features/auth/components/LoginPage.test.tsx`
- [x] 4.6 Adaptar `useLogin` y `LoginForm` al gateway y a los errores de dominio (credenciales incorrectas, cuenta no habilitada, error inesperado, sin conexión, envío en curso) y migrar sus tests de `server.use(...)` al fake; verificar con `npx vitest run src/features/auth/hooks/useLogin.test.tsx src/features/auth/components/LoginForm.test.tsx`
- [x] 4.7 Añadir el botón "Cerrar sesión" en `AppLayout` (vía la API pública de `auth`) que llama a `signOut` y navega a `/login` con `replace`, con su test; verificar con `npx vitest run src/app`

## 5. Retirada de MSW y del cliente HTTP

- [x] 5.1 Instalar los fakes en `src/test/setup.ts` (`beforeEach`) en lugar de `server.listen`, y quitar de `src/main.tsx` `enableMocking` y `setHttpTransport`; verificar con `npm run test:run`
- [x] 5.2 Borrar `src/mocks/`, `features/*/mocks/*.handlers.ts`, `features/auth/api/auth.api.ts`, `src/shared/api/` (`httpClient` y sus tests) y desinstalar `msw`; verificar con `grep -rn "msw\|httpClient\|HttpError\|apiUrl" src` sin resultados y `npm run typecheck`
- [x] 5.3 Quitar de `vite.config.ts` el `loadEnv`, `apiBase` y el `navigateFallbackDenylist` de la API, y `src/mocks/**` de las exclusiones de cobertura; verificar con `npm run build` y que `dist/sw.js` no contiene reglas de caché para `googleapis.com`

## 6. Reglas de seguridad de Firestore

- [x] 6.1 Crear `firebase.json` (Firestore + emulador) y `firestore.rules` según design.md (decisión 7); verificar con `npx firebase emulators:exec --only firestore "true"`
- [x] 6.2 Escribir `firebase/firestore.rules.test.ts` con `@firebase/rules-unit-testing` cubriendo cada escenario de `access-control` (lectura sin sesión, sin perfil y de miembro; escritura de beyblades por `ADMIN` y `JUDGE`; lectura del propio perfil y de otro; auto-ascenso; asignación de rol por `ADMIN`), con `vitest.rules.config.ts` y el script `npm run test:rules`; verificar con `npm run test:rules`
- [ ] 6.3 Añadir al workflow un paso que ejecuta `npm run test:rules` (con Java) antes del build; verificar con el run de GitHub Actions en verde

## 7. Documentación, convenciones y despliegue

- [ ] 7.1 Actualizar el workflow `deploy-demo.yml` (nombre y comentarios sin MSW; build de demo con `.env`) y confirmar que `npm run build:demo` genera la app apuntando al proyecto de Firebase
- [x] 7.2 Actualizar `README.md`: stack sin MSW, estructura (`shared/firebase`, `shared/contracts`, puertos y fakes por feature), variables `VITE_FIREBASE_*`, `npm run test:rules` y los pasos de preparación del proyecto de Firebase (design.md, Migration Plan); verificar que los comandos documentados existen en `package.json`
- [x] 7.3 Actualizar `context` y `rules` de `openspec/config.yaml` para sustituir MSW y `httpClient` por Firebase, puertos con fakes en memoria y tests de reglas; verificar con `npx openspec validate migrate-to-firebase --strict`

## 8. Verificación

- [x] 8.1 Ejecutar `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run test:rules`, `npm run format:check` y `npm run build`, todos sin errores, y comparar el tamaño de los chunks con el build anterior
- [ ] 8.2 Con el proyecto de Firebase preparado, comprobar a mano en `npm run dev` y en la demo: login correcto con una cuenta `MEMBER`, credenciales incorrectas, cuenta sin perfil, listado de beyblades, recarga con sesión y cierre de sesión

## Workflow follow-up

- Preparar el proyecto de Firebase (Authentication sin alta por clientes, Firestore, dominios autorizados), desplegar las reglas y crear el primer `ADMIN` antes de fusionar.
- Archivar el cambio tras la revisión y comprobar que `openspec/specs/api-mocking` desaparece y `access-control` queda creado.
