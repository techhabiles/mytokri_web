import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { ROLE_ADMIN, ROLE_HUB_MANAGER } from '../../utils/constants'
import { isValidPhone } from '../../utils/validators'
import { uuid } from '../../utils/uuid'

const ROLES = [
  { value: ROLE_ADMIN, label: 'Admin' },
  { value: ROLE_HUB_MANAGER, label: 'Hub Manager' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { run } = useApiHandler()
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<number>(ROLE_ADMIN)
  const [error, setError] = useState('')

  async function handleGenerateOtp() {
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setError('')
    const u = uuid()
    const result = await run(() =>
      authApi.generateOtp(role, { phone: phone.trim(), uuid: u }),
    )
    if (result !== null) {
      navigate('/verify-otp', {
        state: { phone: phone.trim(), role, uuid: u },
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-navy">My Tokri</h1>
          <p className="text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Select Role</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer ${
                    role === r.value
                      ? 'border-navy bg-navy-container/40'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="accent-navy"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <button className="btn-primary w-full" onClick={handleGenerateOtp}>
            Generate OTP
          </button>
        </div>
      </div>
    </div>
  )
}
