import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { RefreshCw } from 'lucide-react'

export default function RiwayatPage() {
  const { user } = useAuth()
  const now = new Date()
  const curMonth = now.getMonth()
  const curYear = now.getFullYear()
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const { data: monthData, refetch, isFetching } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  const { data: allPengajuan } = useAllPengajuan()
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )

  const dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(function(p) { return p.status === 'approved' && p.userId === user?.id && p.tanggalMulai <= detailDate && p.tanggalSelesai >= detailDate })
    : null

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Kalender absensi Anda</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Muat ulang data</p></TooltipContent>
        </Tooltip>
      </div>

      <Card>
        <CardContent className="p-4 md:p-5">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              onDayClick={(tgl) => setDetailDate(tgl === detailDate ? null : tgl)}
            />
          ) : (
            <Skeleton className="h-[260px] md:h-[300px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>

      {detailDate && (
        <DayDetailDialog
          tanggal={detailDate}
          userStatus={dayDetail?.[0] ? {
            status: dayDetail[0].status,
            checkIn: dayDetail[0].checkIn,
            checkOut: dayDetail[0].checkOut,
            photos: dayDetail[0].photos,
          } : undefined}
          pengajuan={dayPengajuan || undefined}
          onClose={() => setDetailDate(null)}
        />
      )}
    </div>
  )
}
