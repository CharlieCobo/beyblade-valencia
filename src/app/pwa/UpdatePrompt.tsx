import { Button } from '@/shared/ui/Button'

interface Props {
  needRefresh: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdatePrompt({ needRefresh, onUpdate, onDismiss }: Props) {
  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 left-4 ml-auto flex max-w-[420px] flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 border-accent bg-card px-4 py-3 text-foreground shadow-[0_6px_24px_rgb(0_0_0/0.25)]"
    >
      <span>Hay una nueva versión disponible</span>
      <div className="flex gap-2">
        <Button variant="primary" onClick={onUpdate}>
          Actualizar
        </Button>
        <Button onClick={onDismiss}>Cerrar</Button>
      </div>
    </div>
  )
}
