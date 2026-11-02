import { useBeyblades } from '../hooks/useBeyblades'
import { BeybladeCard } from './BeybladeCard'

export function BeybladeList() {
  const state = useBeyblades()

  if (state.status === 'loading')
    return (
      <p role="status" className="my-4">
        Cargando beyblades…
      </p>
    )
  if (state.status === 'error')
    return (
      <p role="alert" className="my-4">
        No se pudieron cargar los beyblades.
      </p>
    )
  if (state.data.length === 0) return <p className="my-4">Todavía no hay beyblades registrados.</p>

  return (
    <section aria-label="Listado de beyblades" className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {state.data.map((beyblade) => (
        <BeybladeCard key={beyblade.id} beyblade={beyblade} />
      ))}
    </section>
  )
}
