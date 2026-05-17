import { useEffect, useState, useCallback, useMemo } from 'react'
import { Calendar, X, RefreshCw, MapPin, Package, Search, CheckSquare, Square, Bike } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import EmptyState from '../../components/EmptyState'
import { hubManagerApi } from '../../api/hubManagerApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { useHubManager } from '../../context/HubManagerContext'
import type { DeliveryPersonResponse, Order, OrderItem } from '../../types/models'

const PAGE_SIZE = 200

type StatusTab = 1 | 2 | 3 | 4 | 'others'
type DataSource = 'current' | 'others'

const STATUS_TABS: { tab: StatusTab; label: string }[] = [
  { tab: 1, label: 'CREATED' },
  { tab: 2, label: 'PACKED' },
  { tab: 3, label: 'PICKED' },
  { tab: 4, label: 'IN TRANSIT' },
  { tab: 'others', label: 'OTHERS' },
]

function dataSource(tab: StatusTab): DataSource {
  return tab === 'others' ? 'others' : 'current'
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  1: { label: 'CREATED', className: 'text-gray-700 bg-gray-100 border border-gray-300' },
  2: { label: 'PACKED', className: 'text-blue-700 bg-blue-50 border border-blue-300' },
  3: { label: 'PICKED', className: 'text-purple-700 bg-purple-50 border border-purple-300' },
  4: { label: 'IN TRANSIT', className: 'text-orange-600 bg-orange-50 border border-orange-300' },
  5: { label: 'DELIVERED', className: 'text-green-700 bg-green-50 border border-green-300' },
  6: { label: 'CANCELLED', className: 'text-red-600 bg-red-50 border border-red-300' },
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const HH = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy} ${HH}:${min}`
}

// Server sends delivery_time as "dd-MM-yyyy HH:mm:ss" — already human-readable, no parsing needed
function formatDeliveryTime(raw: string | null | undefined): string {
  if (!raw) return '—'
  return raw.trim()
}

function formatOrderId(id: number | null | undefined): string {
  if (id == null) return '—'
  return `MYTKR-${String(id).padStart(7, '0')}`
}

function calcTotals(items: OrderItem[]): { totalMrp: number; totalSp: number } {
  return items.reduce(
    (acc, item) => ({
      totalMrp: acc.totalMrp + (item.mrp ?? 0) * (item.quantity ?? 0),
      totalSp: acc.totalSp + (item.sp ?? 0) * (item.quantity ?? 0),
    }),
    { totalMrp: 0, totalSp: 0 },
  )
}

function StatusBadge({
  status,
  onClick,
}: {
  status: number | null | undefined
  onClick?: () => void
}) {
  if (status == null) return null
  const s = STATUS_MAP[status] ?? { label: `STATUS ${status}`, className: 'text-gray-700 bg-gray-100 border border-gray-300' }
  return (
    <span
      onClick={onClick}
      className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded ${s.className} ${onClick ? 'cursor-pointer active:opacity-70' : ''}`}
    >
      {s.label}
    </span>
  )
}

function StatusPicker({
  order,
  onSelect,
  onClose,
}: {
  order: Order
  onSelect: (status: number) => void
  onClose: () => void
}) {
  const remaining = Object.entries(STATUS_MAP)
    .map(([k, v]) => ({ status: Number(k), ...v }))
    .filter((s) => s.status !== order.status)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-navy">Update Status</p>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">{formatOrderId(order.id)}</p>
        <div className="space-y-2">
          {remaining.map((s) => (
            <button
              key={s.status}
              onClick={() => onSelect(s.status)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded ${s.className}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  allowStatusChange,
  onStatusChange,
  selectionMode,
  selected,
  onToggleSelect,
}: {
  order: Order
  allowStatusChange: boolean
  onStatusChange: (order: Order) => void
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (id: number) => void
}) {
  const { locationMap } = useHubManager()
  const items = order.items ?? []
  const { totalMrp, totalSp } = calcTotals(items)
  const locationName = order.location_id != null ? locationMap[order.location_id] : undefined
  const isCreated = order.status === 1

  function handleCardClick() {
    if (selectionMode && isCreated && onToggleSelect && order.id != null) {
      onToggleSelect(order.id)
    }
  }

  return (
    <div
      className={`card p-4 ${selectionMode && isCreated ? 'cursor-pointer' : ''} ${selected ? 'ring-2 ring-navy' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {selectionMode && isCreated && (
            <span className="mt-0.5 shrink-0 text-navy">
              {selected ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-300" />}
            </span>
          )}
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-navy font-mono">
              {formatOrderId(order.id)}
            </p>
            {order.coupon_code && (
              <span className="inline-block text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-300">
                {order.coupon_code}
              </span>
            )}
          </div>
          </div>
        </div>
        <StatusBadge
          status={order.status}
          onClick={(!selectionMode && allowStatusChange) ? () => onStatusChange(order) : undefined}
        />
      </div>

      {/* Date + Address */}
      <div className="flex items-start justify-between gap-2 mt-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={11} className="shrink-0" />
            <span>{formatDate(order.date)}</span>
          </div>
          {order.status === 5 && order.delivery_time && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Calendar size={11} className="shrink-0" />
              <span>Delivered {formatDeliveryTime(order.delivery_time)}</span>
            </div>
          )}
        </div>
        {(() => {
          const parts = [order.user_name, order.co_name, order.address, order.phone].filter(Boolean)
          return (parts.length > 0 || locationName) ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {parts.length > 0 && (
                <>
                  <MapPin size={11} className="text-gray-400 shrink-0" />
                  <p className="text-[13px] text-gray-500 leading-tight">{parts.join(', ')}</p>
                </>
              )}
              {locationName && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {locationName}
                </span>
              )}
            </div>
          ) : null
        })()}
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {items.map((item, j) => (
            <div key={j} className="flex items-center gap-3">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.product_name ?? ''}
                  className="w-10 h-10 object-cover rounded shrink-0 bg-gray-100"
                />
              ) : (
                <div className="w-10 h-10 rounded shrink-0 bg-gray-100 flex items-center justify-center">
                  <Package size={18} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.product_name}
                  {item.quantity_tag && (
                    <span className="text-navy font-normal"> ({item.quantity_tag})</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-navy">₹{item.sp}</p>
                {item.mrp !== item.sp && (
                  <p className="text-xs text-red-400 line-through">₹{item.mrp}</p>
                )}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-2 mt-1 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <div className="flex items-center gap-2">
                {totalMrp !== totalSp && (
                  <span className="text-red-400 line-through">₹{totalMrp.toFixed(2)}</span>
                )}
                <span className="font-medium text-gray-700">₹{totalSp.toFixed(2)}</span>
              </div>
            </div>
            {order.coupon_amount != null && order.coupon_amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Coupon ({order.coupon_code})</span>
                <span className="text-green-600 font-medium">−₹{order.coupon_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold text-navy border-t pt-1 mt-1">
              <span>Total</span>
              <span>₹{(totalSp - (order.coupon_amount ?? 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DeliveryPersonPicker({
  persons,
  onSelect,
  onClose,
}: {
  persons: DeliveryPersonResponse[]
  onSelect: (dp: DeliveryPersonResponse) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-navy">Assign Delivery Person</p>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        {persons.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No delivery persons available</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {persons.map((dp) => (
              <button
                key={dp.id}
                onClick={() => onSelect(dp)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <Bike size={16} className="text-navy shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{dp.name}</p>
                  <p className="text-xs text-gray-400">{dp.phone}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface TabState {
  orders: Order[]
  page: number
  hasMore: boolean
  initialLoaded: boolean
}

const initialTabState = (): TabState => ({
  orders: [],
  page: 0,
  hasMore: true,
  initialLoaded: false,
})

export default function OrderList() {
  const { run } = useApiHandler()
  const { showConfirm } = useDialog()
  const { locationMap } = useHubManager()
  const [activeTab, setActiveTab] = useState<StatusTab>(1)
  const [current, setCurrent] = useState<TabState>(initialTabState)
  const [others, setOthers] = useState<TabState>(initialTabState)
  const [pickerOrder, setPickerOrder] = useState<Order | null>(null)
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPersonResponse[]>([])
  const [dpPickerOpen, setDpPickerOpen] = useState(false)

  function setSource(src: DataSource, updater: (prev: TabState) => TabState) {
    if (src === 'current') setCurrent(updater)
    else setOthers(updater)
  }

  const loadPage = useCallback(async (src: DataSource, pageNum: number) => {
    const fetcher = src === 'current'
      ? () => hubManagerApi.getOrderList(pageNum, PAGE_SIZE)
      : () => hubManagerApi.getOtherOrders(pageNum, PAGE_SIZE)

    const data = await run(fetcher)
    if (data) {
      const incoming = data.items ?? []
      setSource(src, (prev) => ({
        ...prev,
        orders: pageNum === 0 ? incoming : [...prev.orders, ...incoming],
        hasMore: pageNum + 1 < (data.total_pages ?? 0),
        initialLoaded: true,
      }))
    } else {
      setSource(src, (prev) => ({ ...prev, initialLoaded: true }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadPage('current', 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTabSwitch(tab: StatusTab) {
    setActiveTab(tab)
    setLocationFilter('')
    const src = dataSource(tab)
    const state = src === 'current' ? current : others
    if (!state.initialLoaded) loadPage(src, 0)
  }

  function handleLoadMore() {
    const src = dataSource(activeTab)
    const state = src === 'current' ? current : others
    const next = state.page + 1
    setSource(src, (prev) => ({ ...prev, page: next }))
    loadPage(src, next)
  }

  function handleRefresh() {
    const src = dataSource(activeTab)
    setSource(src, () => initialTabState())
    loadPage(src, 0)
  }

  function handleStatusSelect(order: Order, newStatus: number) {
    setPickerOrder(null)
    const newLabel = STATUS_MAP[newStatus]?.label ?? `STATUS ${newStatus}`
    const isFinal = newStatus === 5 || newStatus === 6
    showConfirm(
      'Update Status',
      `Change order ${formatOrderId(order.id)} to ${newLabel}?`,
      async () => {
        const result = await run(() => sharedApi.updateOrderStatus(order.id!, newStatus))
        if (result !== null) {
          if (isFinal) {
            setCurrent((prev) => ({
              ...prev,
              orders: prev.orders.filter((o) => o.id !== order.id),
            }))
            setOthers((prev) => ({
              ...prev,
              orders: [{ ...order, status: newStatus }, ...prev.orders],
            }))
          } else {
            setCurrent((prev) => ({
              ...prev,
              orders: prev.orders.map((o) =>
                o.id === order.id ? { ...o, status: newStatus } : o,
              ),
            }))
          }
        }
      },
      'Update',
    )
  }

  function toggleSelection(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function exitSelectionMode() {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  async function handleOpenDpPicker() {
    if (deliveryPersons.length === 0) {
      const data = await run(() => sharedApi.getDeliveryPersons())
      if (data) setDeliveryPersons(data)
    }
    setDpPickerOpen(true)
  }

  function handleDpSelect(dp: DeliveryPersonResponse) {
    setDpPickerOpen(false)
    const orderIds = Array.from(selectedIds)
    showConfirm(
      'Assign Delivery Person',
      `Assign ${dp.name} to ${orderIds.length} order${orderIds.length !== 1 ? 's' : ''}?`,
      async () => {
        const result = await run(() => sharedApi.assignDeliveryPerson(orderIds, dp.id!))
        if (result !== null) {
          exitSelectionMode()
          handleRefresh()
        }
      },
      'Assign',
    )
  }

  const src = dataSource(activeTab)
  const tabState = src === 'current' ? current : others

  // Build location options from all orders in the current data source (no status filter)
  // This guarantees option values match o.location_id exactly, regardless of locationMap IDs
  const availableLocations = useMemo(() => {
    const seen = new Map<number, string>()
    tabState.orders.forEach((o) => {
      if (o.location_id != null && o.location_id !== 0) {
        seen.set(o.location_id, locationMap[o.location_id] ?? `Location ${o.location_id}`)
      }
    })
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tabState.orders, locationMap])

  const visibleOrders = (() => {
    let orders = tabState.orders
    if (activeTab !== 'others') {
      orders = orders.filter((o) => Number(o.status) === Number(activeTab))
    }
    if (locationFilter) {
      orders = orders.filter((o) => o.location_id != null && Number(o.location_id) === Number(locationFilter))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      orders = orders.filter((o) =>
        formatOrderId(o.id).toLowerCase().includes(q) ||
        o.user_name?.toLowerCase().includes(q) ||
        o.co_name?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.coupon_code?.toLowerCase().includes(q) ||
        (o.location_id != null && locationMap[o.location_id]?.toLowerCase().includes(q)) ||
        o.items?.some((item) => item.product_name?.toLowerCase().includes(q))
      )
    }
    return orders
  })()

  return (
    <div className="min-h-screen">
      <Toolbar
        title="Orders"
        action={
          <div className="flex items-center gap-1">
            {activeTab === 1 && (
              <button
                onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                className="p-1.5 rounded hover:bg-white/10 text-xs font-semibold tracking-wide"
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-white/10"
              aria-label="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        }
      />

      {/* Tabs + Location filter */}
      <div className="border-b bg-white">
        <div className="flex items-center gap-3 max-w-5xl mx-auto px-4">
          <div className="flex shrink-0">
            {STATUS_TABS.map(({ tab, label }) => (
              <button
                key={String(tab)}
                onClick={() => handleTabSwitch(tab)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white outline-none focus:border-navy"
            />
          </div>
          {availableLocations.length > 0 && (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 bg-white outline-none focus:border-navy shrink-0"
            >
              <option value="">All Locations</option>
              {availableLocations.map(([id, name]) => (
                <option key={id} value={String(id)}>{name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-3">
        {tabState.initialLoaded && visibleOrders.length === 0 ? (
          <EmptyState message="No orders yet" />
        ) : (
          <>
            {visibleOrders.map((order, i) => (
              <OrderCard
                key={order.id ?? i}
                order={order}
                allowStatusChange={activeTab !== 'others'}
                onStatusChange={setPickerOrder}
                selectionMode={selectionMode}
                selected={order.id != null && selectedIds.has(order.id)}
                onToggleSelect={toggleSelection}
              />
            ))}

            {tabState.hasMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-2.5 text-sm font-medium text-navy border border-navy rounded-lg hover:bg-navy hover:text-white transition-colors"
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>

      {pickerOrder && (
        <StatusPicker
          order={pickerOrder}
          onSelect={(s) => handleStatusSelect(pickerOrder, s)}
          onClose={() => setPickerOrder(null)}
        />
      )}

      {/* Selection bottom bar */}
      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {selectedIds.size > 0
              ? `${selectedIds.size} order${selectedIds.size !== 1 ? 's' : ''} selected`
              : 'Tap CREATED orders to select'}
          </p>
          <button
            onClick={handleOpenDpPicker}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-40"
          >
            <Bike size={15} />
            Assign DP
          </button>
        </div>
      )}

      {dpPickerOpen && (
        <DeliveryPersonPicker
          persons={deliveryPersons}
          onSelect={handleDpSelect}
          onClose={() => setDpPickerOpen(false)}
        />
      )}
    </div>
  )
}
