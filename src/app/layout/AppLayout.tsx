import { Outlet } from 'react-router'

/** Estructura visual de las páginas de la app. Aquí vivirán el header y el menú lateral. */
export function AppLayout() {
  return (
    <main className="mx-auto max-w-[960px] px-4 py-8">
      <h1 className="my-[0.67em] text-[2em] font-bold">Beyblade Valencia</h1>
      <Outlet />
    </main>
  )
}
