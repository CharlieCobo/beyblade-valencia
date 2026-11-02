import { httpGet } from '@/shared/api/httpClient'
import { BeybladeListSchema, type Beyblade } from '../schemas/beyblade.schema'

export const BEYBLADES_PATH = '/beyblades'

export function getBeyblades(signal?: AbortSignal): Promise<Beyblade[]> {
  return httpGet(BEYBLADES_PATH, BeybladeListSchema, { signal })
}
