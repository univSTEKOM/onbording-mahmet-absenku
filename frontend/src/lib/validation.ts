import { z } from 'zod'
import {
  MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH,
  MAX_NAMA_LENGTH, MAX_JABATAN_LENGTH,
  MAX_EMAIL_LENGTH,
} from '@/lib/constants'

/* ── Zod Schemas ── */

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email harus diisi')
  .max(MAX_EMAIL_LENGTH, 'Email maksimal ' + MAX_EMAIL_LENGTH + ' karakter')
  .email('Format email tidak valid')

const passwordSchema = z
  .string()
  .min(1, 'Password harus diisi')
  .min(MIN_PASSWORD_LENGTH, 'Password minimal ' + MIN_PASSWORD_LENGTH + ' karakter')
  .max(MAX_PASSWORD_LENGTH, 'Password maksimal ' + MAX_PASSWORD_LENGTH + ' karakter')
  .regex(/[A-Z]/, 'Harus mengandung huruf kapital')
  .regex(/[a-z]/, 'Harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Harus mengandung angka')

const namaSchema = z
  .string()
  .trim()
  .min(1, 'Nama harus diisi')
  .max(MAX_NAMA_LENGTH, 'Nama maksimal ' + MAX_NAMA_LENGTH + ' karakter')

const jabatanSchema = z
  .string()
  .trim()
  .min(1, 'Jabatan harus diisi')
  .max(MAX_JABATAN_LENGTH, 'Jabatan maksimal ' + MAX_JABATAN_LENGTH + ' karakter')

function stripNonDigits(v: string): string {
  return v.replace(/\D/g, '')
}

const phoneSchema = z
  .string()
  .optional()
  .transform(function(v) { return v ? stripNonDigits(v) : '' })
  .pipe(
    z.string().refine(function(v) {
      return v === '' || (v.length >= 10 && v.length <= 15)
    }, 'Nomor telepon harus 10-15 angka')
  )

/* ── Public Validation Functions (API tetap sama) ── */

function firstError(result: z.SafeParseError<unknown>): string {
  var e = result.error.errors[0]
  return e?.message || 'Validasi gagal'
}

export function validateEmail(email: string): string | null {
  var result = emailSchema.safeParse(email)
  return result.success ? null : firstError(result)
}

export function validatePassword(password: string): string | null {
  var result = passwordSchema.safeParse(password)
  return result.success ? null : firstError(result)
}

export function validateNama(nama: string): string | null {
  var result = namaSchema.safeParse(nama)
  return result.success ? null : firstError(result)
}

export function validateJabatan(jabatan: string): string | null {
  var result = jabatanSchema.safeParse(jabatan)
  return result.success ? null : firstError(result)
}

export function validatePhone(phone: string): string | null {
  var result = phoneSchema.safeParse(phone)
  return result.success ? null : firstError(result)
}

/* ── Expose schemas for future use ── */

export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  nama: namaSchema,
  jabatan: jabatanSchema,
  phone: phoneSchema,
}
