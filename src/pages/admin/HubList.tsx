import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { HubResponse } from '../../types/models'

export default function HubList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<HubResponse[]>([])
  const [query, setQuery] = useState('')

  async function load() {
    const data = await run(() => adminApi.getHubs())
    if (data) setItems(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.phone.includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Hubs" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search hubs..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No hubs yet" />
        ) : (
          filtered.map((h, i) => (
            <div key={h.id ?? i} className="card p-4">
              <h3 className="font-semibold text-navy">{h.name}</h3>
              <div className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                <MapPin size={14} className="mt-0.5" />
                <span>{h.address}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Phone size={14} />
                <span>{h.phone}</span>
              </div>
              {h.email && (
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Mail size={14} />
                  <span>{h.email}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
