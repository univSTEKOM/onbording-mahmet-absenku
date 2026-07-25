import type { AbsensiStatus, PengajuanJenis, PengajuanStatus } from '@/types'

export const STATUS_CONFIG = {
  hadir:        { label: 'Hadir',        color: 'var(--color-status-hadir)' },
  terlambat:    { label: 'Terlambat',    color: 'var(--color-status-terlambat)' },
  pulang_cepat: { label: 'Pulang Cepat', color: 'var(--color-status-pulang-cepat)' },
  izin:         { label: 'Izin',         color: 'var(--color-status-izin)' },
  sakit:        { label: 'Sakit',        color: 'var(--color-status-sakit)' },
  cuti:         { label: 'Cuti',         color: 'var(--color-status-cuti)' },
  tidakHadir:   { label: 'Alfa',         color: 'var(--color-status-tidakHadir)' },
} as const

export const absensiStatusBadge: Record<AbsensiStatus, string> = {
  hadir:        'bg-[var(--color-status-hadir)] text-white border-0',
  terlambat:    'bg-[var(--color-status-terlambat)] text-black border-0',
  pulang_cepat: 'bg-[var(--color-status-pulang-cepat)] text-black border-0',
  izin:         'bg-[var(--color-status-izin)] text-black border-0',
  sakit:        'bg-[var(--color-status-sakit)] text-white border-0',
  cuti:         'bg-[var(--color-status-cuti)] text-black border-0',
}

export const pengajuanStatusBadge: Record<PengajuanStatus, string> = {
  pending:  'bg-[var(--color-status-terlambat)] text-black border-0',
  approved: 'bg-[var(--color-status-hadir)] text-white border-0',
  rejected: 'bg-[var(--color-status-tidakHadir)] text-white border-0',
}

export const pengajuanJenisBadge: Record<PengajuanJenis, string> = {
  cuti:  'bg-[var(--color-status-sakit)] text-white border-0',
  izin:  'bg-[var(--color-status-izin)] text-black border-0',
  sakit: 'bg-[var(--color-status-terlambat)] text-black border-0',
}

export const pengajuanStatusLabel: Record<PengajuanStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export const pengajuanJenisLabel: Record<PengajuanJenis, string> = {
  cuti: 'Cuti',
  izin: 'Izin',
  sakit: 'Sakit',
}

export const MAX_NAMA_LENGTH = 100
export const MAX_JABATAN_LENGTH = 100
export const MAX_EMAIL_LENGTH = 100
export const MAX_PASSWORD_LENGTH = 50
export const MAX_PHONE_DIGITS = 15
export const MAX_ALASAN_LENGTH = 500
export const MAX_ALAMAT_LENGTH = 500
export const MIN_PASSWORD_LENGTH = 8
export const MIN_PHONE_DIGITS = 10
export const MIN_ALASAN_LENGTH = 10
export const MAX_FOTO_SIZE_MB = 5
export const MAX_PENGAJUAN_DURATION_DAYS = 30
export const APP_RELEASE_DATE = import.meta.env.VITE_APP_RELEASE_DATE || '2026-07-13'

export const absensiStatusLabel: Record<AbsensiStatus, string> = {
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  pulang_cepat: 'Pulang Cepat',
  izin: 'Izin',
  sakit: 'Sakit',
  cuti: 'Cuti',
}

export const STATUS_COLORS_MAP: Record<string, string> = {
  hadir:        'var(--color-status-hadir)',
  terlambat:    'var(--color-status-terlambat)',
  pulang_cepat: 'var(--color-status-pulang-cepat)',
  izin:         'var(--color-status-izin)',
  sakit:        'var(--color-status-sakit)',
  cuti:         'var(--color-status-cuti)',
  tidakHadir:   'var(--color-status-tidakHadir)',
}
