# Design

## Context

- `LoginForm` lee los valores con `FormData` en el `submit` y depende de `required`/`type="email"` para validar. Envío, estado pendiente, modo sin conexión y errores de API viven en `useLogin` (mutación de TanStack Query).
- Tras `add-typed-contracts`: Zod está instalado y `LoginRequestSchema` (estricto: `email` y `password`) define el cuerpo del login.
- Tras `adopt-tailwind`: tokens (`danger` para errores), `Button` en `shared/ui` y Prettier.
- Versiones: `react-hook-form` 7.91 (peer React 19) y `@hookform/resolvers` 7.0 (admite Zod 4).
- Motivación: ver proposal.md. Comportamiento: ver `specs/forms` y `specs/auth`.

## Goals / Non-Goals

**Goals:**
- Un único patrón para formularios: esquema de Zod + `useForm` + `zodResolver` + `TextField`.
- Tipos de entrada y de salida del formulario derivados del esquema, sin anotaciones a mano.
- Que la salida del formulario esté comprobada en tipos contra el contrato de la API.

**Non-Goals:**
- Componentes para select, checkbox o listas dinámicas (`useFieldArray`) hasta que haya un formulario que los necesite.
- Mover a React Hook Form el envío, el estado pendiente o los errores de API: siguen en `useLogin`.

## Decisions

### 1. React Hook Form + `zodResolver`
`useForm<z.input<S>, unknown, z.output<S>>({ resolver: zodResolver(S), mode: 'onTouched', defaultValues })`.
- Inputs no controlados registrados con `register`: un re-render por campo y no por pulsación del formulario entero.
- `handleSubmit` entrega ya la **salida** del esquema (con transformaciones aplicadas, como el correo sin espacios). No hace falta un `parse` extra.
- *Alternativas*:
  - Formik → mantenimiento bajo, solo integra Yup y vuelve a renderizar el formulario entero.
  - TanStack Form → buen encaje con Query, pero más joven y con una API más verbosa para lo que gana aquí.

  Detalle en el explore previo; descartadas.

### 2. Momento de validación: `mode: 'onTouched'`
- Primera validación de cada campo al salir de él (blur). A partir de ahí, en cada cambio (`reValidateMode: 'onChange'` por defecto).
- Al enviar se valida todo y se muestran todos los errores.
- `shouldFocusError: true` (por defecto) pone el foco en el primer campo inválido según el orden de registro. Por eso `register` debe ejecutarse en el orden visual de los campos.
- Cubre la spec `forms`: "Momento en que se muestran los errores" y "Foco en el primer campo inválido".

### 3. `TextField` en `shared/ui`
- Props: `label`, `error?: string`, más las props del input (`type`, `autoComplete`…) y las que devuelve `register(name)` (`name`, `onChange`, `onBlur`, `ref`).
- Con React 19, `ref` es una prop normal y se pasa al `<input>`, sin `forwardRef`. Sin `ref` no funciona el foco del punto 2.
- Ids con `useId`. Con error: `aria-invalid="true"` y `aria-describedby` apuntando al `<p>` del mensaje (color `danger`). Sin error, no se ponen ninguno de los dos.
- No depende de React Hook Form, así que sirve también para un campo fuera de un formulario.

### 4. Esquema del formulario separado del contrato de la API
`features/auth/schemas/loginForm.schema.ts`:
- `email`: `z.string().trim().min(1, 'Introduce tu correo').pipe(z.email('Introduce un correo válido'))`.
- `password`: `z.string().min(1, 'Introduce tu contraseña')`, sin `trim`: los espacios pueden formar parte de la contraseña.

Es un esquema distinto de `LoginRequestSchema` porque sus responsabilidades son distintas: mensajes de usuario y transformaciones de entrada frente al contrato con la API. Para que no se desvíen:
- Un test de tipos (`expectTypeOf<z.output<typeof LoginFormSchema>>().toEqualTypeOf<LoginRequest>()`).
- `httpPost` sigue validando el cuerpo con `LoginRequestSchema` en tiempo de ejecución.
- *Alternativa*: añadir los mensajes a `LoginRequestSchema` → mezcla textos de UI con el contrato de la API. Descartada.

### 5. Formulario sin validación nativa, inputs con su tipo
`<form noValidate>` desactiva los avisos nativos. Los inputs conservan `type="email"`, `type="password"` y `autoComplete`, que siguen dando el teclado móvil adecuado y el autocompletado.

### 6. Integración con `useLogin`
`handleSubmit((data) => submit(data, { onSuccess }))`. El botón usa `isPending` de la mutación, no `formState.isSubmitting`, porque `mutate` no devuelve una promesa y el control de sin conexión vive en `useLogin`. El error de API sigue en el `role="alert"` del formulario, separado de los errores por campo.

## Risks / Trade-offs

- [`TextField` sin `ref` rompe el foco al primer error] → Lo cubre el test de foco de `LoginForm` (spec `auth`, "Campos vacíos").
- [El orden de `register` distinto del orden visual enfoca el campo equivocado] → Convención documentada en el README: registrar en el orden visual.
- [Tests con `user-event` y validación asíncrona de `zodResolver`] → Esperar los mensajes con `findBy*` en lugar de `getBy*`.
- [Los tests que usaban `toBeInvalid()` dejan de valer con `noValidate`] → Se reescriben contra los mensajes, `aria-invalid` y el foco, que es lo que exige la spec.

## Migration Plan

Se aplica después de `adopt-tailwind` y `add-typed-contracts`. Un único PR. Rollback: revertir el PR; no hay datos ni APIs afectadas.
