# Beyblade Valencia

PWA con React 19 + Vite + TypeScript, Tailwind CSS, Zod, React Hook Form, React Router, TanStack Query y Zustand, con Firebase (Authentication + Firestore) como backend, y Vitest, Testing Library y Faker para tests.

## Scripts

| Comando                 | Descripción                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (contra el proyecto de Firebase de `.env`) |
| `npm run build`         | Type-check + build de producción                                  |
| `npm run build:demo`    | Build de demo para GitHub Pages                                   |
| `npm run preview`       | Sirve el build                                                    |
| `npm run lint`          | Lint con oxlint                                                   |
| `npm run typecheck`     | Sólo comprobación de tipos                                        |
| `npm run format`        | Formatea el código con Prettier                                   |
| `npm run format:check`  | Comprueba el formato sin escribir (CI)                            |
| `npm test`              | Vitest en modo watch                                              |
| `npm run test:run`      | Vitest una sola vez (CI)                                          |
| `npm run test:coverage` | Tests con cobertura (v8)                                          |
| `npm run test:rules`    | Tests de las reglas de Firestore con el emulador (necesita Java)  |

### Formato

El formato lo aplica Prettier (`.prettierrc.json`): comillas simples, sin `;`, comas finales y líneas de hasta 120 caracteres. `prettier-plugin-tailwindcss` ordena las clases de Tailwind en `className`, así que no hace falta cuidar su orden a mano. CI ejecuta `npm run format:check` y falla si algún archivo no está formateado.

`openspec/` y `.claude/` quedan fuera (`.prettierignore`), porque los generan o reescriben herramientas.

## Arquitectura

Organización **por features**: cada dominio vive en su carpeta y expone una API pública mínima.

```
src/
├── app/                 # Composición de la app: App (rutas), queryClient
│   ├── layout/          # AppLayout: estructura visual común (header y menú lateral, más adelante)
│   ├── pages/           # Páginas que componen features (HomePage)
│   └── pwa/             # Registro del service worker y aviso de actualización
├── features/
│   ├── auth/            # Login, sesión (useUser) y protección de rutas (RequireAuth)
│   └── beyblades/       # Una feature = un dominio
│       ├── api/         # Acceso a datos: interfaz (puerto), implementación de Firebase y lógica pura
│       ├── components/  # Componentes (+ tests colocados *.test.tsx)
│       ├── hooks/       # Lógica de estado / data fetching
│       ├── lib/         # (opcional) Utilidades puras de la feature
│       ├── mocks/       # Factories (Faker) e implementaciones en memoria (fakes) para los tests
│       ├── store/       # (opcional) Estado de cliente con Zustand
│       ├── schemas/     # Esquemas de Zod (contratos) y tipos inferidos de ellos
│       └── index.ts     # API pública: lo único que importa el resto de la app
├── shared/              # Código reutilizable sin dominio
│   ├── config/          # Variables de entorno validadas (env, parseEnv)
│   ├── contracts/       # ContractError y parseContract (validación de datos leídos)
│   ├── firebase/        # Inicialización perezosa de Firebase (app, Auth, Firestore)
│   └── ui/              # Componentes de interfaz sin dominio (Button, TextField)
├── index.css            # Tailwind, tokens del tema y estilos base
├── test/
│   ├── setup.ts         # jest-dom, cleanup e instalación de los fakes antes de cada test
│   └── test-utils.tsx   # renderWithProviders (QueryClient + MemoryRouter, + userEvent) y re-exports de RTL
└── main.tsx

firebase/                # Tests de las reglas de Firestore (emulador)
firestore.rules          # Reglas de acceso: el "backend" de la app
firebase.json            # Configuración de Firebase CLI y del emulador
```

### Reglas

- `features/*` puede importar de `shared/`, nunca de otra feature salvo por su `index.ts`.
- `shared/` no importa nada de `features/`.
- Alias `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).
- Los tests van junto al código que prueban (`Foo.tsx` → `Foo.test.tsx`).

## Estilos

Los estilos se escriben con utilidades de **Tailwind CSS v4** directamente en `className`. No hay hojas de estilo por componente ni clases globales: la configuración vive en `src/index.css` (`@import 'tailwindcss'` + `@theme`), sin `tailwind.config.js`.

### Tokens del tema

Usa siempre los tokens semánticos en lugar de colores de la paleta de Tailwind (`bg-card`, no `bg-zinc-900`):

| Token        | Ejemplo de uso                            | Oscuro    | Claro     |
| ------------ | ----------------------------------------- | --------- | --------- |
| `background` | `bg-background` (página, inputs)          | `#121212` | `#ffffff` |
| `foreground` | `text-foreground`, `border-foreground/30` | `#f1f1f1` | `#1a1a1a` |
| `card`       | `bg-card` (tarjetas, login, avisos)       | `#1f1f22` | `#f4f4f5` |
| `accent`     | `bg-accent`, `outline-accent`             | `#dd6e2f` | `#dd6e2f` |
| `danger`     | `border-danger`, `bg-danger/12`           | `#ef5350` | `#c62828` |

Cada token es una variable CSS (`--bg`, `--fg`, `--card`, `--accent`, `--danger`) con un valor en `:root` (claro) y otro en `.dark` (oscuro).

### Tema oscuro por defecto

La app es **siempre oscura**, sea cual sea la preferencia del sistema. `index.html` pone `class="dark"` y `color-scheme: dark` en `<html>`, así que el primer pintado ya es oscuro, antes de que se ejecute JavaScript. El manifest de la PWA usa `#121212` como `background_color` y `theme_color`.

- Como los tokens cambian solos con la clase `.dark`, los componentes **no necesitan `dark:`** para los colores base.
- La variante `dark:` funciona por clase (`@custom-variant dark` en `index.css`), no por `prefers-color-scheme`. Úsala solo para excepciones puntuales.
- Los valores del tema claro están definidos pero no se usan. Un selector de tema futuro solo tendrá que poner o quitar `.dark` en `<html>` (y recordar la preferencia).

### Componentes compartidos

Cuando unas mismas clases se repiten en dos sitios, se extraen a un componente en `src/shared/ui/` en vez de crear una clase CSS con `@apply`. Por ahora existen `Button` (variantes `primary` y `secondary`; por defecto `type="button"`) y `TextField` (ver [Formularios](#formularios)).

## Firebase

La app usa **Firebase Authentication** (correo y contraseña) y **Firestore**. No hay servidor propio: la
seguridad la dan las reglas de `firestore.rules`.

### Datos

```
users/{uid}      { role: 'ADMIN' | 'MEMBER' | 'JUDGE' }   perfil de cada cuenta
beyblades/{id}   { name, type, blader, wins }              el id es el del documento
```

- Una cuenta sin perfil en `users/{uid}`, o con un rol inválido, **no está habilitada**: la app cierra su
  sesión y muestra "Tu cuenta no está habilitada…".
- Reglas: leer datos exige sesión **y** perfil con rol válido; solo `ADMIN` escribe beyblades y gestiona
  perfiles; cada usuario lee su propio perfil; el resto de colecciones están cerradas.

### Configuración

Las variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y
`VITE_FIREBASE_APP_ID` son obligatorias y están en `.env` (versionado: la configuración web de Firebase es
pública). `.env.example` documenta de dónde sale cada una. Desarrollo, demo y producción usan el mismo proyecto.

### Preparar el proyecto de Firebase

1. Crear el proyecto y una app web; copiar su configuración a `.env`.
2. **Authentication**: activar el proveedor _Correo electrónico/contraseña_ y desactivar el alta de cuentas
   por los clientes (_Settings → User actions_), porque la app no tiene registro.
3. **Authentication → Settings → Dominios autorizados**: añadir `charliecobo.github.io` (demo) además de `localhost`.
4. **Firestore**: crear la base de datos y desplegar las reglas: `npx firebase deploy --only firestore:rules --project <id>`.
5. Crear las cuentas en Authentication y, para cada una, su documento `users/{uid}` con su `role`
   (al menos un `ADMIN`). Para probar a mano, una cuenta `MEMBER` `test@mail.com` / `Test1234!`.

### Tests

- **Sin Firebase**: cada feature define una interfaz para su acceso a datos (`AuthGateway`,
  `BeybladesRepository`) con dos implementaciones: la de Firebase (cargada con `import()` dinámico, en un
  chunk aparte) y una en memoria en `mocks/` (`fakeAuth`, `fakeBeyblades`). `src/test/setup.ts` instala y
  reinicia los fakes antes de cada test, así que ningún test de componentes carga el SDK ni usa la red.
- Para un caso concreto se manipula el fake:

  ```ts
  fakeBeyblades.seed([buildBeyblade({ name: 'Pegasus' })])
  fakeBeyblades.seedRaw([{ id: 'b-1', data: { name: 'Pegasus', wins: 'diez' } }]) // fuera de contrato
  fakeBeyblades.failNext(new Error('unavailable'))
  fakeAuth.addAccount({ uid: 'u2', email: 'sin@perfil.es', password: 'x' }) // sin perfil
  fakeAuth.startSignedIn() // arranca con la sesión de TEST_ACCOUNT
  ```

- **Factories con Faker**: cada entidad tiene `buildX(overrides)` en `features/<feature>/mocks/`. Devuelve
  `XSchema.parse(...)`, así que no puede salirse del contrato. Los tests que necesitan datos inválidos los
  escriben a mano a propósito.
- **Reglas**: `npm run test:rules` arranca el emulador de Firestore (proyecto `demo-lvb`, sin conexión a
  Firebase) y ejecuta `firebase/firestore.rules.test.ts`. Necesita Java 21; CI lo ejecuta en cada PR.

### Estado y peticiones

- **Estado de servidor** (datos almacenados, mutaciones): TanStack Query. El `QueryClient` de la app está en
  `src/app/queryClient.ts`; en los tests, `renderWithProviders` crea uno nuevo por render, sin reintentos.
- **Estado de cliente** (sesión, preferencias…): Zustand, con un store por feature en `store/`.
- **Rutas**: React Router en modo declarativo. La tabla de rutas está en `src/app/App.tsx` y el `BrowserRouter`
  en `src/main.tsx`, con `basename` igual a la ruta base. `renderWithProviders(ui, { route: '/login' })` fija la
  ruta inicial en los tests.

### Añadir una nueva feature

1. Crea `src/features/<nombre>/` con la estructura anterior.
2. Define sus contratos en `schemas/`.
3. Define en `api/` la interfaz de acceso a datos, su implementación de Firebase (con `import()` dinámico) y
   la función que valida lo leído con `parseContract`.
4. Añade su factory y su fake en `mocks/`, e instala el fake en `src/test/setup.ts`.
5. Añade sus reglas en `firestore.rules` con sus tests en `firebase/`.
6. Exporta lo necesario desde `index.ts`.

## Contratos (Zod)

Los esquemas de Zod son la **única fuente de verdad** de los datos: viven en `features/<feature>/schemas/` y los tipos se infieren de ellos (`type Beyblade = z.infer<typeof BeybladeSchema>`). No hay interfaces escritas a mano para datos que vienen de fuera.

Ningún dato externo entra en la app sin pasar por un esquema. El rigor depende de la dirección del dato:

| Dato                             | Constructor                  | Por qué                                                      |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| Documentos de Firestore          | `z.object` (descarta extras) | Que un documento tenga un campo nuevo no debe romper la app  |
| Credenciales del login           | `z.strictObject`             | Un campo de más es un bug nuestro                            |
| Configuración `VITE_*`           | `z.strictObject`             | Detecta erratas en el nombre de las variables                |
| Perfil en caché (`localStorage`) | `z.object`                   | La escribe la propia app; tolera campos de versiones futuras |

- **`parseContract(schema, data, source)`** (`src/shared/contracts/`): valida los datos leídos. Si no cumplen,
  lanza un `ContractError` con `source` (p. ej. `beyblades/abc123`) e `issues`, y las vistas lo tratan como
  su error inesperado. En desarrollo se registra en la consola con el campo exacto que falla.
- **Configuración**: `src/shared/config/env.ts` valida las variables `VITE_*` al arrancar. Una variable
  ausente, vacía o desconocida impide arrancar con un error que nombra la variable.

## Formularios

Todos los formularios siguen el mismo patrón: **esquema de Zod + `useForm` (React Hook Form) + `zodResolver` + `TextField`**. Ejemplo real (`features/auth/components/LoginForm.tsx`):

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormValues, unknown, LoginFormOutput>({
  resolver: zodResolver(LoginFormSchema),
  mode: 'onTouched',
  defaultValues: { email: '', password: '' },
})

<form noValidate onSubmit={handleSubmit((credentials) => submit(credentials, { onSuccess }))}>
  <TextField label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
  ...
</form>
```

- **Esquema del formulario** en `features/<feature>/schemas/<nombre>Form.schema.ts`, con los mensajes en español y las transformaciones de entrada (p. ej. `trim` del correo). Los valores del formulario se tipan con `z.input` y lo que entrega `handleSubmit` con `z.output`, ya transformado.
- **Separado del contrato**: el esquema del formulario no es el de las credenciales (`CredentialsSchema`). Un test de tipos (`expectTypeOf<LoginFormOutput>().toEqualTypeOf<Credentials>()`) impide que se desvíen.
- **`mode: 'onTouched'`**: el error de un campo aparece al salir de él o al enviar, nunca mientras se escribe por primera vez. Una vez visible, se revalida al escribir y desaparece en cuanto el valor es válido.
- **Foco**: al enviar con errores, el foco va al primer campo inválido. React Hook Form sigue el orden de `register`, así que **registra los campos en el orden visual**.
- **`noValidate`** en el `<form>` desactiva los avisos nativos del navegador. Los inputs conservan su `type` y `autoComplete` (teclado móvil y autocompletado).
- **`TextField`** (`src/shared/ui/`) pinta la etiqueta, el input y el error. Con error marca el campo con `aria-invalid` y lo asocia al mensaje con `aria-describedby`. Recibe la `ref` de `register` como una prop más (React 19); sin ella no funciona el foco.
- El envío, el estado pendiente y los errores del servicio no son de React Hook Form: siguen en el hook de la feature (p. ej. `useLogin`).
- En los tests, la validación es asíncrona: espera los mensajes con `findBy*`.

## Autenticación

- **Login** con correo y contraseña contra Firebase Authentication. Los errores del SDK se traducen a errores
  de dominio (`InvalidCredentialsError`, `AccountNotEnabledError`; el resto, error inesperado) en
  `features/auth/api/session.ts`.
- **Sesión**: la guarda y renueva Firebase; dura hasta que el usuario pulsa "Cerrar sesión" (en `AppLayout`).
  `useAuthSessionSync()` (montado en `App`) refleja el estado en `useAuthStore`, que no persiste nada. Fuera
  de la feature se usa `useUser()`, que devuelve `{ status, email, role }` con `status` igual a
  `'checking' | 'signedIn' | 'signedOut'`.
- **Comprobando sesión**: al arrancar, mientras Firebase no responde, `RequireAuth` y `LoginPage` muestran
  "Comprobando sesión…" en lugar de redirigir.
- **Páginas privadas**: se anidan bajo la ruta de layout `RequireAuth` en `src/app/App.tsx`. Sin sesión,
  redirige a `/login` y, tras iniciar sesión, vuelve a la página pedida.
- **Sin conexión**: el login no se envía (ni se reanuda solo al volver la red) y se muestra un aviso. Al
  arrancar sin red se usa el último perfil validado (`lvb-profile` en `localStorage`) de esa misma cuenta.
- En los tests, `src/test/setup.ts` empieza cada test sin sesión. Para empezar con sesión en la app completa:
  `fakeAuth.startSignedIn()`; para un componente aislado: `useAuthStore.getState().setSignedIn(user)`.

## PWA

Configurada con [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) en `vite.config.ts`.

- **Instalable**: el manifest (`manifest.webmanifest`) toma `scope` y `start_url` de `base`
  (`/` o `/beyblade-valencia/` en la demo). Nombre, colores e iconos están en la opción `manifest`.
- **Sin conexión**: el service worker precachea el esqueleto de la app (HTML, JS, CSS, iconos),
  que arranca sin red después de la primera visita.
- **El backend nunca se cachea**: no hay `runtimeCaching`, así que las peticiones a Firebase (otros
  orígenes) van siempre a la red. El SDK de Firebase sí se precachea, en su propio chunk.
- **Actualizaciones**: con `registerType: 'prompt'`, cuando hay una versión nueva aparece el aviso
  "Hay una nueva versión disponible" (`src/app/pwa/UpdatePrompt.tsx`). La app solo se recarga si
  el usuario pulsa "Actualizar".
- **Desarrollo**: el service worker no se registra en `npm run dev`. Para probarlo:
  `npm run build:demo && npx vite preview --mode demo`.

### Iconos (`public/`)

| Archivo                                               | Uso                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `logo.png`                                            | Logo LVB con fondo transparente, origen del resto                       |
| `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` | Iconos `any` del manifest (logo sobre círculo blanco)                   |
| `maskable-icon-512x512.png`                           | Icono `maskable` (fondo blanco, logo dentro de la zona segura del 80 %) |
| `apple-touch-icon-180x180.png`                        | Icono de iOS                                                            |
| `favicon.ico`                                         | Favicon (16, 32, 48 y 64 px)                                            |

Para cambiar el logo, regenera estos archivos a partir de un `logo.png` cuadrado nuevo, con los mismos
nombres y tamaños; el icono maskable debe dejar el logo dentro de un círculo del 80 % del lado.
Puedes comprobarlo en <https://maskable.app/>.

## Demo en GitHub Pages

El workflow `.github/workflows/deploy-demo.yml` comprueba cada PR (lint, formato, tests y tests de reglas) y
publica en cada push a `master` (o manualmente desde _Actions → Run workflow_) un build con `--mode demo`:

- Usa el mismo proyecto de Firebase que desarrollo (`.env`), así que muestra datos reales.
- `base` es `/beyblade-valencia/`.
- GitHub Pages no tiene fallback para SPA, así que el build de demo copia `index.html` como `404.html`
  (plugin `spaFallback404` en `vite.config.ts`). Así, abrir directamente una URL como
  `/beyblade-valencia/login` carga la app, aunque Pages responda con estado 404. `404.html` no se precachea.

URL: https://charliecobo.github.io/beyblade-valencia/

El workflow publica `dist/` en la rama `gh-pages`. Si la web no aparece, revisa
_Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`_.
Para retirar la demo, borra el workflow, la rama `gh-pages` y desactiva Pages.

## Nuevas features con OpenSpec

El proyecto usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) (spec-driven development) integrado con Claude Code.
Las specs viven en `openspec/specs/`, los cambios en curso en `openspec/changes/` y el contexto del
proyecto (stack, arquitectura, convenciones de datos y tests) en `openspec/config.yaml`.

Flujo en Claude Code:

1. `/opsx:explore` — (opcional) explorar la idea antes de proponer.
2. `/opsx:propose "descripción de la feature"` — genera `proposal.md`, specs delta, `design.md` y `tasks.md`.
3. Revisar y ajustar la propuesta (`/opsx:update` si hace falta).
4. `/opsx:apply` — implementa las tareas.
5. `/opsx:archive` — archiva el cambio y actualiza las specs principales.

CLI: `npm run openspec -- list`, `npm run openspec -- view`, `npm run openspec -- validate --all`.
Los comandos de Claude invocan `openspec` directamente, así que conviene tenerlo global:
`npm i -g @fission-ai/openspec`.
