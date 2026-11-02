import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { fakeAuth } from '../mocks/fakeAuthGateway'
import { TEST_ACCOUNT } from '../mocks/userProfile.factory'
import { useAuthStore } from '../store/auth.store'
import { LogoutButton } from './LogoutButton'

describe('LogoutButton', () => {
  it('cierra la sesión y lleva al login', async () => {
    const sessionUser = await fakeAuth.signIn({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password })
    useAuthStore.getState().setSignedIn(sessionUser)
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/" element={<LogoutButton />} />
        <Route path="/login" element={<p>página de login</p>} />
      </Routes>,
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('página de login')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('signedOut')
  })
})
