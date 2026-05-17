import { useEffect, useMemo, useState } from 'react'
import { Phone, MapPin, X, Plus, Settings2 } from 'lucide-react'
import Toolbar from '../../components/Toolbar'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/EmptyState'
import { adminApi } from '../../api/adminApi'
import { hubManagerApi } from '../../api/hubManagerApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { useSession } from '../../context/SessionContext'
import { ROLE_HUB_MANAGER } from '../../utils/constants'
import type { DeliveryLocation, DeliveryPersonResponse } from '../../types/models'

interface LocationOption {
  id: number
  name: string
}

export default function DeliveryPersonList() {
  const { run } = useApiHandler()
  const { showConfirm } = useDialog()
  const { session } = useSession()
  const [items, setItems] = useState<DeliveryPersonResponse[]>([])
  const [allLocations, setAllLocations] = useState<LocationOption[]>([])
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const editingPerson = editingId != null ? (items.find((p) => p.id === editingId) ?? null) : null

  useEffect(() => {
    ;(async () => {
      const persons = await run(() => sharedApi.getDeliveryPersons())
      if (persons) setItems(persons)

      if (session?.role === ROLE_HUB_MANAGER) {
        const locs = await run(() => hubManagerApi.getDeliveryLocations(), { silent: true })
        if (locs) setAllLocations(locs.map((l) => ({ id: l.id, name: l.name })))
      } else {
        const locs = await run(() => adminApi.getLocations(), { silent: true })
        if (locs) {
          setAllLocations(
            locs.filter((l) => l.id != null).map((l) => ({ id: l.id!, name: l.name })),
          )
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q))
  }, [items, query])

  function updatePersonLocations(
    personId: number,
    updater: (prev: DeliveryLocation[]) => DeliveryLocation[],
  ) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, locations: updater(p.locations ?? []) } : p,
      ),
    )
  }

  async function handleAddLocation(loc: LocationOption) {
    if (!editingPerson?.id) return
    const result = await run(() => sharedApi.assignDeliveryLocation(loc.id, editingPerson.id!))
    if (result !== null) {
      updatePersonLocations(editingPerson.id!, (prev) => [...prev, { id: loc.id, name: loc.name }])
    }
  }

  function handleRemoveLocation(loc: DeliveryLocation) {
    if (!editingPerson?.id) return
    showConfirm(
      'Remove Location',
      `Remove "${loc.name}" from ${editingPerson.name}?`,
      async () => {
        const result = await run(() =>
          sharedApi.removeDeliveryLocation(loc.id, editingPerson.id!),
        )
        if (result !== null) {
          updatePersonLocations(editingPerson.id!, (prev) => prev.filter((l) => l.id !== loc.id))
        }
      },
      'Remove',
    )
  }

  const assignedLocations = editingPerson?.locations ?? []
  const assignedIds = new Set(assignedLocations.map((l) => l.id))
  const availableToAdd = allLocations.filter((l) => !assignedIds.has(l.id))

  return (
    <div className="min-h-screen">
      <Toolbar title="Delivery Persons" />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by name or phone..." />
      <div className="p-4 space-y-3 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <EmptyState message="No delivery persons yet" />
        ) : (
          filtered.map((p, i) => (
            <div key={p.id ?? i} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-navy">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                    <Phone size={14} className="shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingId(p.id ?? null)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-navy shrink-0"
                  aria-label="Manage locations"
                >
                  <Settings2 size={16} />
                </button>
              </div>
              {p.locations && p.locations.length > 0 && (
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {p.locations.map((loc) => (
                      <span
                        key={loc.id}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {loc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Location management picker */}
      {editingPerson && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingId(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-5 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1 shrink-0">
              <p className="text-sm font-semibold text-navy">Manage Locations</p>
              <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4 shrink-0">{editingPerson.name}</p>

            <div className="overflow-y-auto flex-1 space-y-4">
              {assignedLocations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Assigned
                  </p>
                  <div className="space-y-1.5">
                    {assignedLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">{loc.name}</span>
                        <button
                          onClick={() => handleRemoveLocation(loc)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableToAdd.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Add Location
                  </p>
                  <div className="space-y-1.5">
                    {availableToAdd.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleAddLocation(loc)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-navy-container/30 hover:border-navy transition-colors text-left"
                      >
                        <span className="text-sm text-gray-700">{loc.name}</span>
                        <Plus size={15} className="text-navy shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {assignedLocations.length === 0 && availableToAdd.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No locations available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
