import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { isValidPhone } from '../../utils/validators'
import type { LocationResponse } from '../../types/models'

export default function AddDeliveryPerson() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [locations, setLocations] = useState<LocationResponse[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const data = await run(() => adminApi.getLocations())
      if (data) setLocations(data)

    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (selectedIds.size === 0) next.locations = 'Select at least one delivery location'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      sharedApi.addDeliveryPerson({
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

          {/* Location multi-select */}
          <div>
            <label className="label">Delivery Locations</label>
            {locations.length === 0 ? (
              <p className="text-sm text-gray-400 mt-1">Loading locations…</p>
            ) : (
              <div className="mt-1 border rounded-lg max-h-64 overflow-y-auto grid grid-cols-2">
                {locations.map((loc, idx) => {
                  const checked = loc.id != null && selectedIds.has(loc.id)
                  const isLeft = idx % 2 === 0
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b ${isLeft ? 'border-r' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => loc.id != null && toggleLocation(loc.id)}
                        className="accent-navy w-4 h-4 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {[loc.hub_name, loc.pin && `(${loc.pin})`].filter(Boolean).join(' ')}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {errors.locations && <p className="error-text">{errors.locations}</p>}
            {selectedIds.size > 0 && (
              <p className="text-xs text-navy mt-1">{selectedIds.size} location{selectedIds.size !== 1 ? 's' : ''} selected</p>
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
