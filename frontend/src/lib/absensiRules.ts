import type { AbsensiStatus } from '@/types'

export const CHECK_IN_START = '06:45'
export const CHECK_IN_END = '07:45'
export const CHECK_IN_MAX = '07:45'
export const CHECK_OUT_MIN = '16:00'

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function canCheckIn(timeMinutes = nowMinutes()): {
  allowed: boolean
  status: AbsensiStatus | null
  message: string
} {
  const start = toMinutes(CHECK_IN_START)
  const end = toMinutes(CHECK_IN_END)

  if (timeMinutes < start) {
    return {
      allowed: false,
      status: null,
      message: `Belum waktunya absen. Buka pukul ${CHECK_IN_START}`,
    }
  }
  if (timeMinutes <= end) {
    return {
      allowed: true,
      status: 'hadir',
      message: '',
    }
  }
  return {
    allowed: true,
    status: 'terlambat',
    message: 'Anda terlambat. Tetap lakukan check-in.',
  }
}

export function canCheckOut(timeMinutes = nowMinutes()): {
  allowed: boolean
  status: AbsensiStatus | null
  message: string
} {
  if (timeMinutes < toMinutes(CHECK_OUT_MIN)) {
    return {
      allowed: true,
      status: 'pulang_cepat',
      message: 'Anda check-out sebelum jam 16:00 (pulang cepat).',
    }
  }
  return {
    allowed: true,
    status: null,
    message: '',
  }
}

export function nextCheckInTime(): string {
  const now = nowMinutes()
  const start = toMinutes(CHECK_IN_START)
  if (now < start) {
    return minutesToTime(start)
  }
  return ''
}
