import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { isValidPhone } from '../../utils/validators'

export default function AddHub() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Hub name is required'
    if (!address.trim()) next.address = 'Address is required'
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      adminApi.addHub({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      }),
    )
    if (result) {
      showSuccess('Hub Added', 'Hub created successfully', () =>
        navigate('/admin/hubs'),
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Hub" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Hub name"
          />
          <InputField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
            placeholder="Address"
          />
          <InputField
            label="Phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            error={errors.phone}
            placeholder="10-digit phone"
          />
          <InputField
            label="Email (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Hub
          </button>
        </div>
      </div>
    </div>
  )
}
