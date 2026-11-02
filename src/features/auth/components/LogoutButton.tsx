import { Button } from '@/shared/ui/Button'
import { useLogout } from '../hooks/useLogout'

export function LogoutButton() {
  const logout = useLogout()

  return <Button onClick={() => void logout()}>Cerrar sesión</Button>
}
