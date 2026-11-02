import '@testing-library/jest-dom/vitest'
import { onlineManager } from '@tanstack/react-query'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { EMPTY_SESSION, useAuthStore } from '@/features/auth/store/auth.store'
import { server } from '@/mocks/server'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  // Cada test empieza sin sesión y con conexión.
  localStorage.clear()
  useAuthStore.setState(EMPTY_SESSION)
  onlineManager.setOnline(true)
})

afterAll(() => server.close())
