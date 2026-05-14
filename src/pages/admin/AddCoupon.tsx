import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, SelectField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import type { HubListItem } from '../../types/models'

export default function AddCoupon() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [hubs, setHubs] = useState<HubListItem[]>([])
  const [hubId, setHubId] = useState('')
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('')
  const [description, setDescription] = useState('')
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
    if (!code.trim()) next.code = 'Coupon code is required'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      next.amount = 'Enter a valid amount'
    if (!minOrderValue || isNaN(Number(minOrderValue)) || Number(minOrderValue) < 0)
      next.minOrderValue = 'Enter a valid minimum order value'
    if (!description.trim()) next.description = 'Description is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      adminApi.addCoupon({
        hub_id: Number(hubId),
        code: code.trim().toUpperCase(),
        amount: Number(amount),
        min_order_value: Number(minOrderValue),
        description: description.trim(),
      }),
    )
    if (result) {
      showSuccess('Coupon Added', 'Coupon created successfully', () =>
        navigate('/admin/coupons'),
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Coupon" />
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
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.code}
            placeholder="e.g. SAVE50"
          />
          <InputField
            label="Amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            placeholder="Discount amount"
          />
          <InputField
            label="Min Order Value"
            type="number"
            inputMode="decimal"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            error={errors.minOrderValue}
            placeholder="Minimum order value"
          />
          <InputField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Short description"
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Coupon
          </button>
        </div>
      </div>
    </div>
  )
}
