import type { Beyblade } from '../types/beyblade.types'

interface Props {
  beyblade: Beyblade
}

export function BeybladeCard({ beyblade }: Props) {
  return (
    <article className="card" aria-label={beyblade.name}>
      <h3>{beyblade.name}</h3>
      <p>
        <span className="badge">{beyblade.type}</span>
      </p>
      <p>Blader: {beyblade.blader}</p>
      <p>Victorias: {beyblade.wins}</p>
    </article>
  )
}
