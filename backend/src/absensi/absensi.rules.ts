export const CHECK_IN_START = '06:45'
export const CHECK_IN_END = '07:45'
export const CHECK_OUT_MIN = '16:00'

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes(): number {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

export type CheckInResult =
  | { allowed: false; status: 'too_early' }
  | { allowed: true; status: 'hadir'; mainCategory: string; subCategory: string }
  | { allowed: true; status: 'terlambat'; mainCategory: string; subCategory: string }

export function evaluateCheckIn(): CheckInResult {
  const current = nowMinutes()
  const start = toMinutes(CHECK_IN_START)
  const end = toMinutes(CHECK_IN_END)

  if (current < start) return { allowed: false, status: 'too_early' }
  if (current <= end) return {
    allowed: true,
    status: 'hadir',
    mainCategory: 'physical_present',
    subCategory: 'physical_standard',
  }
  return {
    allowed: true,
    status: 'terlambat',
    mainCategory: 'physical_present',
    subCategory: 'physical_violation',
  }
}

export function evaluateCheckOut(): { pulangCepat: boolean; subCategory: string } {
  const current = nowMinutes()
  if (current < toMinutes(CHECK_OUT_MIN)) {
    return { pulangCepat: true, subCategory: 'physical_violation' }
  }
  return { pulangCepat: false, subCategory: 'physical_standard' }
}
