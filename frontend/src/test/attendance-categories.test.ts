import { describe, it, expect } from 'vitest'
import {
  getMainCategories,
  getSubCategories,
  getCategoryTree,
  ALL_CATEGORIES,
  LEGACY_STATUS_TO_CATEGORY,
} from '@/lib/attendance-categories'
import { aggregateByType, aggregateByMainCategory, aggregateBySubCategory } from '@/lib/attendance-aggregate'

describe('attendance-categories', function() {
  it('has 3 main categories', function() {
    var mains = getMainCategories()
    expect(mains.length).toBe(3)
    expect(mains[0].type).toBe('present')
    expect(mains[1].type).toBe('absent_permit')
    expect(mains[2].type).toBe('absent_unpermit')
  })

  it('has 14 sub categories', function() {
    var subs = ALL_CATEGORIES.filter(function(c) { return c.parentId !== null })
    expect(subs.length).toBe(14)
  })

  it('physical_present has 5 sub categories', function() {
    var subs = getSubCategories('physical_present')
    expect(subs.length).toBe(5)
    expect(subs[0].id).toBe('physical_standard')
    expect(subs[1].id).toBe('physical_flexible')
    expect(subs[2].id).toBe('physical_field')
    expect(subs[3].id).toBe('physical_overtime')
    expect(subs[4].id).toBe('physical_violation')
  })

  it('absent_permit has 6 sub categories', function() {
    expect(getSubCategories('absent_permit').length).toBe(6)
  })

  it('absent_unpermit has 3 sub categories', function() {
    expect(getSubCategories('absent_unpermit').length).toBe(3)
  })

  it('getCategoryTree returns 3 main with subs', function() {
    var tree = getCategoryTree()
    expect(tree.length).toBe(3)
    expect(tree[0].main.id).toBe('physical_present')
    expect(tree[0].subs.length).toBe(5)
    expect(tree[1].main.id).toBe('absent_permit')
    expect(tree[1].subs.length).toBe(6)
    expect(tree[2].main.id).toBe('absent_unpermit')
    expect(tree[2].subs.length).toBe(3)
  })

  it('LEGACY_STATUS_TO_CATEGORY maps correctly', function() {
    expect(LEGACY_STATUS_TO_CATEGORY.hadir).toEqual({ main: 'physical_present', sub: 'physical_standard' })
    expect(LEGACY_STATUS_TO_CATEGORY.terlambat).toEqual({ main: 'physical_present', sub: 'physical_violation' })
    expect(LEGACY_STATUS_TO_CATEGORY.pulang_cepat).toEqual({ main: 'physical_present', sub: 'physical_violation' })
    expect(LEGACY_STATUS_TO_CATEGORY.izin).toEqual({ main: 'absent_permit', sub: 'permit_general' })
    expect(LEGACY_STATUS_TO_CATEGORY.sakit).toEqual({ main: 'absent_permit', sub: 'permit_sick' })
    expect(LEGACY_STATUS_TO_CATEGORY.cuti).toEqual({ main: 'absent_permit', sub: 'leave_annual' })
    expect(LEGACY_STATUS_TO_CATEGORY.tidakHadir).toEqual({ main: 'absent_unpermit', sub: 'unpermit_absent' })
  })
})

describe('attendance-aggregate', function() {
  var records = [
    { mainCategory: 'physical_present', subCategory: 'physical_standard', checkIn: '2026-07-24T07:45:00Z', checkOut: '2026-07-24T16:30:00Z' },
    { mainCategory: 'physical_present', subCategory: 'physical_standard', checkIn: '2026-07-25T07:50:00Z', checkOut: '2026-07-25T16:00:00Z' },
    { mainCategory: 'absent_permit', subCategory: 'permit_sick' },
    { mainCategory: 'absent_permit', subCategory: 'leave_annual' },
    { mainCategory: 'absent_unpermit', subCategory: 'unpermit_absent' },
  ]

  it('aggregateByType counts by type', function() {
    var result = aggregateByType(records)
    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ type: 'present', count: 2 })
    expect(result[1]).toEqual({ type: 'absent_permit', count: 2 })
    expect(result[2]).toEqual({ type: 'absent_unpermit', count: 1 })
  })

  it('aggregateByMainCategory counts by main category', function() {
    var result = aggregateByMainCategory(records)
    expect(result.length).toBe(3)
    var physical = result.find(function(r) { return r.id === 'physical_present' })
    expect(physical?.count).toBe(2)
    var permit = result.find(function(r) { return r.id === 'absent_permit' })
    expect(permit?.count).toBe(2)
    var unpermit = result.find(function(r) { return r.id === 'absent_unpermit' })
    expect(unpermit?.count).toBe(1)
  })

  it('aggregateBySubCategory counts by sub category', function() {
    var result = aggregateBySubCategory(records)
    expect(result.length).toBe(4)
    var std = result.find(function(r) { return r.id === 'physical_standard' })
    expect(std?.count).toBe(2)
  })
})
