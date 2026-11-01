import { httpGet } from '@/shared/api/httpClient'
import type { Beyblade } from '../types/beyblade.types'

export const BEYBLADES_PATH = '/beyblades'

export function getBeyblades(signal?: AbortSignal): Promise<Beyblade[]> {
  return httpGet<Beyblade[]>(BEYBLADES_PATH, { signal })
}
