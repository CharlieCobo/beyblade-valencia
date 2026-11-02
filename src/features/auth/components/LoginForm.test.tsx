import { onlineManager } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { fakeAuth } from '../mocks/fakeAuthGateway'
import { TEST_ACCOUNT } from '../mocks/userProfile.factory'
import { useAuthStore } from '../store/auth.store'
import { LoginForm } from './LoginForm'

async function fillAndSubmit(user: ReturnType<typeof renderWithProviders>['user'], email: string, password: string) {
  if (email) await user.type(screen.getByLabelText(/correo/i), email)
  if (password) await user.type(screen.getByLabelText(/contraseña/i), password)
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
}

describe('LoginForm', () => {
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

    it('con los campos vacíos muestra los mensajes, enfoca el correo y no intenta iniciar sesión', async () => {
      const { user } = renderWithProviders(<LoginForm />)

      await fillAndSubmit(user, '', '')

      expect(await screen.findByText('Introduce tu correo')).toBeInTheDocument()
      expect(screen.getByText('Introduce tu contraseña')).toBeInTheDocument()
      expect(email()).toHaveAttribute('aria-invalid', 'true')
      expect(email()).toHaveAccessibleDescription('Introduce tu correo')
      expect(password()).toHaveAttribute('aria-invalid', 'true')
      expect(password()).toHaveAccessibleDescription('Introduce tu contraseña')
      expect(email()).toHaveFocus()
      expect(fakeAuth.signInCalls).toEqual([])
    })

    it('con un correo inválido pide uno válido y no intenta iniciar sesión', async () => {
      const { user } = renderWithProviders(<LoginForm />)

      await fillAndSubmit(user, 'test-mail.com', 'Test1234!')

      expect(await screen.findByText('Introduce un correo válido')).toBeInTheDocument()
      expect(email()).toHaveFocus()
      expect(fakeAuth.signInCalls).toEqual([])
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

    it('inicia sesión con el correo sin los espacios de alrededor', async () => {
      const onSuccess = vi.fn<() => void>()
      const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

      await fillAndSubmit(user, ` ${TEST_ACCOUNT.email} `, TEST_ACCOUNT.password)

      await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled())
      expect(fakeAuth.signInCalls).toEqual([{ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }])
    })
  })

  it('inicia sesión con una cuenta habilitada', async () => {
    const onSuccess = vi.fn<() => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit(user, TEST_ACCOUNT.email, TEST_ACCOUNT.password)

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(useAuthStore.getState().user).toMatchObject({ email: TEST_ACCOUNT.email, role: 'MEMBER' })
  })

  it('indica que se está enviando y no permite reenviar', async () => {
    fakeAuth.holdNextSignIn()
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_ACCOUNT.email, TEST_ACCOUNT.password)

    expect(await screen.findByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled()
  })

  it('muestra un mensaje genérico ante una contraseña equivocada', async () => {
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_ACCOUNT.email, 'otra-contraseña')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('muestra el mismo mensaje ante un correo inexistente', async () => {
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, 'nadie@mail.com', TEST_ACCOUNT.password)

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
  })

  it.each([
    ['sin perfil', undefined],
    ['con un rol desconocido', { role: 'SUPERUSER' }],
  ])('avisa de que la cuenta no está habilitada si está %s', async (_, profile) => {
    fakeAuth.addAccount({ uid: 'u2', email: 'otra@mail.com', password: 'Clave1234!', profile })
    const onSuccess = vi.fn<() => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await fillAndSubmit(user, 'otra@mail.com', 'Clave1234!')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tu cuenta no está habilitada. Contacta con un administrador.',
    )
    expect(useAuthStore.getState().status).toBe('signedOut')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('muestra un error genérico si el servicio falla', async () => {
    fakeAuth.failNextSignIn(Object.assign(new Error('caído'), { code: 'auth/internal-error' }))
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_ACCOUNT.email, TEST_ACCOUNT.password)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión. Inténtalo de nuevo.')
  })

  it('avisa de que no hay conexión y no intenta iniciar sesión', async () => {
    onlineManager.setOnline(false)
    const { user } = renderWithProviders(<LoginForm />)

    await fillAndSubmit(user, TEST_ACCOUNT.email, TEST_ACCOUNT.password)

    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión. Revisa tu conexión e inténtalo de nuevo.')
    expect(fakeAuth.signInCalls).toEqual([])
  })
})
