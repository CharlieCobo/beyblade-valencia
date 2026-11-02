import { onlineManager } from '@tanstack/react-query'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { apiUrl } from '@/shared/api/httpClient'
import { renderWithProviders, screen } from '@/test/test-utils'
import { LOGIN_PATH } from '../api/auth.api'
import { TEST_USER } from '../mocks/authUser.factory'
import { AUTH_STORAGE_KEY, useAuthStore } from '../store/auth.store'
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

  describe('validación', () => {
    const email = () => screen.getByLabelText(/correo/i)
    const password = () => screen.getByLabelText(/contraseña/i)

    it('no muestra errores al abrir el formulario', () => {
      renderWithProviders(<LoginForm />)

      expect(email()).not.toHaveAttribute('aria-invalid')
      expect(password()).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByText(/^Introduce/)).not.toBeInTheDocument()
    })

    it('con los campos vacíos muestra los mensajes, enfoca el correo y no envía la petición', async () => {
      const onRequest = spyOnLogin()
      const { user } = renderWithProviders(<LoginForm />)

      await fillAndSubmit(user, '', '')

      expect(await screen.findByText('Introduce tu correo')).toBeInTheDocument()
      expect(screen.getByText('Introduce tu contraseña')).toBeInTheDocument()
      expect(email()).toHaveAttribute('aria-invalid', 'true')
      expect(email()).toHaveAccessibleDescription('Introduce tu correo')
      expect(password()).toHaveAttribute('aria-invalid', 'true')
      expect(password()).toHaveAccessibleDescription('Introduce tu contraseña')
      expect(email()).toHaveFocus()
      expect(onRequest).not.toHaveBeenCalled()
    })

    it('con un correo inválido pide uno válido y no envía la petición', async () => {
      const onRequest = spyOnLogin()
      const { user } = renderWithProviders(<LoginForm />)

      await fillAndSubmit(user, 'test-mail.com', 'Test1234!')

      expect(await screen.findByText('Introduce un correo válido')).toBeInTheDocument()
      expect(email()).toHaveFocus()
      expect(onRequest).not.toHaveBeenCalled()
    })

    it('no muestra el error mientras se escribe por primera vez en un campo', async () => {
      const { user } = renderWithProviders(<LoginForm />)

      await user.type(email(), 'test-mail')

      expect(email()).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByText('Introduce un correo válido')).not.toBeInTheDocument()
    })

    it('muestra el error al salir del campo sin mostrar los de los campos no tocados', async () => {
      const { user } = renderWithProviders(<LoginForm />)

      await user.type(email(), 'test-mail.com')
      await user.tab()

      expect(await screen.findByText('Introduce un correo válido')).toBeInTheDocument()
      expect(email()).toHaveAttribute('aria-invalid', 'true')
      expect(password()).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByText('Introduce tu contraseña')).not.toBeInTheDocument()
    })

    it('quita el error en cuanto el valor es válido, sin salir del campo', async () => {
      const { user } = renderWithProviders(<LoginForm />)
      await user.type(email(), 'test')
      await user.tab()
      expect(await screen.findByText('Introduce un correo válido')).toBeInTheDocument()

      await user.click(email())
      await user.type(email(), '@mail.com')

      await vi.waitFor(() => expect(screen.queryByText('Introduce un correo válido')).not.toBeInTheDocument())
      expect(email()).not.toHaveAttribute('aria-invalid')
      expect(email()).toHaveFocus()
    })

    it('envía el correo sin los espacios de alrededor', async () => {
      const bodies: unknown[] = []
      server.events.on('request:start', async ({ request }) => {
        if (request.url === apiUrl(LOGIN_PATH)) bodies.push(await request.clone().json())
      })
      const onSuccess = vi.fn<() => void>()
      const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

      await fillAndSubmit(user, ` ${TEST_USER.email} `, TEST_USER.password)

      await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled())
      expect(bodies).toEqual([{ email: TEST_USER.email, password: TEST_USER.password }])
    })
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

  it('muestra un error genérico y no guarda sesión si el token recibido no es válido', async () => {
    server.use(http.post(apiUrl(LOGIN_PATH), () => HttpResponse.json({ accessToken: 'no-es-un-jwt' })))
    const onSuccess = vi.fn<() => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit(user, TEST_USER.email, TEST_USER.password)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión. Inténtalo de nuevo.')
    expect(useAuthStore.getState().token).toBeNull()
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}').state?.token ?? null).toBeNull()
    expect(onSuccess).not.toHaveBeenCalled()
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
