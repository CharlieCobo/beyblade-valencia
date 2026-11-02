import '@testing-library/jest-dom/vitest'
import { onlineManager } from '@tanstack/react-query'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { setAuthGateway } from '@/features/auth/api/authGateway'
import { fakeAuth } from '@/features/auth/mocks/fakeAuthGateway'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { setBeybladesRepository } from '@/features/beyblades/api/beybladesRepository'
import { fakeBeyblades } from '@/features/beyblades/mocks/fakeBeybladesRepository'

// Cada test empieza con el acceso a datos en memoria (nunca se conecta con Firebase),
// sin sesión, con conexión y con el almacenamiento vacío.
beforeEach(() => {
  fakeAuth.reset()
  setAuthGateway(fakeAuth)
  fakeBeyblades.reset()
  setBeybladesRepository(fakeBeyblades)
  useAuthStore.setState({ status: 'signedOut', user: null })
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  onlineManager.setOnline(true)
})
