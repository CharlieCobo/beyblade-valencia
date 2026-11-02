import { useEffect, useState } from 'react'
import { getBeyblades } from '../api/beyblades.api'
import type { Beyblade } from '../schemas/beyblade.schema'

type State = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: Beyblade[] }

export function useBeyblades(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    getBeyblades(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
      })

    return () => controller.abort()
  }, [])

  return state
}
