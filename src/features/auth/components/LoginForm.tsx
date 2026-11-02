import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/ui/Button'
import { TextField } from '@/shared/ui/TextField'
import { AccountNotEnabledError, InvalidCredentialsError } from '../api/errors'
import { useLogin } from '../hooks/useLogin'
import { LoginFormSchema, type LoginFormOutput, type LoginFormValues } from '../schemas/loginForm.schema'

interface LoginFormProps {
  /** Se llama tras guardar la sesión. */
  onSuccess?: () => void
}

function errorMessage(error: Error): string {
  if (error instanceof InvalidCredentialsError) return 'Correo o contraseña incorrectos'
  if (error instanceof AccountNotEnabledError) return 'Tu cuenta no está habilitada. Contacta con un administrador.'
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.'
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { submit, isOffline, isPending, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues, unknown, LoginFormOutput>({
    resolver: zodResolver(LoginFormSchema),
    // Error al salir del campo (o al enviar) y, a partir de ahí, se revalida al escribir.
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  const message = isOffline
    ? 'Sin conexión. Revisa tu conexión e inténtalo de nuevo.'
    : error
      ? errorMessage(error)
      : null

  return (
    <form
      className="grid gap-4"
      aria-label="Iniciar sesión"
      noValidate
      onSubmit={handleSubmit((credentials) => submit(credentials, { onSuccess }))}
    >
      {/* Se registran en el orden visual: al enviar con errores, el foco va al primero inválido. */}
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {message && (
        <p role="alert" className="m-0 rounded-md border-l-4 border-danger bg-danger/12 px-3 py-2">
          {message}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
