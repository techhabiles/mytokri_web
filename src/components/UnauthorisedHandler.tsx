import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUnauthorisedHandler } from '../api/apiClient'
import { useSession } from '../context/SessionContext'

export default function UnauthorisedHandler() {
  const { clear } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorisedHandler(() => {
      clear()
      navigate('/login', { replace: true })
    })
  }, [clear, navigate])

  return null
}
