import { Navigate, Route, Routes } from 'react-router'
import { LoginPage, RequireAuth } from '@/features/auth'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { UpdatePrompt } from './pwa/UpdatePrompt'
import { usePwaUpdate } from './pwa/usePwaUpdate'

export function App() {
  const { needRefresh, update, dismiss } = usePwaUpdate()

  return (
    <>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdatePrompt needRefresh={needRefresh} onUpdate={update} onDismiss={dismiss} />
    </>
  )
}
