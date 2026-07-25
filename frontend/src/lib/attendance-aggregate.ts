import { CATEGORY_MAP } from './attendance-categories'
import type { Absensi } from '@/types'

export type AttendanceRecord = Pick<Absensi, 'mainCategory' | 'subCategory'> & { checkIn?: string | null; checkOut?: string | null }

export interface CategoryCount {
  id: string
  label: string
  count: number
  type: string
  color: string
}

export interface TypeCount {
  type: string
  count: number
}

function getType(mainCat: string, subCat: string): string {
  var cat = CATEGORY_MAP[subCat] || CATEGORY_MAP[mainCat]
  return cat?.type || 'present'
}

export function aggregateByMainCategory(records: AttendanceRecord[]): CategoryCount[] {
  var map: Record<string, number> = {}
  records.forEach(function(r) {
    var key = r.mainCategory || 'unknown'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(function(e) {
    var cat = CATEGORY_MAP[e[0]]
    return {
      id: e[0],
      label: cat?.label || e[0],
      count: e[1],
      type: cat?.type || 'present',
      color: cat?.color || 'var(--color-status-hadir)',
    }
  })
}

export function aggregateBySubCategory(records: AttendanceRecord[]): CategoryCount[] {
  var map: Record<string, number> = {}
  records.forEach(function(r) {
    var key = r.subCategory || 'unknown'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(function(e) {
    var cat = CATEGORY_MAP[e[0]]
    return {
      id: e[0],
      label: cat?.label || e[0],
      count: e[1],
      type: cat?.type || 'present',
      color: cat?.color || 'var(--color-status-hadir)',
    }
  })
}

export function aggregateByType(records: AttendanceRecord[]): TypeCount[] {
  var present = 0; var permit = 0; var unpermit = 0
  records.forEach(function(r) {
    var t = getType(r.mainCategory, r.subCategory)
    if (t === 'present') present++
    else if (t === 'absent_permit') permit++
    else if (t === 'absent_unpermit') unpermit++
  })
  return [
    { type: 'present', count: present },
    { type: 'absent_permit', count: permit },
    { type: 'absent_unpermit', count: unpermit },
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
