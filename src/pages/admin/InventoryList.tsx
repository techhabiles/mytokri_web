import { useEffect, useMemo, useState } from 'react'
import { Package, Building2 } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { CategoryResponse, HubListItem, InventoryItem } from '../../types/models'

export default function InventoryList() {
  const { run } = useApiHandler()
  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [hubId, setHubId] = useState('')
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const [hubs, cats] = await Promise.all([
        run(() => adminApi.getHubsList()),
        run(() => sharedApi.getCategories()),
      ])
      if (hubs) setHubs(hubs)
      if (cats) setCategories(cats)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleHubChange(id: string) {
    setHubId(id)
    setItems([])
    setLoaded(false)
    setQuery('')
    setCategoryId('')
    if (!id) return
    const data = await run(() => sharedApi.getInventoryList(Number(id)))
    if (data) setItems(data)
    setLoaded(true)
  }

  const filtered = useMemo(() => {
    let result = items
    if (categoryId) result = result.filter((item) => item.category_id != null && String(item.category_id) === categoryId)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((item) => item.name?.toLowerCase().includes(q))
    }
    return result
  }, [items, categoryId, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Inventory" />
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="card p-4">
          <SelectField
            label="Select Hub"
            value={hubId}
            onChange={handleHubChange}
            options={hubs.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select a hub to view inventory"
          />
        </div>

        {hubId && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchBar value={query} onChange={setQuery} placeholder="Search inventory..." />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-2 text-gray-600 bg-white outline-none focus:border-navy"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {loaded && filtered.length === 0 ? (
              <EmptyState message="No inventory for this hub" />
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filtered.map((item, i) => (
                  <div key={item.id ?? i} className="card p-4 flex flex-col items-center text-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name ?? ''}
                        className="w-16 h-16 object-cover rounded bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                        <Package size={24} className="text-gray-300" />
                      </div>
                    )}
                    <div className="w-full min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">
                        {item.name}
                        {item.quantity_tag && <span className="text-gray-400 font-normal"> ({item.quantity_tag})</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: <span className="font-medium text-gray-700">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!hubId && (
          <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
            <Building2 size={15} />
            <span>Select a hub above to load its inventory</span>
          </div>
        )}
      </div>
    </div>
  )
}
