import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFakeJwt, buildTokenPayload } from '../mocks/jwt'
import { useAuthStore } from '../store/auth.store'
import { useUser } from './useUser'

const NOW = new Date('2026-11-02T10:00:00Z')
const nowSeconds = NOW.getTime() / 1000

describe('useUser', () => {
  afterEach(() => vi.useRealTimers())

  it('sin sesión se considera expirado', () => {
    const { result } = renderHook(() => useUser())

    expect(result.current).toEqual({ token: null, email: null, isExpired: true })
  })

  it('con una sesión vigente devuelve el token y el correo', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    const token = buildFakeJwt(buildTokenPayload({ iat: nowSeconds, exp: nowSeconds + 60 }))
    useAuthStore.getState().setSession(token)

    const { result } = renderHook(() => useUser())

    expect(result.current).toEqual({ token, email: 'test@mail.com', isExpired: false })
  })

  it('con una sesión caducada indica que ha expirado', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload({ iat: nowSeconds - 3600, exp: nowSeconds })))

    const { result } = renderHook(() => useUser())

    expect(result.current.isExpired).toBe(true)
  })

  it('se actualiza cuando cambia la sesión', () => {
    const { result } = renderHook(() => useUser())

    act(() => useAuthStore.getState().setSession(buildFakeJwt(buildTokenPayload())))

    expect(result.current.isExpired).toBe(false)
  })
})
