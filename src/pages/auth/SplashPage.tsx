import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { homeRouteForRole } from '../../utils/roleRoutes'

export default function SplashPage() {
  const { session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session?.token) {
        navigate(homeRouteForRole(session.role), { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [session, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center text-white">
        <div className="text-5xl font-bold mb-2">My Tokri</div>
        <div className="text-sm opacity-80">Admin Portal</div>
        <div className="mt-6 inline-block h-7 w-7 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      </div>
    </div>
  )
}
