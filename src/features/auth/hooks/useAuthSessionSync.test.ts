import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LEGACY_SESSION_KEY } from '../api/session'
import { fakeAuth } from '../mocks/fakeAuthGateway'
import { TEST_ACCOUNT } from '../mocks/userProfile.factory'
import { useAuthStore } from '../store/auth.store'
import { useAuthSessionSync } from './useAuthSessionSync'

describe('useAuthSessionSync', () => {
  it('refleja una sesión recuperada al arrancar', async () => {
    useAuthStore.setState({ status: 'checking' })
    fakeAuth.startSignedIn()

    renderHook(() => useAuthSessionSync())

    await waitFor(() => expect(useAuthStore.getState().status).toBe('signedIn'))
    expect(useAuthStore.getState().user).toMatchObject({ email: TEST_ACCOUNT.email, role: 'MEMBER' })
  })

  it('pasa a sin sesión si no la hay', async () => {
    useAuthStore.setState({ status: 'checking' })

    renderHook(() => useAuthSessionSync())

    await waitFor(() => expect(useAuthStore.getState().status).toBe('signedOut'))
  })

  it('sigue los cambios posteriores', async () => {
    renderHook(() => useAuthSessionSync())
    await fakeAuth.signIn({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password })
    expect(useAuthStore.getState().status).toBe('signedIn')

    await fakeAuth.signOut()

    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('borra la sesión guardada por la versión anterior', () => {
    localStorage.setItem(LEGACY_SESSION_KEY, '{"state":{"token":"abc"}}')

    renderHook(() => useAuthSessionSync())

    expect(localStorage.getItem(LEGACY_SESSION_KEY)).toBeNull()
  })
})
