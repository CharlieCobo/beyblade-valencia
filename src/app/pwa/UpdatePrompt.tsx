interface Props {
  needRefresh: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdatePrompt({ needRefresh, onUpdate, onDismiss }: Props) {
  if (!needRefresh) return null

  return (
    <div role="status" className="update-prompt">
      <span>Hay una nueva versión disponible</span>
      <div className="update-prompt__actions">
        <button type="button" className="button button--primary" onClick={onUpdate}>
          Actualizar
        </button>
        <button type="button" className="button" onClick={onDismiss}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
