import type { AttendanceType, AttendanceCategory } from '@/types'

/* ── Main Categories ── */

export const CAT_PHYSICAL: AttendanceCategory = {
  id: 'physical_present',
  parentId: null,
  label: 'Kehadiran Fisik',
  type: 'present',
  color: 'var(--color-status-hadir)',
  requiresApproval: false,
}

export const CAT_ABSENT_PERMIT: AttendanceCategory = {
  id: 'absent_permit',
  parentId: null,
  label: 'Ketidakhadiran Berizin',
  type: 'absent_permit',
  color: 'var(--color-status-izin)',
  requiresApproval: true,
}

export const CAT_ABSENT_UNPERMIT: AttendanceCategory = {
  id: 'absent_unpermit',
  parentId: null,
  label: 'Ketidakhadiran Tanpa Izin',
  type: 'absent_unpermit',
  color: 'var(--color-status-tidakHadir)',
  requiresApproval: false,
}

/* ── Sub Categories ── */

export const CAT_PHYSICAL_STANDARD: AttendanceCategory = {
  id: 'physical_standard',
  parentId: 'physical_present',
  label: 'Hadir Standar',
  type: 'present',
  color: 'var(--color-status-hadir)',
  requiresApproval: false,
}

export const CAT_PHYSICAL_FLEXIBLE: AttendanceCategory = {
  id: 'physical_flexible',
  parentId: 'physical_present',
  label: 'Hadir Fleksibel',
  type: 'present',
  color: 'var(--color-status-hadir)',
  requiresApproval: false,
}

export const CAT_PHYSICAL_FIELD: AttendanceCategory = {
  id: 'physical_field',
  parentId: 'physical_present',
  label: 'Dinas Luar',
  type: 'present',
  color: 'var(--color-status-hadir)',
  requiresApproval: true,
}

export const CAT_PHYSICAL_OVERTIME: AttendanceCategory = {
  id: 'physical_overtime',
  parentId: 'physical_present',
  label: 'Lembur',
  type: 'present',
  color: 'var(--color-status-hadir)',
  requiresApproval: true,
}

export const CAT_PHYSICAL_VIOLATION: AttendanceCategory = {
  id: 'physical_violation',
  parentId: 'physical_present',
  label: 'Pelanggaran Jam',
  type: 'present',
  color: 'var(--color-status-terlambat)',
  requiresApproval: false,
}

export const CAT_LEAVE_ANNUAL: AttendanceCategory = {
  id: 'leave_annual',
  parentId: 'absent_permit',
  label: 'Cuti Tahunan',
  type: 'absent_permit',
  color: 'var(--color-status-cuti)',
  requiresApproval: true,
}

export const CAT_LEAVE_MATERNITY: AttendanceCategory = {
  id: 'leave_maternity',
  parentId: 'absent_permit',
  label: 'Cuti Melahirkan',
  type: 'absent_permit',
  color: 'var(--color-status-cuti)',
  requiresApproval: true,
}

export const CAT_LEAVE_LONG: AttendanceCategory = {
  id: 'leave_long',
  parentId: 'absent_permit',
  label: 'Cuti Besar',
  type: 'absent_permit',
  color: 'var(--color-status-cuti)',
  requiresApproval: true,
}

export const CAT_PERMIT_SICK: AttendanceCategory = {
  id: 'permit_sick',
  parentId: 'absent_permit',
  label: 'Izin Sakit',
  type: 'absent_permit',
  color: 'var(--color-status-sakit)',
  requiresApproval: true,
}

export const CAT_PERMIT_PERSONAL: AttendanceCategory = {
  id: 'permit_personal',
  parentId: 'absent_permit',
  label: 'Izin Personal',
  type: 'absent_permit',
  color: 'var(--color-status-izin)',
  requiresApproval: true,
}

export const CAT_PERMIT_GENERAL: AttendanceCategory = {
  id: 'permit_general',
  parentId: 'absent_permit',
  label: 'Izin Umum',
  type: 'absent_permit',
  color: 'var(--color-status-izin)',
  requiresApproval: true,
}

export const CAT_UNPERMIT_ABSENT: AttendanceCategory = {
  id: 'unpermit_absent',
  parentId: 'absent_unpermit',
  label: 'Alfa',
  type: 'absent_unpermit',
  color: 'var(--color-status-tidakHadir)',
  requiresApproval: false,
}

export const CAT_UNPERMIT_PARTIAL: AttendanceCategory = {
  id: 'unpermit_partial',
  parentId: 'absent_unpermit',
  label: 'Mangkir Parsial',
  type: 'absent_unpermit',
  color: 'var(--color-status-tidakHadir)',
  requiresApproval: false,
}

export const CAT_UNPERMIT_SUSPENSION: AttendanceCategory = {
  id: 'unpermit_suspension',
  parentId: 'absent_unpermit',
  label: 'Skorsing',
  type: 'absent_unpermit',
  color: 'var(--color-status-tidakHadir)',
  requiresApproval: true,
}

/* ── All Categories Index ── */

export const ALL_CATEGORIES: AttendanceCategory[] = [
  /* Main */
  CAT_PHYSICAL,
  CAT_ABSENT_PERMIT,
  CAT_ABSENT_UNPERMIT,
  /* Sub: Physical */
  CAT_PHYSICAL_STANDARD,
  CAT_PHYSICAL_FLEXIBLE,
  CAT_PHYSICAL_FIELD,
  CAT_PHYSICAL_OVERTIME,
  CAT_PHYSICAL_VIOLATION,
  /* Sub: Permit */
  CAT_LEAVE_ANNUAL,
  CAT_LEAVE_MATERNITY,
  CAT_LEAVE_LONG,
  CAT_PERMIT_SICK,
  CAT_PERMIT_PERSONAL,
  CAT_PERMIT_GENERAL,
  /* Sub: Unpermit */
  CAT_UNPERMIT_ABSENT,
  CAT_UNPERMIT_PARTIAL,
  CAT_UNPERMIT_SUSPENSION,
]

/* ── Category Map (by id) ── */

export const CATEGORY_MAP: Record<string, AttendanceCategory> = Object.fromEntries(
  ALL_CATEGORIES.map(function(c) { return [c.id, c] })
)

/* ── Legacy Status Mapping (backward compatibility) ── */

export const LEGACY_STATUS_TO_CATEGORY: Record<string, { main: string; sub: string }> = {
  hadir:        { main: 'physical_present', sub: 'physical_standard' },
  terlambat:    { main: 'physical_present', sub: 'physical_violation' },
  pulang_cepat: { main: 'physical_present', sub: 'physical_violation' },
  izin:         { main: 'absent_permit',    sub: 'permit_general' },
  sakit:        { main: 'absent_permit',    sub: 'permit_sick' },
  cuti:         { main: 'absent_permit',    sub: 'leave_annual' },
  tidakHadir:   { main: 'absent_unpermit',  sub: 'unpermit_absent' },
}

/* ── Helpers ── */

export function getCategory(id: string): AttendanceCategory | undefined {
  return CATEGORY_MAP[id]
}

export function getMainCategories(): AttendanceCategory[] {
  return ALL_CATEGORIES.filter(function(c) { return c.parentId === null })
}

export function getSubCategories(parentId: string): AttendanceCategory[] {
  return ALL_CATEGORIES.filter(function(c) { return c.parentId === parentId })
}

export function getCategoryTree(): { main: AttendanceCategory; subs: AttendanceCategory[] }[] {
  return getMainCategories().map(function(main) {
    return { main: main, subs: getSubCategories(main.id) }
  })
}
