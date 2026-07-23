import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import type { DayAttendanceData } from '@/api/dashboard'

interface AttendanceCalendarProps {
  year: number
  month: number
  data: DayAttendanceData[]
  totalKaryawan: number
  onDayClick?: (tanggal: string) => void
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function AttendanceCalendar({ year, month, data, onDayClick }: AttendanceCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(year, month))

  const calendar = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const weeks: (number | null)[][] = []
    let week: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }
    return weeks
  }, [viewDate])

  function getStatus(day: number) {
    const tgl = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayData = data.find((d) => d.tanggal === tgl)
    if (!dayData) return null
    if (dayData.hadir > 0) return 'hadir'
    if (dayData.terlambat > 0) return 'terlambat'
    if (dayData.checkInOnly > 0) return 'checkInOnly'
    if (dayData.izin > 0) return 'izin'
    return 'tidakHadir'
  }

  function getStatusColor(status: string | null) {
    switch (status) {
      case 'hadir': return 'bg-green-200 dark:bg-green-800'
      case 'terlambat': return 'bg-yellow-200 dark:bg-yellow-800'
      case 'checkInOnly': return 'bg-blue-200 dark:bg-blue-800'
      case 'izin': return 'bg-purple-200 dark:bg-purple-800'
      case 'tidakHadir': return 'bg-red-200 dark:bg-red-800'
      default: return 'bg-muted'
    }
  }

  const today = new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
          <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>
        ))}
        {calendar.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} />
            const status = getStatus(day)
            const tgl = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = today.getFullYear() === viewDate.getFullYear() && today.getMonth() === viewDate.getMonth() && today.getDate() === day
            return (
              <button
                key={`${wi}-${di}`}
                className={cn(
                  'text-xs p-1.5 rounded-md transition-colors',
                  getStatusColor(status),
                  isToday ? 'ring-2 ring-primary' : '',
                  onDayClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                )}
                onClick={() => onDayClick?.(tgl)}
              >
                {day}
              </button>
            )
          })
        )}
      </div>

      <div className="flex gap-3 justify-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-200 dark:bg-green-800" /> Hadir</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-200 dark:bg-yellow-800" /> Terlambat</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 dark:bg-blue-800" /> Check-in</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-200 dark:bg-purple-800" /> Izin</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-200 dark:bg-red-800" /> Alfa</span>
      </div>
    </div>
  )
}

interface DayDetailDialogProps {
  tanggal: string
  userStatus: { status: string; checkIn: string | null; checkOut: string | null }
  onClose: () => void
}

export function DayDetailDialog({ tanggal, userStatus, onClose }: DayDetailDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</DialogTitle>
          <DialogDescription>Detail absensi Anda</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Check In</p>
            <p className="font-medium">{userStatus.checkIn ? new Date(userStatus.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Check Out</p>
            <p className="font-medium">{userStatus.checkOut ? new Date(userStatus.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted col-span-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="secondary" className={absensiStatusBadge[userStatus.status as keyof typeof absensiStatusBadge]}>
              {absensiStatusLabel[userStatus.status as keyof typeof absensiStatusLabel]}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
