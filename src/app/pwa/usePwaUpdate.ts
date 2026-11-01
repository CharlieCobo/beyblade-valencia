import { useRegisterSW } from 'virtual:pwa-register/react'

export interface PwaUpdate {
  /** Hay una versión nueva instalada y esperando a activarse. */
  needRefresh: boolean
  /** Activa la versión nueva y recarga la página. */
  update: () => void
  /** Oculta el aviso sin actualizar. */
  dismiss: () => void
}

export function usePwaUpdate(): PwaUpdate {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return {
    needRefresh,
    update: () => void updateServiceWorker(true),
    dismiss: () => setNeedRefresh(false),
  }
}
