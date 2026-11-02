/** Se muestra mientras aún no se sabe si hay sesión, en lugar de redirigir antes de tiempo. */
export function SessionCheck() {
  return (
    <p role="status" className="grid min-h-dvh place-items-center">
      Comprobando sesión…
    </p>
  )
}
