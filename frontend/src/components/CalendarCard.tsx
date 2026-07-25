import { Card, CardContent } from '@/components/ui/card'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { CalendarDays } from 'lucide-react'
import type { DayAttendanceData } from '@/api/dashboard'

interface CalendarCardProps {
  year: number
  month: number
  data: DayAttendanceData[]
  totalKaryawan?: number
  selectedDate?: string | null
  onSelectedDateChange?: (tgl: string | null) => void
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function CalendarCard({ year, month, data, totalKaryawan, selectedDate, onSelectedDateChange }: CalendarCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Kalender Absensi — {monthNames[month]} {year}
          </h3>
        </div>

        <AttendanceCalendar
          year={year}
          month={month}
          data={data}
          totalKaryawan={totalKaryawan}
          onDayClick={onSelectedDateChange ? (tgl) => onSelectedDateChange(tgl === selectedDate ? null : tgl) : undefined}
        />
      </CardContent>
    </Card>
  )
}
