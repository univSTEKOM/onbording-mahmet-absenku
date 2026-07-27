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
  pulang_cepat: 'bg-[var(--color-status-pulang-cepat)] text-white border-0',
  izin:         'bg-[var(--color-status-izin)] text-white border-0',
  sakit:        'bg-[var(--color-status-sakit)] text-white border-0',
  cuti:         'bg-[var(--color-status-cuti)] text-white border-0',
  tidakHadir:   'bg-[var(--color-status-tidakHadir)] text-white border-0',
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
  tidakHadir: 'Alfa',
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

/* ── Category Badge & Label (new) ── */

export const CATEGORY_BADGE: Record<string, string> = {
  /* Main */
  physical_present:   'bg-[var(--color-status-hadir)] text-white border-0',
  absent_permit:      'bg-[var(--color-status-izin)] text-black border-0',
  absent_unpermit:    'bg-[var(--color-status-tidakHadir)] text-white border-0',
  /* Sub: Physical */
  physical_standard:  'bg-[var(--color-status-hadir)] text-white border-0',
  physical_flexible:  'bg-[var(--color-status-hadir)] text-white border-0',
  physical_field:     'bg-[var(--color-status-hadir)] text-white border-0',
  physical_overtime:  'bg-[var(--color-status-hadir)] text-white border-0',
  physical_violation: 'bg-[var(--color-status-terlambat)] text-black border-0',
  /* Permit */
  leave_annual:       'bg-[var(--color-status-cuti)] text-black border-0',
  leave_maternity:    'bg-[var(--color-status-cuti)] text-black border-0',
  leave_long:         'bg-[var(--color-status-cuti)] text-black border-0',
  permit_sick:        'bg-[var(--color-status-sakit)] text-white border-0',
  permit_personal:    'bg-[var(--color-status-izin)] text-black border-0',
  permit_general:     'bg-[var(--color-status-izin)] text-black border-0',
  /* Unpermit */
  tidakHadir:         'bg-[var(--color-status-tidakHadir)] text-white border-0',
  unpermit_absent:    'bg-[var(--color-status-tidakHadir)] text-white border-0',
  unpermit_partial:   'bg-[var(--color-status-tidakHadir)] text-white border-0',
  unpermit_suspension:'bg-[var(--color-status-tidakHadir)] text-white border-0',
}

export const CATEGORY_LABEL: Record<string, string> = {
  /* Main */
  physical_present:   'Kehadiran Fisik',
  absent_permit:      'Ketidakhadiran Berizin',
  absent_unpermit:    'Ketidakhadiran Tanpa Izin',
  /* Sub */
  physical_standard:  'Hadir Standar',
  physical_flexible:  'Hadir Fleksibel',
  physical_field:     'Dinas Luar',
  physical_overtime:  'Lembur',
  physical_violation: 'Pelanggaran Jam',
  leave_annual:       'Cuti Tahunan',
  leave_maternity:    'Cuti Melahirkan',
  leave_long:         'Cuti Besar',
  permit_sick:        'Izin Sakit',
  permit_personal:    'Izin Personal',
  permit_general:     'Izin Umum',
  unpermit_absent:    'Alfa',
  unpermit_partial:   'Mangkir Parsial',
  unpermit_suspension:'Skorsing',
}

export const CATEGORY_COLORS_MAP: Record<string, string> = {
  /* Main */
  physical_present:   'var(--color-status-hadir)',
  absent_permit:      'var(--color-status-izin)',
  absent_unpermit:    'var(--color-status-tidakHadir)',
  /* Sub */
  physical_standard:  'var(--color-status-hadir)',
  physical_flexible:  'var(--color-status-hadir)',
  physical_field:     'var(--color-status-hadir)',
  physical_overtime:  'var(--color-status-hadir)',
  physical_violation: 'var(--color-status-terlambat)',
  leave_annual:       'var(--color-status-cuti)',
  leave_maternity:    'var(--color-status-cuti)',
  leave_long:         'var(--color-status-cuti)',
  permit_sick:        'var(--color-status-sakit)',
  permit_personal:    'var(--color-status-izin)',
  permit_general:     'var(--color-status-izin)',
  unpermit_absent:    'var(--color-status-tidakHadir)',
  unpermit_partial:   'var(--color-status-tidakHadir)',
  unpermit_suspension:'var(--color-status-tidakHadir)',
}
