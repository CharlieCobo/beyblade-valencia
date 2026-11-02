import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, firestore } from '@/shared/firebase/app'
import type { SessionUser } from '../schemas/auth.schema'
import type { AuthGateway } from './authGateway'
import { AccountNotEnabledError } from './errors'
import {
  clearCachedProfile,
  isPermissionDenied,
  isUnavailable,
  PROFILES_COLLECTION,
  readCachedProfile,
  toSessionUser,
  toSignInError,
  writeCachedProfile,
} from './session'

/** Lee y valida el perfil de `user`. Sin conexión usa el último perfil validado de esa misma cuenta. */
async function loadSessionUser(user: User): Promise<SessionUser> {
  try {
    const snapshot = await getDoc(doc(firestore(), PROFILES_COLLECTION, user.uid))
    const sessionUser = toSessionUser(user.uid, user.email, snapshot.exists() ? snapshot.data() : undefined)
    writeCachedProfile(sessionUser)
    return sessionUser
  } catch (error) {
    if (error instanceof AccountNotEnabledError) throw error
    if (isPermissionDenied(error)) throw new AccountNotEnabledError()
    const cachedRole = isUnavailable(error) ? readCachedProfile(user.uid) : null
    if (cachedRole) return { uid: user.uid, email: user.email ?? '', role: cachedRole }
    throw error
  }
}

async function signOutDisabledAccount(): Promise<void> {
  clearCachedProfile()
  await firebaseSignOut(firebaseAuth())
}

export const firebaseAuthGateway: AuthGateway = {
  async signIn({ email, password }) {
    let user: User
    try {
      user = (await signInWithEmailAndPassword(firebaseAuth(), email, password)).user
    } catch (error) {
      throw toSignInError(error)
    }

    try {
      return await loadSessionUser(user)
    } catch (error) {
      if (error instanceof AccountNotEnabledError) await signOutDisabledAccount()
      throw error
    }
  },

  async signOut() {
    clearCachedProfile()
    await firebaseSignOut(firebaseAuth())
  },

  onSessionChange(listener) {
    return onAuthStateChanged(firebaseAuth(), (user) => {
      if (!user) {
        listener({ status: 'signedOut' })
        return
      }
      loadSessionUser(user)
        .then((sessionUser) => listener({ status: 'signedIn', user: sessionUser }))
        .catch(async (error: unknown) => {
          if (error instanceof AccountNotEnabledError) await signOutDisabledAccount().catch(() => undefined)
          listener({ status: 'signedOut' })
        })
    })
  },
}
