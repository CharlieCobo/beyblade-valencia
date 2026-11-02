import type { FormEvent } from 'react'
import { HttpError } from '@/shared/api/httpClient'
import { Button } from '@/shared/ui/Button'
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
    <form className="grid gap-4" aria-label="Iniciar sesión" onSubmit={handleSubmit}>
      <label className="grid gap-[0.35rem]">
        <span>Correo electrónico</span>
        <input
          className="rounded-lg border border-foreground/30 bg-background px-[0.7rem] py-[0.55rem] text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-[0.35rem]">
        <span>Contraseña</span>
        <input
          className="rounded-lg border border-foreground/30 bg-background px-[0.7rem] py-[0.55rem] text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

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
