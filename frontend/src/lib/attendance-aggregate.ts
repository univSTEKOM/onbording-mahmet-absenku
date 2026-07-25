import type { AttendanceType } from '@/types'
import { CATEGORY_MAP } from './attendance-categories'

export interface AttendanceRecord {
  mainCategory: string
  subCategory: string
  checkIn?: string | null
  checkOut?: string | null
}

export interface CategoryCount {
  id: string
  label: string
  count: number
  type: AttendanceType
  color: string
}

export interface TypeCount {
  type: AttendanceType
  count: number
}

export function aggregateByMainCategory(records: AttendanceRecord[]): CategoryCount[] {
  var map: Record<string, number> = {}
  records.forEach(function(r) {
    map[r.mainCategory] = (map[r.mainCategory] || 0) + 1
  })
  return Object.entries(map).map(function(e) {
    var cat = CATEGORY_MAP[e[0]]
    return {
      id: e[0],
      label: cat?.label || e[0],
      count: e[1],
      type: (cat?.type || 'present') as AttendanceType,
      color: cat?.color || 'var(--color-status-hadir)',
    }
  })
}

export function aggregateBySubCategory(records: AttendanceRecord[]): CategoryCount[] {
  var map: Record<string, number> = {}
  records.forEach(function(r) {
    map[r.subCategory] = (map[r.subCategory] || 0) + 1
  })
  return Object.entries(map).map(function(e) {
    var cat = CATEGORY_MAP[e[0]]
    return {
      id: e[0],
      label: cat?.label || e[0],
      count: e[1],
      type: (cat?.type || 'present') as AttendanceType,
      color: cat?.color || 'var(--color-status-hadir)',
    }
  })
}

export function aggregateByType(records: AttendanceRecord[]): TypeCount[] {
  var map: Record<string, number> = { present: 0, absent_permit: 0, absent_unpermit: 0 }
  records.forEach(function(r) {
    var cat = CATEGORY_MAP[r.subCategory] || CATEGORY_MAP[r.mainCategory]
    if (cat) map[cat.type] = (map[cat.type] || 0) + 1
  })
  return [
    { type: 'present' as AttendanceType, count: map.present },
    { type: 'absent_permit' as AttendanceType, count: map.absent_permit },
    { type: 'absent_unpermit' as AttendanceType, count: map.absent_unpermit },
  ]
}

export function countPresent(records: AttendanceRecord[]): number {
  return records.filter(function(r) {
    var cat = CATEGORY_MAP[r.subCategory] || CATEGORY_MAP[r.mainCategory]
    return cat?.type === 'present'
  }).length
}

export function countAbsentPermit(records: AttendanceRecord[]): number {
  return records.filter(function(r) {
    var cat = CATEGORY_MAP[r.subCategory] || CATEGORY_MAP[r.mainCategory]
    return cat?.type === 'absent_permit'
  }).length
}

export function countAbsentUnpermit(records: AttendanceRecord[]): number {
  return records.filter(function(r) {
    var cat = CATEGORY_MAP[r.subCategory] || CATEGORY_MAP[r.mainCategory]
    return cat?.type === 'absent_unpermit'
  }).length
}
