import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { apiUrl } from '@/shared/api/httpClient'
import { LOGIN_PATH } from '../api/auth.api'
import { TEST_USER } from '../mocks/authUser.factory'
import { useAuthStore } from '../store/auth.store'
import { useLogin } from './useLogin'

const credentials = { email: TEST_USER.email, password: TEST_USER.password }

function renderUseLogin() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useLogin(), { wrapper })
}

describe('useLogin', () => {
  it('guarda la sesión al iniciar sesión correctamente', async () => {
    const onSuccess = vi.fn<() => void>()
    const { result } = renderUseLogin()

    act(() => result.current.submit(credentials, { onSuccess }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(useAuthStore.getState().email).toBe('test@mail.com')
    expect(result.current.error).toBeNull()
  })

  it('expone el 401 sin guardar sesión', async () => {
    const { result } = renderUseLogin()

    act(() => result.current.submit({ ...credentials, password: 'otra' }))

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 401 }))
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('sin conexión no envía la petición ni la reanuda al volver la red', async () => {
    const onLogin = vi.fn<() => void>()
    server.use(
      http.post(apiUrl(LOGIN_PATH), () => {
        onLogin()
        return HttpResponse.json({ accessToken: 'x' })
      }),
    )
    onlineManager.setOnline(false)
    const { result } = renderUseLogin()

    act(() => result.current.submit(credentials))

    expect(result.current.isOffline).toBe(true)
    expect(result.current.isPending).toBe(false)

    act(() => onlineManager.setOnline(true))
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(onLogin).not.toHaveBeenCalled()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('al reintentar con conexión quita el aviso sin conexión', async () => {
    onlineManager.setOnline(false)
    const { result } = renderUseLogin()
    act(() => result.current.submit(credentials))
    expect(result.current.isOffline).toBe(true)

    onlineManager.setOnline(true)
    act(() => result.current.submit(credentials))

    expect(result.current.isOffline).toBe(false)
    await waitFor(() => expect(useAuthStore.getState().token).not.toBeNull())
  })
})
