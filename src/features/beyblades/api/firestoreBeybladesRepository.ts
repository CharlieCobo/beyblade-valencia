import { collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/shared/firebase/app'
import { BEYBLADES_COLLECTION } from './beyblades.api'
import type { StoredDocument } from './beybladesRepository'

export async function listBeybladeDocuments(): Promise<StoredDocument[]> {
  const snapshot = await getDocs(collection(firestore(), BEYBLADES_COLLECTION))
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
}
