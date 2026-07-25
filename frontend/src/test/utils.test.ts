import { describe, it, expect } from 'vitest'
import { formatDate, formatTanggal, formatTime, durasiHari, hitungJam } from '@/lib/utils'

describe('formatDate', () => {
  it('formats date string to Indonesian locale', () => {
    const result = formatDate('2026-07-25')
    expect(result).toContain('Jul')
    expect(result).toContain('25')
    expect(result).toContain('2026')
  })

  it('handles ISO datetime string', () => {
    const result = formatDate('2026-07-25T08:00:00Z')
    expect(result).toContain('Jul')
  })
})

describe('formatTanggal', () => {
  it('uses formatDate internally', () => {
    expect(formatTanggal('2026-07-25')).toBe(formatDate('2026-07-25'))
  })
})

describe('formatTime', () => {
  it('returns formatted time', () => {
    const result = formatTime('2026-07-25T08:05:00Z')
    expect(result).toMatch(/^\d{2}[:.]\d{2}$/)
  })

  it('returns dash for null', () => {
    expect(formatTime(null)).toBe('-')
  })

  it('returns dash for empty string', () => {
    expect(formatTime('')).toBe('-')
  })
})

describe('durasiHari', () => {
  it('calculates same-day duration as 1 day', () => {
    expect(durasiHari('2026-07-25', '2026-07-25')).toBe(1)
  })

  it('calculates 3-day duration', () => {
    expect(durasiHari('2026-07-25', '2026-07-27')).toBe(3)
  })

  it('calculates week-long duration', () => {
    expect(durasiHari('2026-07-20', '2026-07-26')).toBe(7)
  })
})

describe('hitungJam', () => {
  it('returns dash for missing check-in', () => {
    expect(hitungJam(null, '2026-07-25T16:00:00Z')).toBe('-')
  })

  it('calculates 8-hour work day', () => {
    const checkIn = '2026-07-25T08:00:00Z'
    const checkOut = '2026-07-25T16:00:00Z'
    expect(hitungJam(checkIn, checkOut)).toBe('8j 0m')
  })

  it('calculates 7.5-hour work day', () => {
    const checkIn = '2026-07-25T08:00:00Z'
    const checkOut = '2026-07-25T15:30:00Z'
    expect(hitungJam(checkIn, checkOut)).toBe('7j 30m')
  })

  it('shows live duration when still checked in', () => {
    const checkIn = new Date(Date.now() - 3600000).toISOString()
    const result = hitungJam(checkIn, null)
    expect(result).toMatch(/\d+j \d+m/)
  })
})
