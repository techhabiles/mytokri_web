import { useState } from 'react'
import Toolbar from '../../components/Toolbar'
import { InputField } from '../../components/FormField'
import { adminApi } from '../../api/adminApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { isValidPhone } from '../../utils/validators'

export default function GetUserOtp() {
  const { run } = useApiHandler()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [otp, setOtp] = useState<string | null>(null)

  async function handleFetch() {
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setError('')
    setOtp(null)
    const result = await run(() => adminApi.getPlainOtp({ phone: phone.trim() }))
    if (result !== null && result !== undefined) {
      setOtp(String(result))
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Get User OTP" />
      <div className="p-4 max-w-xl mx-auto">
        <div className="card p-5 space-y-4">
          <InputField
            label="Phone"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            error={error}
            placeholder="10-digit phone"
          />
          <button className="btn-primary w-full" onClick={handleFetch}>
            Fetch OTP
          </button>

          {otp && (
            <div className="mt-4 bg-accent-container p-4 rounded text-center">
              <p className="text-sm text-accent-on">User OTP</p>
              <p className="text-3xl font-bold text-accent-dark tracking-widest mt-1">
                {otp}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
