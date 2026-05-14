import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginResponse, SessionData } from '../types/models'
import { SESSION_KEY } from '../utils/constants'

interface SessionContextValue {
  session: SessionData | null
  isLoggedIn: boolean
  saveLogin: (login: LoginResponse) => void
  clear: () => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionData
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(() => loadSession())

  const saveLogin = useCallback((login: LoginResponse) => {
    const next: SessionData = {
      token: login.token,
      role: login.role,
      userName: login.user_name,
      supportNumber: login.support_number,
      hubId: login.hub_id ?? null,
      hubName: login.hub_name ?? null,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  // Sync across tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === SESSION_KEY) {
        setSession(loadSession())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoggedIn: !!session?.token,
      saveLogin,
      clear,
    }),
    [session, saveLogin, clear],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
