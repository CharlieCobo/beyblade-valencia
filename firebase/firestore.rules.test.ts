import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

// Escenarios del spec access-control contra el emulador de Firestore (npm run test:rules).

const beyblade = { name: 'Pegasus', type: 'attack', blader: 'Gingka', wins: 3 }

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-lvb',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(() => env.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'users/admin'), { role: 'ADMIN' })
    await setDoc(doc(db, 'users/member'), { role: 'MEMBER' })
    await setDoc(doc(db, 'users/judge'), { role: 'JUDGE' })
    await setDoc(doc(db, 'users/weird'), { role: 'SUPERUSER' })
    await setDoc(doc(db, 'beyblades/b-1'), beyblade)
  })
})

const as = (uid: string) => env.authenticatedContext(uid).firestore()
const anonymous = () => env.unauthenticatedContext().firestore()

describe('lectura de datos solo con perfil', () => {
  it('rechaza la lectura sin sesión', async () => {
    await assertFails(getDoc(doc(anonymous(), 'beyblades/b-1')))
  })

  it('rechaza la lectura de una cuenta sin perfil', async () => {
    await assertFails(getDoc(doc(as('sin-perfil'), 'beyblades/b-1')))
  })

  it('rechaza la lectura de una cuenta con un rol desconocido', async () => {
    await assertFails(getDoc(doc(as('weird'), 'beyblades/b-1')))
  })

  it.each(['member', 'judge', 'admin'])('permite la lectura a %s', async (uid) => {
    await assertSucceeds(getDoc(doc(as(uid), 'beyblades/b-1')))
  })
})

describe('escritura de beyblades reservada a administradores', () => {
  it('un administrador crea, modifica y borra un beyblade', async () => {
    await assertSucceeds(setDoc(doc(as('admin'), 'beyblades/b-2'), beyblade))
    await assertSucceeds(updateDoc(doc(as('admin'), 'beyblades/b-2'), { wins: 4 }))
    await assertSucceeds(deleteDoc(doc(as('admin'), 'beyblades/b-2')))
  })

  it.each(['judge', 'member', 'sin-perfil'])('rechaza que %s modifique un beyblade', async (uid) => {
    await assertFails(updateDoc(doc(as(uid), 'beyblades/b-1'), { wins: 99 }))
  })

  it('rechaza la escritura sin sesión', async () => {
    await assertFails(setDoc(doc(anonymous(), 'beyblades/b-3'), beyblade))
  })
})

describe('gestión de perfiles reservada a administradores', () => {
  it('un miembro lee su propio perfil', async () => {
    await assertSucceeds(getDoc(doc(as('member'), 'users/member')))
  })

  it('una cuenta sin perfil puede comprobar que no lo tiene', async () => {
    await assertSucceeds(getDoc(doc(as('sin-perfil'), 'users/sin-perfil')))
  })

  it('un miembro no puede ascenderse', async () => {
    await assertFails(updateDoc(doc(as('member'), 'users/member'), { role: 'ADMIN' }))
  })

  it('una cuenta sin perfil no puede crearse uno', async () => {
    await assertFails(setDoc(doc(as('sin-perfil'), 'users/sin-perfil'), { role: 'ADMIN' }))
  })

  it('un miembro no lee perfiles ajenos', async () => {
    await assertFails(getDoc(doc(as('member'), 'users/judge')))
  })

  it('un administrador lee cualquier perfil', async () => {
    await assertSucceeds(getDoc(doc(as('admin'), 'users/judge')))
  })

  it('un administrador asigna un rol', async () => {
    await assertSucceeds(setDoc(doc(as('admin'), 'users/nuevo'), { role: 'JUDGE' }))
  })

  it('un administrador no puede asignar un rol desconocido', async () => {
    await assertFails(setDoc(doc(as('admin'), 'users/nuevo'), { role: 'SUPERUSER' }))
  })

  it('un administrador puede borrar un perfil', async () => {
    await assertSucceeds(deleteDoc(doc(as('admin'), 'users/member')))
  })
})

describe('colecciones no previstas', () => {
  it('quedan cerradas incluso para un administrador', async () => {
    await assertFails(getDoc(doc(as('admin'), 'otra/x')))
    await assertFails(setDoc(doc(as('admin'), 'otra/x'), { a: 1 }))
  })
})
