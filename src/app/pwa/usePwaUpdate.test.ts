import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePwaUpdate } from './usePwaUpdate'

const updateServiceWorker = vi.fn<(reloadPage?: boolean) => Promise<void>>(async () => {})
let initialNeedRefresh = false

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: useState(initialNeedRefresh),
    offlineReady: useState(false),
    updateServiceWorker,
  }),
}))

describe('usePwaUpdate', () => {
  beforeEach(() => {
    updateServiceWorker.mockClear()
    initialNeedRefresh = false
  })

  it('no pide actualizar si no hay una versión nueva', () => {
    const { result } = renderHook(() => usePwaUpdate())

    expect(result.current.needRefresh).toBe(false)
  })

  it('update activa la nueva versión del service worker', () => {
    initialNeedRefresh = true
    const { result } = renderHook(() => usePwaUpdate())

    expect(result.current.needRefresh).toBe(true)
    act(() => result.current.update())

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('dismiss oculta el aviso sin actualizar', () => {
    initialNeedRefresh = true
    const { result } = renderHook(() => usePwaUpdate())

    act(() => result.current.dismiss())

    expect(result.current.needRefresh).toBe(false)
    expect(updateServiceWorker).not.toHaveBeenCalled()
  })
})
