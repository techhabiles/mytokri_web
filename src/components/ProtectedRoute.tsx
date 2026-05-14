import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: number[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { session, isLoggedIn } = useSession()
  const location = useLocation()

  if (!isLoggedIn || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
