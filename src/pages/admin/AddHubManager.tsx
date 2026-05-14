import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { isValidPhone } from '../../utils/validators'
import type { HubListItem } from '../../types/models'

export default function AddHubManager() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [hubId, setHubId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
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
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      adminApi.addHubManager({
        hub_id: Number(hubId),
        name: name.trim(),
        phone: phone.trim(),
      }),
    )
    if (result) showSuccess('Hub Manager Added', 'Hub manager created', () => navigate('/admin/hub-managers'))
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Hub Manager" />
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
            placeholder="Hub manager name"
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
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Hub Manager
          </button>
        </div>
      </div>
    </div>
  )
}
