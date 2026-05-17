import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { hubManagerApi } from '../../api/hubManagerApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { useSession } from '../../context/SessionContext'
import { isValidPhone } from '../../utils/validators'
import { ROLE_HUB_MANAGER } from '../../utils/constants'
import type { HubListItem } from '../../types/models'

interface LocationOption {
  id: number
  name: string
  subtitle?: string
}

export default function AddDeliveryPerson() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()
  const { session } = useSession()
  const isHubManager = session?.role === ROLE_HUB_MANAGER

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [selectedHubId, setSelectedHubId] = useState<number | null>(null)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initial load
  useEffect(() => {
    ;(async () => {
      if (isHubManager) {
        const data = await run(() => hubManagerApi.getDeliveryLocations())
        if (data) setLocations(data.map((l) => ({ id: l.id, name: l.name })))
      } else {
        const hubData = await run(() => adminApi.getHubsList())
        if (hubData) setHubs(hubData)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load locations when admin selects a hub
  useEffect(() => {
    if (isHubManager || selectedHubId == null) return
    setLocations([])
    setSelectedIds(new Set())
    ;(async () => {
      const data = await run(() => adminApi.getLocationsByHub(selectedHubId))
      if (data) {
        setLocations(
          data
            .filter((l) => l.id != null)
            .map((l) => ({
              id: l.id!,
              name: l.name,
              subtitle: l.pin ? `(${l.pin})` : undefined,
            })),
        )
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHubId])

  function toggleLocation(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit phone number'
    if (!isHubManager && selectedHubId == null) next.hub = 'Select a hub'
    if (selectedIds.size === 0) next.locations = 'Select at least one delivery location'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const hubId = isHubManager ? session!.hubId! : selectedHubId!
    const result = await run(() =>
      sharedApi.addDeliveryPerson({
        hub_id: hubId,
        name: name.trim(),
        phone: phone.trim(),
        location_ids: Array.from(selectedIds),
      }),
    )
    if (result !== null) {
      showSuccess('Delivery Person Added', 'Delivery person created successfully', () =>
        navigate('/admin/delivery-persons'),
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Delivery Person" showBack />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Full name"
          />
          <InputField
            label="Phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            error={errors.phone}
            placeholder="10-digit phone"
          />

          {/* Hub selector — admin only */}
          {!isHubManager && (
            <div>
              <label className="label">Hub</label>
              <select
                value={selectedHubId ?? ''}
                onChange={(e) => setSelectedHubId(e.target.value ? Number(e.target.value) : null)}
                className="input"
              >
                <option value="">Select a hub</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              {errors.hub && <p className="error-text">{errors.hub}</p>}
            </div>
          )}

          {/* Location multi-select */}
          <div>
            <label className="label">Delivery Locations</label>
            {!isHubManager && selectedHubId == null ? (
              <p className="text-sm text-gray-400 mt-1">Select a hub first</p>
            ) : locations.length === 0 ? (
              <p className="text-sm text-gray-400 mt-1">Loading locations…</p>
            ) : (
              <div className="mt-1 border rounded-lg max-h-64 overflow-y-auto grid grid-cols-2">
                {locations.map((loc, idx) => {
                  const checked = selectedIds.has(loc.id)
                  const isLeft = idx % 2 === 0
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b ${isLeft ? 'border-r' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocation(loc.id)}
                        className="accent-navy w-4 h-4 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                        {loc.subtitle && (
                          <p className="text-xs text-gray-400 truncate">{loc.subtitle}</p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {errors.locations && <p className="error-text">{errors.locations}</p>}
            {selectedIds.size > 0 && (
              <p className="text-xs text-navy mt-1">
                {selectedIds.size} location{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Delivery Person
          </button>
        </div>
      </div>
    </div>
  )
}
