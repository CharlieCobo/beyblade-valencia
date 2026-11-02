import { http, HttpResponse } from 'msw'
import { apiUrl } from '@/shared/api/httpClient'
import { BEYBLADES_PATH } from '../api/beyblades.api'
import { buildBeyblades } from './beyblade.factory'

export const beybladesHandlers = [http.get(apiUrl(BEYBLADES_PATH), () => HttpResponse.json(buildBeyblades(6)))]
