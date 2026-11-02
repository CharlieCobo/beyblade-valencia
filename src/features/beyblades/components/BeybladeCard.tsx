import type { Beyblade } from '../types/beyblade.types'

interface Props {
  beyblade: Beyblade
}

export function BeybladeCard({ beyblade }: Props) {
  return (
    <article className="rounded-xl bg-card p-4" aria-label={beyblade.name}>
      <h3 className="mt-0 mb-[1em] text-[1.17em] font-bold capitalize">{beyblade.name}</h3>
      <p className="my-4">
        <span className="rounded-full bg-accent px-[0.6rem] py-[0.15rem] text-[0.8rem] text-white uppercase">
          {beyblade.type}
        </span>
      </p>
      <p className="my-4">Blader: {beyblade.blader}</p>
      <p className="my-4">Victorias: {beyblade.wins}</p>
    </article>
  )
}
