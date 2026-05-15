import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import EmptyState from '../../components/EmptyState'
import { SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useSession } from '../../context/SessionContext'
import { ROLE_HUB_MANAGER } from '../../utils/constants'
import type {
  CategoryResponse,
  HubListItem,
  ProductResponse,
} from '../../types/models'

export default function ProductList() {
  const { run } = useApiHandler()
  const { session } = useSession()
  const isHubManager = session?.role === ROLE_HUB_MANAGER

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [hubId, setHubId] = useState<string>(
    isHubManager && session?.hubId ? String(session.hubId) : '',
  )
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState<ProductResponse[]>([])

  useEffect(() => {
    ;(async () => {
      const cats = await run(() => sharedApi.getCategories())
      if (cats) setCategories(cats)
      if (!isHubManager) {
        const h = await run(() => adminApi.getHubsList())
        if (h) setHubs(h)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hubId || !categoryId) {
      setItems([])
      return
    }
    ;(async () => {
      const data = await run(() =>
        sharedApi.getProducts(Number(hubId), Number(categoryId)),
      )
      if (data) setItems(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubId, categoryId])

  if (isHubManager && !session?.hubId) {
    return (
      <div className="min-h-screen">
        <Toolbar title="Products" />
        <div className="p-6">
          <div className="card p-5 max-w-md mx-auto border-danger bg-danger-bg">
            <p className="font-semibold text-danger">No hub assigned</p>
            <p className="text-sm text-gray-600 mt-1">
              Hi {session?.userName}, your account is not linked to any hub yet. Please contact the admin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Products" />
      <div className="p-4 bg-white border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!isHubManager && (
          <SelectField
            label="Hub"
            value={hubId}
            onChange={setHubId}
            options={hubs.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select Hub"
          />
        )}
        <SelectField
          label="Category"
          value={categoryId}
          onChange={setCategoryId}
          options={categories
            .filter((c) => c.id != null)
            .map((c) => ({ value: c.id!, label: c.name }))}
          placeholder="Select Category"
        />
      </div>

      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {!hubId || !categoryId ? (
          <EmptyState message="Select hub and category to load products" />
        ) : items.length === 0 ? (
          <EmptyState message="No products yet" />
        ) : (
          items.map((p, i) => (
            <div key={p.id ?? i} className="card p-4 flex gap-3">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-accent-container flex items-center justify-center text-accent-on">
                  <Package size={24} />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-navy">
                  {p.name}
                  {p.quantity_tag && <span className="text-gray-400 font-normal"> ({p.quantity_tag})</span>}
                </h3>
                {p.description && (
                  <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-accent-dark">
                    ₹{p.sp}
                  </span>
                  {p.mrp && p.mrp !== p.sp && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{p.mrp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
