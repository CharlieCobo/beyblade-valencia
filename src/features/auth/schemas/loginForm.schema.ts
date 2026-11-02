import { z } from 'zod'

/**
 * Esquema del formulario de login: mensajes para el usuario y transformaciones de entrada.
 * Es distinto del contrato de las credenciales (`CredentialsSchema`), pero su salida tiene la misma forma.
 */
export const LoginFormSchema = z.object({
  email: z.string().trim().min(1, 'Introduce tu correo').pipe(z.email('Introduce un correo válido')),
  // Sin trim: los espacios pueden formar parte de la contraseña.
  password: z.string().min(1, 'Introduce tu contraseña'),
})

/** Lo que el usuario escribe. */
export type LoginFormValues = z.input<typeof LoginFormSchema>
/** Lo que se usa para iniciar sesión, ya transformado. */
export type LoginFormOutput = z.output<typeof LoginFormSchema>
