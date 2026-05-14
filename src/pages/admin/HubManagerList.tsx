import { useEffect, useMemo, useState } from 'react'
import { Phone, Building2 } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { HubManagerResponse } from '../../types/models'

export default function HubManagerList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<HubManagerResponse[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const data = await run(() => adminApi.getHubManagers())
      if (data) setItems(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.hub_name ?? '').toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Hub Managers" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search hub managers..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No hub managers yet" />
        ) : (
          filtered.map((m, i) => (
            <div key={m.id ?? i} className="card p-4">
              <h3 className="font-semibold text-navy">{m.name}</h3>
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Phone size={14} />
                <span>{m.phone}</span>
              </div>
              {m.hub_name && (
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Building2 size={14} />
                  <span>{m.hub_name}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
