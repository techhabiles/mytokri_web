import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useApiHandler } from '../../hooks/useApiHandler'
import { useSession } from '../../context/SessionContext'
import { sha256 } from '../../utils/hashUtil'
import { uuid } from '../../utils/uuid'
import { homeRouteForRole } from '../../utils/roleRoutes'
import { ROLE_LABEL, SUPPORT_PHONE } from '../../utils/constants'

interface NavState {
  phone?: string
  role?: number
  uuid?: string
}

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as NavState
  const { run } = useApiHandler()
  const { saveLogin } = useSession()

  const [phone] = useState(state.phone ?? '')
  const [role] = useState<number>(state.role ?? 0)
  const [currentUuid, setCurrentUuid] = useState<string>(state.uuid ?? uuid())
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!phone || !role) {
      navigate('/login', { replace: true })
    }
  }, [phone, role, navigate])

  function setDigit(idx: number, value: string) {
    const v = value.replace(/\D/g, '').slice(0, 1)
    setDigits((prev) => {
      const next = [...prev]
      next[idx] = v
      return next
    })
    if (v && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  async function handleVerify() {
    const otp = digits.join('')
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }
    setError('')

    const login = await run(() =>
      authApi.verifyOtp({ phone, otp: sha256(otp), uuid: currentUuid }),
    )
    if (login) {
      saveLogin(login)
      navigate(homeRouteForRole(login.role), { replace: true })
    }
  }

  async function handleResend() {
    const newUuid = uuid()
    const ok = await run(() =>
      authApi.generateOtp(role, { phone, uuid: newUuid }),
    )
    if (ok !== null) {
      setCurrentUuid(newUuid)
      setDigits(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  function handleKnowOtp() {
    window.location.href = `tel:${SUPPORT_PHONE}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy text-center">Verify OTP</h1>
        <p className="text-sm text-gray-600 text-center mt-2">
          Enter the 6-digit OTP sent to +91 {phone}
          <br />
          Role: {ROLE_LABEL[role] ?? '—'}
        </p>

        <div className="flex justify-between gap-2 my-6">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:border-navy focus:ring-1 focus:ring-navy outline-none"
            />
          ))}
        </div>
        {error && <p className="error-text text-center -mt-3 mb-3">{error}</p>}

        <button className="btn-primary w-full" onClick={handleVerify}>
          Verify OTP
        </button>

        <div className="flex justify-between mt-4">
          <button className="text-navy text-sm font-medium" onClick={handleResend}>
            Resend OTP
          </button>
          <button
            className="text-accent-dark text-sm font-medium"
            onClick={handleKnowOtp}
          >
            Know My OTP
          </button>
        </div>
      </div>
    </div>
  )
}
