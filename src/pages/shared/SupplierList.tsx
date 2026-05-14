import { useEffect, useMemo, useState } from 'react'
import { Phone, Mail } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { SupplierResponse } from '../../types/models'

export default function SupplierList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<SupplierResponse[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const data = await run(() => sharedApi.getSuppliers())
      if (data) setItems(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.description ?? '').toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Suppliers" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search suppliers..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No suppliers yet" />
        ) : (
          filtered.map((s, i) => (
            <div key={s.id ?? i} className="card p-4">
              <h3 className="font-semibold text-navy">{s.name}</h3>
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Phone size={14} />
                <span>{s.phone}</span>
              </div>
              {s.email && (
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Mail size={14} />
                  <span>{s.email}</span>
                </div>
              )}
              {s.description && (
                <p className="text-sm text-gray-500 mt-2">{s.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
