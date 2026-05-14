import { useEffect, useMemo, useState } from 'react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { LocationResponse } from '../../types/models'

export default function LocationList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<LocationResponse[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const data = await run(() => adminApi.getLocations())
      if (data) setItems(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.pin.includes(q) ||
        (l.hub_name ?? '').toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Locations" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search locations..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No locations yet" />
        ) : (
          filtered.map((l, i) => (
            <div key={l.id ?? i} className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy">{l.name}</h3>
                {l.is_village && (
                  <span className="text-xs bg-accent-container text-accent-on px-2 py-0.5 rounded-full">
                    Village
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Pin: {l.pin}</p>
              {l.hub_name && (
                <p className="text-sm text-gray-500 mt-1">Hub: {l.hub_name}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
