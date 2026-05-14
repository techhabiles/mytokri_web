import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toolbar from '../../components/Toolbar'
import { InputField, TextareaField } from '../../components/FormField'
import { sharedApi } from '../../api/sharedApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useDialog } from '../../context/DialogContext'
import { isValidPhone } from '../../utils/validators'

export default function AddSupplier() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const { showSuccess } = useDialog()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit phone number'
    if (!description.trim()) next.description = 'Description is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const result = await run(() =>
      sharedApi.addSupplier({
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim(),
        email: email.trim() || null,
      }),
    )
    if (result) showSuccess('Supplier Added', 'Supplier created successfully', () => navigate('/suppliers'))
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Add Supplier" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Supplier name"
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
          <TextareaField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Description"
          />
          <InputField
            label="Email (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Add Supplier
          </button>
        </div>
      </div>
    </div>
  )
}
