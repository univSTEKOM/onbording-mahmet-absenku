export const CHECK_IN_START = '06:45'
export const CHECK_IN_END = '07:45'
export const CHECK_OUT_MIN = '16:00'

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function canCheckIn(): { allowed: boolean; message: string } {
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const start = toMinutes(CHECK_IN_START)
  const end = toMinutes(CHECK_IN_END)

  if (current < start) {
    return { allowed: false, message: `Belum waktunya absen. Buka pukul ${CHECK_IN_START}` }
  }
  if (current <= end) {
    return { allowed: true, message: '' }
  }
  return { allowed: true, message: 'Anda terlambat. Tetap lakukan check-in.' }
}

export function canCheckOut(): { allowed: boolean; message: string } {
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()

  if (current < toMinutes(CHECK_OUT_MIN)) {
    return { allowed: true, message: 'Anda check-out sebelum jam 16:00 (pulang cepat).' }
  }
  return { allowed: true, message: '' }
}
