import { useEffect, useState } from 'react'
import { getBeyblades } from '../api/beyblades.api'
import type { Beyblade } from '../schemas/beyblade.schema'

type State = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: Beyblade[] }

export function useBeyblades(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    // Firestore no permite cancelar una lectura: tras desmontar, el resultado se ignora.
    let ignore = false

    getBeyblades()
      .then((data) => {
        if (!ignore) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
      })

    return () => {
      ignore = true
    }
  }, [])

  return state
}
