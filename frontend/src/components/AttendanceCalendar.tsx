import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { DayAttendanceData } from '@/api/dashboard'

interface Props {
  year: number
  month: number
  data: DayAttendanceData[]
  totalKaryawan: number
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function getDayStatus(day: DayAttendanceData, total: number): { label: string; color: string; bg: string } {
  const hadirPct = day.hadir / total
  const terlambatPct = day.terlambat / total
  const inOnlyPct = day.checkInOnly / total
  const izinPct = day.izin / total
  const alfaPct = day.tidakHadir / total

  if (hadirPct > 0.5) return { label: `${day.hadir} hadir`, color: 'text-green-700', bg: 'bg-green-100' }
  if (terlambatPct > 0.3) return { label: `${day.terlambat} terlambat`, color: 'text-yellow-700', bg: 'bg-yellow-100' }
  if (inOnlyPct > 0.3) return { label: `${day.checkInOnly} in saja`, color: 'text-blue-700', bg: 'bg-blue-100' }
  if (izinPct > 0.3) return { label: `${day.izin} izin`, color: 'text-purple-700', bg: 'bg-purple-100' }
  if (alfaPct > 0.5) return { label: `${day.tidakHadir} alfa`, color: 'text-gray-500', bg: 'bg-gray-100' }
  return { label: `${day.hadir}/${total}`, color: 'text-green-700', bg: 'bg-green-50' }
}

export function AttendanceCalendar({ year, month, data, totalKaryawan }: Props) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [firstDayOfWeek, daysInMonth])

  const dataMap = useMemo(() => {
    const map = new Map<string, DayAttendanceData>()
    data.forEach((d) => map.set(d.tanggal, d))
    return map
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">{monthNames[month]} {year}</h3>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-green-200" /> Hadir</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-yellow-200" /> Terlambat</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-blue-200" /> In No Out</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-purple-200" /> Izin</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-gray-200" /> Alfa</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{day}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} data-key={i} />
          const tgl = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayData = dataMap.get(tgl)
          const today = new Date().toISOString().split('T')[0] === tgl
          const status = dayData ? getDayStatus(dayData, totalKaryawan) : null

          return (
            <div
              key={tgl}
              className={cn(
                'rounded-lg p-1.5 text-center transition-colors border border-transparent',
                today && 'ring-2 ring-primary/40',
                status?.bg || 'bg-muted/30',
              )}
            >
              <p className={cn('text-sm font-medium', today && 'text-primary')}>{day}</p>
              {status && (
                <p className={cn('text-[10px] leading-tight mt-0.5', status.color)}>{status.label}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
