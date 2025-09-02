import { describe, it, expect } from 'vitest'
import { isValidPhone, sanitizePhone } from '../utils/validators'

describe('validators', () => {
  it('validates phone numbers correctly', () => {
    expect(isValidPhone('0123456789')).toBe(true)
    expect(isValidPhone('012345678')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
  })

  it('sanitizes phone input', () => {
    expect(sanitizePhone('012-345-6789')).toBe('0123456789')
    expect(sanitizePhone('abc0123456789def')).toBe('0123456789')
    expect(sanitizePhone('1234567890123')).toBe('1234567890')
  })
})
