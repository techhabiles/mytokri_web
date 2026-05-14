import { useEffect, useMemo, useState } from 'react'
import { Tag, Building2, ShoppingCart } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import type { CouponResponse, HubListItem } from '../../types/models'

export default function CouponList() {
  const { run } = useApiHandler()
  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [hubId, setHubId] = useState('')
  const [items, setItems] = useState<CouponResponse[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const data = await run(() => adminApi.getHubsList())
      if (data) setHubs(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleHubChange(id: string) {
    setHubId(id)
    setItems([])
    setLoaded(false)
    setQuery('')
    if (!id) return
    const data = await run(() => adminApi.getCoupons(Number(id)))
    if (data) setItems(data)
    setLoaded(true)
  }

  async function handleToggleLock(coupon: CouponResponse) {
    if (coupon.id == null) return
    setTogglingId(coupon.id)
    const result = await run(() => adminApi.updateCouponLock(coupon.id!))
    if (result !== null) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, is_locked: !c.is_locked } : c,
        ),
      )
    }
    setTogglingId(null)
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div className="min-h-screen">
      <Toolbar title="Coupons" />
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="card p-4">
          <SelectField
            label="Select Hub"
            value={hubId}
            onChange={handleHubChange}
            options={hubs.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select a hub to view coupons"
          />
        </div>

        {hubId && (
          <>
            <SearchBar value={query} onChange={setQuery} placeholder="Search coupons..." />
            {loaded && filtered.length === 0 ? (
              <EmptyState message="No coupons for this hub" />
            ) : (
              filtered.map((c, i) => (
                <div key={c.id ?? i} className="card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-navy shrink-0" />
                      <span className="font-semibold text-navy tracking-wide">{c.code}</span>
                    </div>
                    {/* Lock toggle */}
                    <button
                      onClick={() => handleToggleLock(c)}
                      disabled={togglingId === c.id}
                      aria-label={c.is_locked ? 'Unlock coupon' : 'Lock coupon'}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                        c.is_locked ? 'bg-danger' : 'bg-green-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          c.is_locked ? 'translate-x-1' : 'translate-x-6'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="text-sm text-gray-700 mt-2">
                    Discount: <span className="font-medium">₹{c.amount}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                    <ShoppingCart size={14} className="shrink-0" />
                    <span>Min order: ₹{c.min_order_value}</span>
                  </div>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                  )}
                  <p className={`text-xs mt-2 font-medium ${c.is_locked ? 'text-danger' : 'text-green-600'}`}>
                    {c.is_locked ? 'Locked' : 'Active'}
                  </p>
                </div>
              ))
            )}
          </>
        )}

        {!hubId && (
          <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
            <Building2 size={15} />
            <span>Select a hub above to load its coupons</span>
          </div>
        )}
      </div>
    </div>
  )
}
