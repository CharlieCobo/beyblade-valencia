import { Outlet } from 'react-router'
import { LogoutButton } from '@/features/auth'

/** Estructura visual de las páginas de la app. Aquí vivirán el header y el menú lateral. */
export function AppLayout() {
  return (
    <main className="mx-auto max-w-[960px] px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="my-[0.67em] text-[2em] font-bold">Beyblade Valencia</h1>
        <LogoutButton />
      </header>
      <Outlet />
    </main>
  )
}
