export const CHECK_IN_END = '09:00'
export const CHECK_OUT_MIN = '16:00'
export const MAX_CHECK_IN = '23:59'

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function canCheckIn(): { allowed: boolean; message: string } {
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const max = toMinutes(MAX_CHECK_IN)

  if (current > max) {
    return { allowed: false, message: 'Absensi sudah ditutup. Maksimal pukul 23:59.' }
  }
  return { allowed: true, message: '' }
}

export function canCheckOut(): { allowed: boolean; message: string; halfDay?: boolean } {
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()

  if (current < toMinutes('14:00')) {
    return { allowed: true, message: 'Half-day check-out (sebelum 14:00).', halfDay: true }
  }
  if (current < toMinutes(CHECK_OUT_MIN)) {
    return { allowed: true, message: 'Anda check-out sebelum jam 16:00 (pulang cepat).' }
  }
  return { allowed: true, message: '' }
}
