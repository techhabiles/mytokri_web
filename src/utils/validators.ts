export const phonePattern = /^\d{10}$/
export const pinPattern = /^\d{6}$/

export function isValidPhone(value: string): boolean {
  return phonePattern.test(value.trim())
}

export function isValidPin(value: string): boolean {
  return pinPattern.test(value.trim())
}

export function isPositiveNumber(value: string | number): boolean {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return !isNaN(n) && n > 0
}
