import { parseContract } from '@/shared/contracts/ContractError'
import { BeybladeSchema, type Beyblade } from '../schemas/beyblade.schema'
import { beybladesRepository } from './beybladesRepository'

export const BEYBLADES_COLLECTION = 'beyblades'

/**
 * Lista los beyblades almacenados validando cada documento con su contrato (el id es el del documento).
 * Si alguno no cumple, rechaza con un `ContractError` y no devuelve datos parciales.
 */
export async function getBeyblades(): Promise<Beyblade[]> {
  const documents = await beybladesRepository().list()
  return documents.map(({ id, data }) =>
    parseContract(BeybladeSchema, { ...data, id }, `${BEYBLADES_COLLECTION}/${id}`),
  )
}
