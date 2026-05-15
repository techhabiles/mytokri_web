import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { hubManagerApi } from '../api/hubManagerApi'
import { useSession } from './SessionContext'
import { ROLE_HUB_MANAGER } from '../utils/constants'
import type { DeliveryLocation } from '../types/models'

interface HubManagerContextValue {
  locationMap: Record<number, string>
}

const HubManagerContext = createContext<HubManagerContextValue>({ locationMap: {} })

export function HubManagerProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const [locationMap, setLocationMap] = useState<Record<number, string>>({})

  useEffect(() => {
    if (session?.role !== ROLE_HUB_MANAGER) return
    hubManagerApi.getDeliveryLocations().then((locations: DeliveryLocation[]) => {
      const map: Record<number, string> = {}
      locations.forEach((l) => { map[l.id] = l.name })
      setLocationMap(map)
    }).catch(() => {})
  }, [session?.role])

  const value = useMemo(() => ({ locationMap }), [locationMap])

  return (
    <HubManagerContext.Provider value={value}>
      {children}
    </HubManagerContext.Provider>
  )
}

export function useHubManager() {
  return useContext(HubManagerContext)
}
