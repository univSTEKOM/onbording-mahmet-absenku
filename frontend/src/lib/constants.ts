import type { AbsensiStatus, PengajuanJenis, PengajuanStatus } from '@/types'

export const absensiStatusBadge: Record<AbsensiStatus, string> = {
  hadir: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0',
  terlambat: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0',
  pulang_cepat: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0',
  izin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  sakit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0',
  cuti: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
}

export const pengajuanStatusBadge: Record<PengajuanStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
}

export const pengajuanJenisBadge: Record<PengajuanJenis, string> = {
  cuti: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0',
  izin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  sakit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0',
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

export const absensiStatusLabel: Record<AbsensiStatus, string> = {
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  pulang_cepat: 'Pulang Cepat',
  izin: 'Izin',
  sakit: 'Sakit',
  cuti: 'Cuti',
}
