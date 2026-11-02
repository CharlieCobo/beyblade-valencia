import type { FormEvent } from 'react'
import { HttpError } from '@/shared/api/httpClient'
import { useLogin } from '../hooks/useLogin'

interface LoginFormProps {
  /** Se llama tras guardar la sesión. */
  onSuccess?: () => void
}

function errorMessage(error: Error): string {
  if (error instanceof HttpError && error.status === 401) return 'Correo o contraseña incorrectos'
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.'
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { submit, isOffline, isPending, error } = useLogin()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    submit({ email: String(data.get('email')), password: String(data.get('password')) }, { onSuccess })
  }

  const message = isOffline
    ? 'Sin conexión. Revisa tu conexión e inténtalo de nuevo.'
    : error
      ? errorMessage(error)
      : null

  return (
    <form className="login-form" aria-label="Iniciar sesión" onSubmit={handleSubmit}>
      <label className="field">
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>

      <label className="field">
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>

      {message && (
        <p role="alert" className="form-error">
          {message}
        </p>
      )}

      <button type="submit" className="button button--primary" disabled={isPending}>
        {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
