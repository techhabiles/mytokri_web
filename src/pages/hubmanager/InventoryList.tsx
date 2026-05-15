import { useEffect, useMemo, useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useSession } from '../../context/SessionContext'
import type { CategoryResponse, InventoryItem } from '../../types/models'

export default function InventoryList() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { session } = useSession()
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!session?.hubId) return
    ;(async () => {
      const [inv, cats] = await Promise.all([
        run(() => sharedApi.getInventoryList(session.hubId!)),
        run(() => sharedApi.getCategories()),
      ])
      if (inv) setItems(inv)
      if (cats) setCategories(cats)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.hubId])

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
      <div className="flex items-center gap-3 px-4 pt-4 max-w-5xl mx-auto">
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
      <div className="p-4 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No inventory items" />
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
                  <button
                    onClick={() => navigate('/hub-manager/inventory/add', {
                      state: { categoryId: item.category_id, productId: item.product_id },
                    })}
                    className="mt-2 flex items-center justify-center gap-1 w-full text-xs font-semibold text-navy border border-navy rounded py-1 hover:bg-navy hover:text-white transition-colors"
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
