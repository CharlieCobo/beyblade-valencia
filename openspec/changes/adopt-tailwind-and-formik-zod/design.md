# Design

## Context

- Estilos: un único `src/index.css` (~135 líneas) con variables CSS (`--bg`, `--fg`, `--card`, `--accent`), modo oscuro por `@media (prefers-color-scheme: dark)` y clases globales usadas por 6 componentes. Ningún test consulta clases: todos buscan por rol, etiqueta o texto.
- Formularios: solo existe `LoginForm`, que lee los valores con `FormData` en el `submit`, depende de `required`/`type="email"` para validar y delega el envío, el estado pendiente y los errores de API en `useLogin` (mutación de TanStack Query, con control de sin conexión).
- Versiones actuales en npm: `tailwindcss`/`@tailwindcss/vite` 4.3 (admite Vite 8), `formik` 2.4 (peer `react >=16.8`), `zod` 4.6.
- Motivación y alcance: ver proposal.md. Comportamiento de formularios: ver `specs/forms` y `specs/auth`.

## Goals / Non-Goals

**Goals:**
- Que añadir una pantalla nueva no requiera tocar CSS global.
- Un único patrón para formularios: esquema de Zod + `useFormik` + `TextField`.
- Mantener el aspecto actual (colores, radios, espaciados, modo oscuro) sin regresiones visibles.

**Non-Goals:**
- Tests de regresión visual automáticos.
- Ordenación automática de clases (no hay Prettier en el proyecto; oxlint no lo cubre).
- Mover el estado de envío o los errores de API a Formik: siguen en `useLogin`.

## Decisions

### 1. Tailwind v4 con `@tailwindcss/vite` y configuración en CSS
Se añade el plugin a `vite.config.ts` y la configuración vive en `src/index.css` (`@import "tailwindcss"` + `@theme`), sin `tailwind.config.js` ni PostCSS.
- *Alternativa*: Tailwind v3 con PostCSS → configuración en JS, más dependencias y sin soporte nativo de Vite 8 como plugin. Descartada.

### 2. Tokens semánticos que cambian con el tema
Las variables actuales se mantienen en `:root` (y su redefinición en modo oscuro) y se exponen a Tailwind con `@theme inline`:

| Token Tailwind | Variable | Uso |
|---|---|---|
| `background` | `--bg` | fondo de página, inputs |
| `foreground` | `--fg` | texto |
| `card` | `--card` | tarjetas, login, aviso de actualización |
| `accent` | `--accent` | botón primario, badge, foco |
| `danger` | `#c62828` | errores |

Así se escribe `bg-card text-foreground` y el modo oscuro funciona sin `dark:` en cada componente. La variante `dark:` de Tailwind (por defecto basada en `prefers-color-scheme`) queda disponible para casos puntuales.
- *Alternativa*: usar la paleta de Tailwind directamente (`bg-zinc-100 dark:bg-zinc-900`) → duplica cada color en cada componente y pierde el color de marca. Descartada.

### 3. Reutilización con componentes de React, no con `@apply`
Lo que se repite se extrae a `src/shared/ui/`:
- `Button`: variantes `primary` y `secondary`.
- `TextField`: etiqueta, input y mensaje de error.

`@apply` y clases propias quedan para los estilos base (`body`, `box-sizing` ya lo da Preflight). `src/shared/ui/` respeta la regla de que `shared` no importa de `features`.
- *Alternativa*: mantener clases `.button` con `@apply` → reintroduce CSS global, que es lo que se quiere evitar. Descartada.
- Sin `clsx`/`tailwind-merge` por ahora: con dos variantes basta un objeto de clases y un `join`. Se reconsiderará si los componentes empiezan a aceptar `className` que choque con sus clases.

### 4. Formik con `useFormik` y validación por esquema de Zod
Formik gestiona valores, `touched`, `errors` y `submitCount`. Formik solo integra Yup en `validationSchema`, así que se usa su opción `validate` con un adaptador propio en `src/shared/lib/forms/zodValidate.ts`:
- `toFormikValidate(schema)` ejecuta `schema.safeParse(values)` y convierte `error.issues` en el objeto de errores de Formik con `setIn` de Formik (soporta rutas anidadas), quedándose con el primer mensaje por campo.
- *Alternativa*: `zod-formik-adapter` → poco mantenido y atado a versiones antiguas de Zod. Descartada; el adaptador son ~15 líneas con test propio.
- *Alternativa*: React Hook Form + `@hookform/resolvers/zod` → más mantenido y con mejor rendimiento, pero el usuario pidió Formik. Al concentrar la integración en el adaptador y en `TextField`, un cambio futuro quedaría acotado.

### 5. Esquemas por feature y tipos inferidos
Cada formulario tiene su esquema en `features/<feature>/schemas/<nombre>.schema.ts`, nueva carpeta en la estructura de features. Los valores iniciales se tipan con `z.input<typeof schema>` y lo que se envía a la API con `z.output<typeof schema>`. Para el login:
- `email`: `z.string().trim().min(1, 'Introduce tu correo').pipe(z.email('Introduce un correo válido'))`.
- `password`: `z.string().min(1, 'Introduce tu contraseña')`, sin `trim`: los espacios pueden formar parte de la contraseña.

En `onSubmit` se hace `schema.parse(values)` para enviar los datos ya transformados (correo sin espacios). No puede fallar porque Formik solo llama a `onSubmit` cuando `validate` no devuelve errores.

### 6. Cuándo se muestran los errores
Se mantienen los valores por defecto de Formik (`validateOnChange` y `validateOnBlur` activos) y `TextField` muestra el error solo si `touched[campo]`. Formik marca todos los campos como tocados al enviar, lo que cubre "tras intentar enviar". El formulario lleva `noValidate` para desactivar los avisos nativos, pero los inputs conservan `type="email"` y `autoComplete` (teclado móvil y autocompletado).

### 7. Accesibilidad de `TextField`
`TextField` genera ids con `useId`. Con error visible: `aria-invalid="true"`, `aria-describedby` apuntando al `<p>` del mensaje. Sin error, no se pone ninguno de los dos. Recibe las props de `formik.getFieldProps(name)` más `label`, `type`, `autoComplete` y `error`.

### 8. Envío y estado pendiente siguen en `useLogin`
`onSubmit` de Formik llama a `submit(parsed, { onSuccess })`. El botón usa `isPending` de la mutación, no `isSubmitting` de Formik, porque `mutate` no devuelve una promesa y el control de sin conexión vive en `useLogin`. El mensaje de error de API sigue en el `role="alert"` del formulario, separado de los errores por campo.

## Risks / Trade-offs

- [Formik tiene un mantenimiento bajo] → La integración se concentra en `zodValidate` y `TextField`. Sustituirlo afectaría a esos dos módulos y a los `useFormik` de cada formulario.
- [Regresiones visuales al migrar sin tests visuales] → Se migra componente a componente y se compara con capturas del antes y el después (Playwright) en claro y oscuro, en móvil y escritorio.
- [Tailwind v4 requiere navegadores modernos (Safari 16.4+, Chrome 111+, Firefox 128+)] → Aceptable para una PWA nueva; ya se usa `color-mix`, que tiene requisitos parecidos.
- [Clases largas en JSX] → Se extraen a componentes de `shared/ui` cuando se repiten más de una vez.
- [Los tests de `LoginForm` que usan `toBeInvalid()` dejan de valer con `noValidate`] → Se reescriben contra los mensajes y `aria-invalid`, que es lo que pide la spec.

## Migration Plan

1. Archivar `add-login-page` para que exista la spec principal `auth`.
2. Instalar Tailwind y migrar estilos manteniendo el aspecto (sin cambio de comportamiento; todos los tests deben seguir pasando sin tocarlos).
3. Añadir Formik, Zod, el adaptador y `TextField`, y migrar `LoginForm` con sus tests.

Todo va en una rama y un PR. Rollback: revertir el PR. No hay datos persistidos ni cambios de API afectados.
