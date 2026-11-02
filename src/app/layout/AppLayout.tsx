import { Outlet } from 'react-router'

/** Estructura visual de las páginas de la app. Aquí vivirán el header y el menú lateral. */
export function AppLayout() {
  return (
    <main className="container">
      <h1>Beyblade Valencia</h1>
      <Outlet />
    </main>
  )
}
