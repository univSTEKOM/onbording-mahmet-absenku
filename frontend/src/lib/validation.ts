import {
  MIN_PASSWORD_LENGTH, MIN_PHONE_DIGITS, MAX_PHONE_DIGITS,
  MAX_NAMA_LENGTH, MAX_JABATAN_LENGTH,
  MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH,
} from '@/lib/constants'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email harus diisi'
  if (email.length > MAX_EMAIL_LENGTH) return `Maksimal ${MAX_EMAIL_LENGTH} karakter`
  if (!EMAIL_REGEX.test(email)) return 'Format email tidak valid'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password harus diisi'
  if (password.length > MAX_PASSWORD_LENGTH) return `Maksimal ${MAX_PASSWORD_LENGTH} karakter`
  if (password.length < MIN_PASSWORD_LENGTH) return `Minimal ${MIN_PASSWORD_LENGTH} karakter`
  if (!/[A-Z]/.test(password)) return 'Harus mengandung huruf kapital'
  if (!/[a-z]/.test(password)) return 'Harus mengandung huruf kecil'
  if (!/[0-9]/.test(password)) return 'Harus mengandung angka'
  return null
}

export function validateNama(nama: string): string | null {
  if (!nama.trim()) return 'Nama harus diisi'
  if (nama.length > MAX_NAMA_LENGTH) return `Maksimal ${MAX_NAMA_LENGTH} karakter`
  return null
}

export function validateJabatan(jabatan: string): string | null {
  if (!jabatan.trim()) return 'Jabatan harus diisi'
  if (jabatan.length > MAX_JABATAN_LENGTH) return `Maksimal ${MAX_JABATAN_LENGTH} karakter`
  return null
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < MIN_PHONE_DIGITS) return `Minimal ${MIN_PHONE_DIGITS} angka`
  if (digits.length > MAX_PHONE_DIGITS) return `Maksimal ${MAX_PHONE_DIGITS} angka`
  return null
}
