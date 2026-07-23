import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentAbsensi, useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { useNavigate } from '@tanstack/react-router'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight, LogIn, LogOut } from 'lucide-react'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '-'
  const selisih = Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const { data: recentAbsensi, isLoading: weekLoading } = useRecentAbsensi()
  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  const { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: now.toISOString().split('T')[0] })

  const isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  const isCheckedOut = !!todayAbsensi?.[0]?.checkOut

  const monthStats = {
    total: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`)).length || 0,
    hadir: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && ['hadir', 'pulang_cepat'].includes(a.status)).length || 0,
    terlambat: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'terlambat').length || 0,
  }

  const recent5 = allAbsensi?.slice(0, 5)

  const weekDays = (recentAbsensi || []).map((item) => {
    const d = new Date(item.tanggal)
    return {
      ...item,
      dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthShort: d.toLocaleDateString('id-ID', { month: 'short' }),
      checkInTime: item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      checkOutTime: item.checkOut ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
    }
  })

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, <span className="font-medium text-foreground">{user.nama}</span></p>
        </div>
        <Button size="lg" className="gap-2 shadow-sm" onClick={() => navigate({ to: '/absensi' })}>
          <Fingerprint className="h-4 w-4" /> Absen Sekarang
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Status Hari Ini" value={isCheckedOut ? 'Selesai' : isCheckedIn ? 'Check-in' : 'Belum'} icon={Clock} />
        <StatsCard label={`Hadir (Bulan Ini)`} value={`${monthStats.hadir} hari`} icon={CalendarDays} />
        <StatsCard label="Terlambat" value={`${monthStats.terlambat} kali`} icon={TrendingUp} />
        <StatsCard label="Total Absensi" value={`${monthStats.total} hari`} icon={Fingerprint} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Absensi 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {weekLoading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : weekDays.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {weekDays.map((day) => (
                  <div
                    key={day.tanggal}
                    className="flex flex-col items-center gap-1.5 min-w-[80px] p-3 rounded-xl border bg-card text-center shrink-0"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{day.dayName}</span>
                    <span className="text-lg font-bold leading-none">{day.dateNum}</span>
                    <span className="text-[10px] text-muted-foreground">{day.monthShort}</span>
                    <div className="w-full h-px bg-border my-1" />
                    {day.status ? (
                      <>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${absensiStatusBadge[day.status as keyof typeof absensiStatusBadge]}`}>
                          {absensiStatusLabel[day.status as keyof typeof absensiStatusLabel]}
                        </span>
                        <div className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                          {day.checkInTime && <span className="flex items-center gap-1"><LogIn className="h-2.5 w-2.5 text-green-600" />{day.checkInTime}</span>}
                          {day.checkOutTime && <span className="flex items-center gap-1"><LogOut className="h-2.5 w-2.5 text-red-600" />{day.checkOutTime}</span>}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40">—</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">Belum ada data absensi 7 hari terakhir</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAbsensi?.[0] ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary" className={absensiStatusBadge[todayAbsensi[0].status]}>
                    {absensiStatusLabel[todayAbsensi[0].status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <span className="font-medium">
                    {new Date(todayAbsensi[0].checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Progress value={isCheckedOut ? 100 : 50} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-out</span>
                  <span className="font-medium">
                    {isCheckedOut
                      ? new Date(todayAbsensi[0].checkOut!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : 'Belum'}
                  </span>
                </div>
                {isCheckedOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Durasi</span>
                    <span className="font-medium">{hitungJam(todayAbsensi[0].checkIn, todayAbsensi[0].checkOut)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">Belum ada absensi hari ini</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              totalKaryawan={1}
              onDayClick={setDetailDate}
            />
          ) : (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>

      {detailDate && todayAbsensi?.[0] && (
        <DayDetailDialog
          tanggal={detailDate}
          userStatus={{
            status: todayAbsensi[0].status,
            checkIn: todayAbsensi[0].checkIn,
            checkOut: todayAbsensi[0].checkOut,
          }}
          onClose={() => setDetailDate(null)}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate({ to: '/absensi/riwayat' })}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {recent5?.length ? (
            <div className="space-y-1">
              {recent5.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <span className="text-sm">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {' — '}
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${absensiStatusBadge[a.status]}`}>{absensiStatusLabel[a.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada riwayat absensi" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
