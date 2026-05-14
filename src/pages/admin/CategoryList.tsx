import { useEffect, useMemo, useState } from 'react'
import { Layers } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { CategoryResponse } from '../../types/models'

export default function CategoryList() {
  const { run } = useApiHandler()
  const [items, setItems] = useState<CategoryResponse[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const data = await run(() => sharedApi.getCategories())
      if (data) setItems(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    return items.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Categories" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search categories..." />
      <div className="p-4 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No categories yet" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((c, i) => (
              <div key={c.id ?? i} className="card p-4 flex flex-col items-center text-center">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-accent-container rounded-full mb-2 flex items-center justify-center text-accent-on">
                    <Layers size={28} />
                  </div>
                )}
                <span className="text-sm font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
