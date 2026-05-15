import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const InputField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className = '', ...rest }, ref) => (
    <div>
      <label className="label">{label}</label>
      <input ref={ref} {...rest} className={`input ${className}`} />
      {error && <p className="error-text">{error}</p>}
    </div>
  ),
)
InputField.displayName = 'InputField'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, className = '', ...rest }, ref) => (
    <div>
      <label className="label">{label}</label>
      <textarea ref={ref} {...rest} className={`input ${className}`} rows={rest.rows ?? 3} />
      {error && <p className="error-text">{error}</p>}
    </div>
  ),
)
TextareaField.displayName = 'TextareaField'

interface SelectFieldProps {
  label: string
  value: string | number | ''
  onChange: (v: string) => void
  options: { value: string | number; label: string }[]
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
