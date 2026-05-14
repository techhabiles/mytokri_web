import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useDialog } from '../context/DialogContext'
import { authApi } from '../api/authApi'

export function useLogout() {
  const navigate = useNavigate()
  const { clear } = useSession()
  const { showConfirm, setLoading } = useDialog()

  function confirmLogout() {
    showConfirm(
      'Log Out',
      'Are you sure you want to log out?',
      async () => {
        setLoading(true)
        try {
          // Best-effort server logout
          await authApi.logout().catch(() => {})
        } finally {
          clear()
          setLoading(false)
          navigate('/login', { replace: true })
        }
      },
      'Log Out',
      'Cancel',
    )
  }

  return { confirmLogout }
}
