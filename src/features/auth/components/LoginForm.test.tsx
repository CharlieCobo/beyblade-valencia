import { onlineManager } from '@tanstack/react-query'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { apiUrl } from '@/shared/api/httpClient'
import { renderWithProviders, screen } from '@/test/test-utils'
import { LOGIN_PATH } from '../api/auth.api'
import { TEST_USER } from '../mocks/authUser.factory'
import { useAuthStore } from '../store/auth.store'
import { LoginForm } from './LoginForm'

function spyOnLogin() {
  const onRequest = vi.fn<() => void>()
  server.events.on('request:start', ({ request }) => {
    if (request.url === apiUrl(LOGIN_PATH)) onRequest()
  })
  return onRequest
}

async function fillAndSubmit(user: ReturnType<typeof renderWithProviders>['user'], email: string, password: string) {
  if (email) await user.type(screen.getByLabelText(/correo/i), email)
  if (password) await user.type(screen.getByLabelText(/contraseña/i), password)
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
}

describe('LoginForm', () => {
  afterEach(() => server.events.removeAllListeners())

  it('muestra los campos de correo y contraseña', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText(/correo/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
  })

  it('no envía la petición con los campos vacíos', async () => {
    const onRequest = spyOnLogin()
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, '', '')

    expect(screen.getByLabelText(/correo/i)).toBeInvalid()
    expect(screen.getByLabelText(/contraseña/i)).toBeInvalid()
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('no envía la petición con un correo inválido', async () => {
    const onRequest = spyOnLogin()
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, 'test-mail.com', 'Test1234!')

    expect(screen.getByLabelText(/correo/i)).toBeInvalid()
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('inicia sesión con el usuario de prueba', async () => {
    const onSuccess = vi.fn<() => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit(user, TEST_USER.email, TEST_USER.password)

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(useAuthStore.getState().email).toBe(TEST_USER.email)
  })

  it('indica que se está enviando y no permite reenviar', async () => {
    server.use(
      http.post(apiUrl(LOGIN_PATH), async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_USER.email, TEST_USER.password)

    expect(await screen.findByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled()
  })

  it('muestra un mensaje genérico ante credenciales incorrectas', async () => {
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_USER.email, 'otra-contraseña')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('muestra un error genérico si el servidor falla', async () => {
    server.use(http.post(apiUrl(LOGIN_PATH), () => new HttpResponse(null, { status: 500 })))
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_USER.email, TEST_USER.password)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión. Inténtalo de nuevo.')
  })

  it('avisa de que no hay conexión y no envía la petición', async () => {
    const onRequest = spyOnLogin()
    onlineManager.setOnline(false)
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_USER.email, TEST_USER.password)

    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión. Revisa tu conexión e inténtalo de nuevo.')
    expect(onRequest).not.toHaveBeenCalled()
  })
})
