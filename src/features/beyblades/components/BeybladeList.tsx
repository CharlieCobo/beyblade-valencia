import { useBeyblades } from '../hooks/useBeyblades'
import { BeybladeCard } from './BeybladeCard'

export function BeybladeList() {
  const state = useBeyblades()

  if (state.status === 'loading') return <p role="status">Cargando beyblades…</p>
  if (state.status === 'error') return <p role="alert">No se pudieron cargar los beyblades.</p>
  if (state.data.length === 0) return <p>Todavía no hay beyblades registrados.</p>

  return (
    <section aria-label="Listado de beyblades" className="grid">
      {state.data.map((beyblade) => (
        <BeybladeCard key={beyblade.id} beyblade={beyblade} />
      ))}
    </section>
  )
}
