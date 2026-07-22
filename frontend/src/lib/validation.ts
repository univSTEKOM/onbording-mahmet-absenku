import {
  MIN_PASSWORD_LENGTH, MIN_PHONE_DIGITS, MAX_PHONE_DIGITS,
  MAX_NAMA_LENGTH, MAX_JABATAN_LENGTH, MAX_ALASAN_LENGTH,
  MAX_ALAMAT_LENGTH, MAX_FOTO_SIZE_MB, MIN_ALASAN_LENGTH,
  MAX_PENGAJUAN_DURATION_DAYS, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH,
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

export function validateAlasan(alasan: string): string | null {
  if (!alasan.trim()) return 'Alasan harus diisi'
  if (alasan.length < MIN_ALASAN_LENGTH) return `Minimal ${MIN_ALASAN_LENGTH} karakter`
  if (alasan.length > MAX_ALASAN_LENGTH) return `Maksimal ${MAX_ALASAN_LENGTH} karakter`
  return null
}

export function validateAlamat(alamat: string): string | null {
  if (!alamat) return null
  if (alamat.length > MAX_ALAMAT_LENGTH) return `Maksimal ${MAX_ALAMAT_LENGTH} karakter`
  return null
}

export function validateFoto(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'File harus gambar'
  if (file.size > MAX_FOTO_SIZE_MB * 1024 * 1024) return `Maksimal ${MAX_FOTO_SIZE_MB}MB`
  return null
}

export function validateTanggalMulai(tanggal: string): string | null {
  if (!tanggal) return 'Tanggal harus diisi'
  const today = new Date().toISOString().split('T')[0]
  if (tanggal < today) return 'Tidak boleh mundur'
  return null
}

export function validateTanggalSelesai(mulai: string, selesai: string): string | null {
  if (!selesai) return 'Tanggal selesai harus diisi'
  if (mulai && selesai < mulai) return 'Selesai harus setelah mulai'
  if (mulai && selesai) {
    const days = Math.ceil((new Date(selesai).getTime() - new Date(mulai).getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (days > MAX_PENGAJUAN_DURATION_DAYS) return `Maksimal ${MAX_PENGAJUAN_DURATION_DAYS} hari`
  }
  return null
}
