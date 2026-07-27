import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { canCheckIn, canCheckOut, CHECK_IN_START, CHECK_OUT_MIN } from '@/lib/absensiRules'

function setTime(hours: number, minutes: number) {
  const now = new Date()
  now.setHours(hours, minutes, 0, 0)
  vi.setSystemTime(now)
}

describe('absensiRules', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('canCheckIn', () => {
    it('blocks check-in before 06:45', () => {
      setTime(6, 0)
      const result = canCheckIn()
      expect(result.allowed).toBe(false)
      expect(result.message).toContain(CHECK_IN_START)
    })

    it('allows check-in at 06:45', () => {
      setTime(6, 45)
      expect(canCheckIn().allowed).toBe(true)
    })

    it('allows check-in at 07:00', () => {
      setTime(7, 0)
      expect(canCheckIn().allowed).toBe(true)
    })

    it('allows check-in at 07:45', () => {
      setTime(7, 45)
      expect(canCheckIn().allowed).toBe(true)
    })

    it('allows check-in after 07:45 with late message', () => {
      setTime(8, 0)
      const result = canCheckIn()
      expect(result.allowed).toBe(true)
      expect(result.message).toContain('terlambat')
    })

    it('allows check-in at 12:00 with late message', () => {
      setTime(12, 0)
      const result = canCheckIn()
      expect(result.allowed).toBe(true)
      expect(result.message).toContain('terlambat')
    })
  })

  describe('canCheckOut', () => {
    it('allows checkout before 16:00 with early message', () => {
      setTime(15, 0)
      const result = canCheckOut()
      expect(result.allowed).toBe(true)
      expect(result.message).toContain(CHECK_OUT_MIN)
    })

    it('allows checkout at 16:00', () => {
      setTime(16, 0)
      expect(canCheckOut().allowed).toBe(true)
    })

    it('allows checkout after 16:00', () => {
      setTime(17, 30)
      const result = canCheckOut()
      expect(result.allowed).toBe(true)
      expect(result.message).toBe('')
    })
  })
})
