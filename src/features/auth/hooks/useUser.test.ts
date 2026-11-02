import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '../store/auth.store'
import { useUser } from './useUser'

describe('useUser', () => {
  it('sin sesión no tiene correo ni rol', () => {
    const { result } = renderHook(() => useUser())

    expect(result.current).toEqual({ status: 'signedOut', email: null, role: null })
  })

  it('mientras se comprueba la sesión lo indica', () => {
    useAuthStore.setState({ status: 'checking', user: null })

    const { result } = renderHook(() => useUser())

    expect(result.current.status).toBe('checking')
  })

  it('con sesión devuelve el correo y el rol', () => {
    useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'juez@mail.com', role: 'JUDGE' })

    const { result } = renderHook(() => useUser())

    expect(result.current).toEqual({ status: 'signedIn', email: 'juez@mail.com', role: 'JUDGE' })
  })

  it('se actualiza cuando cambia la sesión', () => {
    const { result } = renderHook(() => useUser())

    act(() => useAuthStore.getState().setSignedIn({ uid: 'u1', email: 'a@b.es', role: 'ADMIN' }))

    expect(result.current.role).toBe('ADMIN')
  })
})
