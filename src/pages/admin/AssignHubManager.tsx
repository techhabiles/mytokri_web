import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import type { HubListItem, HubManagerResponse } from '../../types/models'

export default function AssignHubManager() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [managers, setManagers] = useState<HubManagerResponse[]>([])
  const [hubId, setHubId] = useState('')
  const [userId, setUserId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const [h, m] = await Promise.all([
        run(() => adminApi.getHubsList()),
        run(() => adminApi.getHubManagers()),
      ])
      if (h) setHubs(h)
      if (m) setManagers(m)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validate() {
    const next: Record<string, string> = {}
    if (!hubId) next.hubId = 'Please select a hub'
    if (!userId) next.userId = 'Please select a hub manager'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      adminApi.assignHubManager(Number(hubId), Number(userId)),
    )
    if (result !== null) {
      showSuccess('Assigned', 'Hub manager assigned to hub', () => navigate('/admin/hub-managers'))
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Assign Hub Manager" />
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
          <SelectField
            label="Hub Manager"
            value={userId}
            onChange={setUserId}
            options={managers
              .filter((m) => m.id != null)
              .map((m) => ({ value: m.id!, label: `${m.name} (${m.phone})` }))}
            placeholder="Select Hub Manager"
            error={errors.userId}
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Assign
          </button>
        </div>
      </div>
    </div>
  )
}
