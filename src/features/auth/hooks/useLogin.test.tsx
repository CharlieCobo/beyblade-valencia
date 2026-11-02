import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AccountNotEnabledError, InvalidCredentialsError } from '../api/errors'
import { fakeAuth } from '../mocks/fakeAuthGateway'
import { TEST_ACCOUNT } from '../mocks/userProfile.factory'
import { useAuthStore } from '../store/auth.store'
import { useLogin } from './useLogin'

const credentials = { email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }

function renderUseLogin() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useLogin(), { wrapper })
}

describe('useLogin', () => {
  it('inicia la sesión con el correo y el rol al iniciar sesión correctamente', async () => {
    const onSuccess = vi.fn<() => void>()
    const { result } = renderUseLogin()

    act(() => result.current.submit(credentials, { onSuccess }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(useAuthStore.getState()).toMatchObject({
      status: 'signedIn',
      user: { email: TEST_ACCOUNT.email, role: 'MEMBER' },
    })
    expect(result.current.error).toBeNull()
  })

  it('expone las credenciales incorrectas sin iniciar sesión', async () => {
    const { result } = renderUseLogin()

    act(() => result.current.submit({ ...credentials, password: 'otra' }))

    await waitFor(() => expect(result.current.error).toBeInstanceOf(InvalidCredentialsError))
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('expone una cuenta no habilitada sin iniciar sesión', async () => {
    fakeAuth.addAccount({ uid: 'u2', email: 'sin@perfil.es', password: 'x' })
    const { result } = renderUseLogin()

    act(() => result.current.submit({ email: 'sin@perfil.es', password: 'x' }))

    await waitFor(() => expect(result.current.error).toBeInstanceOf(AccountNotEnabledError))
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('sin conexión no intenta iniciar sesión ni lo reanuda al volver la red', async () => {
    onlineManager.setOnline(false)
    const { result } = renderUseLogin()

    act(() => result.current.submit(credentials))

    expect(result.current.isOffline).toBe(true)
    expect(result.current.isPending).toBe(false)

    act(() => onlineManager.setOnline(true))
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(fakeAuth.signInCalls).toEqual([])
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('al reintentar con conexión quita el aviso sin conexión', async () => {
    onlineManager.setOnline(false)
    const { result } = renderUseLogin()
    act(() => result.current.submit(credentials))
    expect(result.current.isOffline).toBe(true)

    onlineManager.setOnline(true)
    act(() => result.current.submit(credentials))

    expect(result.current.isOffline).toBe(false)
    await waitFor(() => expect(useAuthStore.getState().status).toBe('signedIn'))
  })
})
