export const CHECK_IN_START = '06:45'
export const CHECK_IN_END = '07:45'
export const CHECK_OUT_MIN = '16:00'

export function canCheckIn() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes
  const start = 6 * 60 + 45
  const end = 7 * 60 + 45
  return {
    allowed: totalMinutes >= start && totalMinutes <= end,
    reason: totalMinutes < start ? `Absensi dibuka pukul ${CHECK_IN_START}` : totalMinutes > end ? 'Waktu absensi sudah berakhir' : '',
  }
}
