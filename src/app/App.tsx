import { BeybladeList } from '@/features/beyblades'
import { UpdatePrompt } from './pwa/UpdatePrompt'
import { usePwaUpdate } from './pwa/usePwaUpdate'

export function App() {
  const { needRefresh, update, dismiss } = usePwaUpdate()

  return (
    <>
      <main className="container">
        <h1>Beyblade Valencia</h1>
        <BeybladeList />
      </main>
      <UpdatePrompt needRefresh={needRefresh} onUpdate={update} onDismiss={dismiss} />
    </>
  )
}
