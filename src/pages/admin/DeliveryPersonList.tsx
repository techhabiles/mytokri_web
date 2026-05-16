import { useEffect, useMemo, useState } from 'react'
import { Phone, MapPin } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { adminApi } from '../../api/adminApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { DeliveryPersonResponse, LocationResponse } from '../../types/models'

export default function DeliveryPersonList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<DeliveryPersonResponse[]>([])
  const [locationMap, setLocationMap] = useState<Record<number, string>>({})
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const persons = await run(() => sharedApi.getDeliveryPersons())
      if (persons) setItems(persons)

      const locations = await run(() => adminApi.getLocations(), { silent: true })
      if (locations) {
        setLocationMap(
          Object.fromEntries(
            (locations as LocationResponse[])
              .filter((l) => l.id != null)
              .map((l) => [l.id!, l.name]),
          ),
        )
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Delivery Persons" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by name or phone..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No delivery persons yet" />
        ) : (
          filtered.map((p, i) => (
            <div key={p.id ?? i} className="card p-4">
              <h3 className="font-semibold text-navy">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <Phone size={14} className="shrink-0" />
                <span>{p.phone}</span>
              </div>
              {p.locations && p.locations.length > 0 && (
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {p.locations.map((locId) => (
                      <span
                        key={locId}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {locationMap[locId] ?? String(locId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
