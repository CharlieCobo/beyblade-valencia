# Proposal

## Why

Los formularios dependen de la validación nativa del navegador: los mensajes no se pueden personalizar ni traducir de forma consistente, no se muestran junto al campo y el estado (valores, campos tocados, errores) se gestiona a mano leyendo `FormData`. Vienen formularios más grandes (perfil, inscripción a torneos, combos con listas dinámicas), así que conviene fijar ahora un patrón único, accesible y tipado, apoyado en los esquemas de Zod que introduce `add-typed-contracts`.

## What Changes

- **React Hook Form** para el estado de los formularios, con **`zodResolver`** (`@hookform/resolvers/zod`) para validar con esquemas de Zod. Los valores del formulario y los datos que se envían se tipan a partir del esquema (`z.input` y `z.output`).
- `TextField` compartido en `src/shared/ui/`: etiqueta, input y mensaje de error, con `aria-invalid` y `aria-describedby`. Se integra con `register` de React Hook Form, que necesita la `ref` del input para poner el foco.
- Validación "avisar tarde, premiar pronto": los errores aparecen al salir de un campo o al enviar y desaparecen en cuanto el valor es válido. Al enviar con errores, el foco va al primer campo inválido.
- `LoginForm` migra a `useForm` con un esquema de formulario cuya salida cumple el contrato `LoginRequest`. Los errores se muestran bajo cada campo con mensajes en español y el correo se envía sin espacios alrededor.
- **BREAKING (comportamiento)**: el formulario de login deja de usar la validación nativa (`noValidate`) y muestra mensajes propios por campo.

## Capabilities

### New Capabilities

- `forms`: Comportamiento común de los formularios: validación propia frente a la nativa, cuándo aparecen y desaparecen los errores, foco al primer campo inválido, accesibilidad de los errores y bloqueo del envío con errores.

### Modified Capabilities

- `auth`: el requisito "Formulario de inicio de sesión" pasa de la validación nativa a mensajes propios por campo ("Introduce tu correo", "Introduce un correo válido", "Introduce tu contraseña") y el correo se envía sin espacios alrededor.

## Impact

- **Dependencias nuevas (ejecución)**: `react-hook-form`, `@hookform/resolvers`. `zod` ya llega con `add-typed-contracts`.
- **Código**:
  - Nuevo `src/shared/ui/TextField.tsx`.
  - `src/features/auth/`: `components/LoginForm.tsx` y nuevo `schemas/loginForm.schema.ts`.
  - `README.md`: sección "Formularios" con el patrón.
- **Tests**: los de `LoginForm` que comprobaban la validación nativa (`toBeInvalid`) pasan a comprobar los mensajes, `aria-invalid` y el foco.
- **Depende de**:
  - `adopt-tailwind`: estilos, tokens y `Button`.
  - `add-typed-contracts`: Zod y `LoginRequestSchema`.

  Se aplica después de ambos.
- **Fuera de alcance**:
  - Formularios o pantallas nuevas.
  - Componentes para otros tipos de campo (select, checkbox, listas dinámicas), que se añadirán cuando haga falta.
  - Validación asíncrona contra el servidor.
