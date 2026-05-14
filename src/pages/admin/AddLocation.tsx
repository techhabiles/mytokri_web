import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { isValidPin } from '../../utils/validators'
import type { HubListItem } from '../../types/models'

export default function AddLocation() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [hubId, setHubId] = useState('')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [isVillage, setIsVillage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const data = await run(() => adminApi.getHubsList())
      if (data) setHubs(data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validate() {
    const next: Record<string, string> = {}
    if (!hubId) next.hubId = 'Please select a hub'
    if (!name.trim()) next.name = 'Name is required'
    if (!isValidPin(pin)) next.pin = 'Enter a valid 6-digit pin'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      adminApi.addLocation({
        hub_id: Number(hubId),
        name: name.trim(),
        pin: pin.trim(),
        is_village: isVillage,
      }),
    )
    if (result) showSuccess('Location Added', 'Location created successfully', () => navigate('/admin/locations'))
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Location" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <SelectField
            label="Hub"
            value={hubId}
            onChange={setHubId}
            options={hubs.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select Hub"
            error={errors.hubId}
          />
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Location name"
          />
          <InputField
            label="Pin"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            error={errors.pin}
            placeholder="6-digit pin"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isVillage}
              onChange={(e) => setIsVillage(e.target.checked)}
              className="accent-navy h-4 w-4"
            />
            <span className="text-gray-700">Village</span>
          </label>
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Location
          </button>
        </div>
      </div>
    </div>
  )
}
