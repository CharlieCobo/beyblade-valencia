import { describe, expect, it, vi } from 'vitest'
import type { SessionChange } from '../api/authGateway'
import { AccountNotEnabledError, InvalidCredentialsError } from '../api/errors'
import { createFakeAuthGateway } from './fakeAuthGateway'
import { TEST_ACCOUNT } from './userProfile.factory'

const credentials = { email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }

describe('fakeAuthGateway', () => {
  it('inicia sesión con la cuenta de prueba y avisa a los oyentes', async () => {
    const fake = createFakeAuthGateway()
    const listener = vi.fn<(change: SessionChange) => void>()
    fake.onSessionChange(listener)

    const user = await fake.signIn(credentials)

    expect(user).toEqual({ uid: TEST_ACCOUNT.uid, email: TEST_ACCOUNT.email, role: 'MEMBER' })
    expect(listener).toHaveBeenLastCalledWith({ status: 'signedIn', user })
    expect(fake.signInCalls).toEqual([credentials])
  })

  it('rechaza una contraseña equivocada o un correo inexistente', async () => {
    const fake = createFakeAuthGateway()

    await expect(fake.signIn({ ...credentials, password: 'otra' })).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(fake.signIn({ ...credentials, email: 'nadie@mail.com' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('rechaza una cuenta sin perfil o con un rol inválido', async () => {
    const fake = createFakeAuthGateway()
    fake.addAccount({ uid: 'u2', email: 'sin@perfil.es', password: 'x' })
    fake.addAccount({ uid: 'u3', email: 'rol@raro.es', password: 'x', profile: { role: 'SUPERUSER' } })

    await expect(fake.signIn({ email: 'sin@perfil.es', password: 'x' })).rejects.toBeInstanceOf(AccountNotEnabledError)
    await expect(fake.signIn({ email: 'rol@raro.es', password: 'x' })).rejects.toBeInstanceOf(AccountNotEnabledError)
  })

  it('comunica la sesión inicial al suscribirse', async () => {
    const fake = createFakeAuthGateway()
    fake.startSignedIn()
    const listener = vi.fn<(change: SessionChange) => void>()

    fake.onSessionChange(listener)

    await vi.waitFor(() => expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 'signedIn' })))
  })

  it('puede dejar la comprobación inicial sin responder', async () => {
    const fake = createFakeAuthGateway()
    fake.holdSessionCheck()
    const listener = vi.fn<(change: SessionChange) => void>()

    fake.onSessionChange(listener)
    await Promise.resolve()

    expect(listener).not.toHaveBeenCalled()
  })

  it('al cerrar sesión avisa de que no hay sesión', async () => {
    const fake = createFakeAuthGateway()
    await fake.signIn(credentials)
    const listener = vi.fn<(change: SessionChange) => void>()
    fake.onSessionChange(listener)

    await fake.signOut()

    expect(listener).toHaveBeenLastCalledWith({ status: 'signedOut' })
  })

  it('failNextSignIn afecta solo al siguiente intento', async () => {
    const fake = createFakeAuthGateway()
    fake.failNextSignIn(new Error('caído'))

    await expect(fake.signIn(credentials)).rejects.toThrow('caído')
    await expect(fake.signIn(credentials)).resolves.toMatchObject({ role: 'MEMBER' })
  })
})
