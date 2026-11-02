import type { AuthGateway, SessionChange } from '../api/authGateway'
import { InvalidCredentialsError } from '../api/errors'
import { toSessionUser } from '../api/session'
import type { SessionUser } from '../schemas/auth.schema'
import { TEST_ACCOUNT } from './userProfile.factory'

interface FakeAccount {
  uid: string
  email: string
  password: string
  /** Perfil almacenado tal cual: `undefined` = sin perfil; puede no cumplir el contrato a propósito. */
  profile?: unknown
}

/** Servicio de autenticación en memoria para los tests. `src/test/setup.ts` lo reinicia antes de cada test. */
export interface FakeAuthGateway extends AuthGateway {
  /** Cuentas existentes. Tras `reset()` solo existe `TEST_ACCOUNT`. */
  addAccount(account: FakeAccount): void
  /** Arranca con la sesión de `email` ya iniciada (como si se recargara la página con sesión). */
  startSignedIn(email?: string): void
  /** Deja la comprobación inicial de la sesión sin responder. */
  holdSessionCheck(): void
  /** El próximo `signIn` falla con `error`. */
  failNextSignIn(error: Error): void
  /** El próximo `signIn` no responde nunca. */
  holdNextSignIn(): void
  /** Credenciales de cada `signIn` recibido. */
  readonly signInCalls: { email: string; password: string }[]
  reset(): void
}

export function createFakeAuthGateway(): FakeAuthGateway {
  let accounts: FakeAccount[] = []
  let current: SessionUser | null = null
  let sessionCheckHeld = false
  let nextSignIn: { kind: 'fail'; error: Error } | { kind: 'hold' } | null = null
  const listeners = new Set<(change: SessionChange) => void>()
  const signInCalls: { email: string; password: string }[] = []

  function snapshot(): SessionChange {
    return current ? { status: 'signedIn', user: current } : { status: 'signedOut' }
  }

  function emit() {
    for (const listener of listeners) listener(snapshot())
  }

  function sessionUserOf(account: FakeAccount): SessionUser {
    return toSessionUser(account.uid, account.email, account.profile)
  }

  const fake: FakeAuthGateway = {
    signInCalls,

    async signIn(credentials) {
      signInCalls.push({ ...credentials })
      const pending = nextSignIn
      nextSignIn = null
      if (pending?.kind === 'hold') return new Promise<SessionUser>(() => undefined)
      if (pending?.kind === 'fail') throw pending.error

      const account = accounts.find((candidate) => candidate.email === credentials.email)
      if (!account || account.password !== credentials.password) throw new InvalidCredentialsError()

      current = sessionUserOf(account)
      emit()
      return current
    },

    async signOut() {
      current = null
      emit()
    },

    onSessionChange(listener) {
      listeners.add(listener)
      if (!sessionCheckHeld) queueMicrotask(() => listeners.has(listener) && listener(snapshot()))
      return () => listeners.delete(listener)
    },

    addAccount(account) {
      accounts = [...accounts.filter((existing) => existing.email !== account.email), account]
    },

    startSignedIn(email = TEST_ACCOUNT.email) {
      const account = accounts.find((candidate) => candidate.email === email)
      if (!account) throw new Error(`No existe la cuenta ${email} en el fake`)
      current = sessionUserOf(account)
    },

    holdSessionCheck() {
      sessionCheckHeld = true
    },

    failNextSignIn(error) {
      nextSignIn = { kind: 'fail', error }
    },

    holdNextSignIn() {
      nextSignIn = { kind: 'hold' }
    },

    reset() {
      accounts = [{ ...TEST_ACCOUNT }]
      current = null
      sessionCheckHeld = false
      nextSignIn = null
      listeners.clear()
      signInCalls.length = 0
    },
  }

  fake.reset()
  return fake
}

/** Instancia que comparten `src/test/setup.ts` y los tests. */
export const fakeAuth = createFakeAuthGateway()
