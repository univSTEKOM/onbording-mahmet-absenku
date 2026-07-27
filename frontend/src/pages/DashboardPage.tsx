import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentAbsensi, useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { useNavigate } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel, STATUS_COLORS_MAP } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight, ChevronsUpDown, LogIn, LogOut, CheckCircle2, Sun, Moon, Sunrise } from 'lucide-react'
import { AttendancePieChart } from '@/components/shared/AttendancePieChart'
import { CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { attendanceCategoryConfig, pieDataItem } from '@/lib/chart-config'
import { formatJam, hitungJam } from '@/lib/utils'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = now.getHours()
  if (hour < 12) return { text: 'Selamat pagi', icon: Sunrise }
  if (hour < 15) return { text: 'Selamat siang', icon: Sun }
  if (hour < 18) return { text: 'Selamat sore', icon: Sun }
  return { text: 'Selamat malam', icon: Moon }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [detailDate, setDetailDate] = useState<string | null>(null)
  const { data: recentAbsensi, isLoading: weekLoading } = useRecentAbsensi()
  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  const { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: now.toISOString().split('T')[0] })
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )
  const { data: allPengajuan } = useAllPengajuan()

  const dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(function(p) { return p.status === 'approved' && p.userId === user?.id && p.tanggalMulai <= detailDate && p.tanggalSelesai >= detailDate })
    : null

  const isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  const isCheckedOut = !!todayAbsensi?.[0]?.checkOut

  const monthStats = {
    total: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) }).length || 0,
    hadir: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'hadir' }).length || 0,
    pulangCepat: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'pulang_cepat' }).length || 0,
    terlambat: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'terlambat' }).length || 0,
    izinSakit: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && ['izin', 'sakit', 'cuti'].includes(a.status) }).length || 0,
  }

  const recent5 = useMemo(function() {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return allAbsensi?.filter(function(a) { return a.tanggal >= cutoffStr }).slice(0, 5) || []
  }, [allAbsensi])

  const pie7Data = useMemo(function() {
    const counts = { present: 0, absentPermit: 0, absentUnpermit: 0 }
    recentAbsensi?.forEach(function(item) {
      if (['hadir','terlambat','pulang_cepat'].includes(item.status)) counts.present++
      else if (['izin','sakit','cuti'].includes(item.status)) counts.absentPermit++
      else counts.absentUnpermit++
    })
    return [
      pieDataItem('present', counts.present),
      pieDataItem('absentPermit', counts.absentPermit),
      pieDataItem('absentUnpermit', counts.absentUnpermit),
    ]
  }, [recentAbsensi])

  const total7 = pie7Data.reduce(function(s, d) { return s + d.value }, 0)
  const pct7 = total7 > 0 ? Math.round(((pie7Data[0]?.value || 0) / total7) * 100) : 0

  const pieMonthData = useMemo(function() {
    if (!monthData?.data) return []
    const present = monthData.data.reduce(function(s, d) { return s + d.hadir + d.pulangCepat + d.terlambat + d.checkInOnly }, 0)
    const permit = monthData.data.reduce(function(s, d) { return s + d.izin + d.sakit + d.cuti }, 0)
    const alfa = monthData.data.reduce(function(s, d) { return s + d.tidakHadir }, 0)
    return [
      pieDataItem('present', present),
      pieDataItem('absentPermit', permit),
      pieDataItem('absentUnpermit', alfa),
    ]
  }, [monthData])

  const totalMonth = pieMonthData.reduce(function(s, d) { return s + d.value }, 0)
  const totalKehadiran = monthStats.hadir + monthStats.pulangCepat
  const pctMonth = totalMonth > 0 ? Math.round(((pieMonthData[0]?.value || 0) / totalMonth) * 100) : 0

  if (!user) return null

  const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayAbsen = todayAbsensi?.[0]
  const greeting = getGreeting()
  const GreetIcon = greeting.icon

  const statsData = [
    { label: 'Hadir', value: totalKehadiran + ' hari', icon: CalendarDays, accent: 'border-t-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Pulang Cepat', value: monthStats.pulangCepat + ' kali', icon: ChevronsUpDown, accent: 'border-t-orange-500', iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Terlambat', value: monthStats.terlambat + ' kali', icon: TrendingUp, accent: 'border-t-amber-500', iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Izin / Sakit', value: monthStats.izinSakit + ' hari', icon: Clock, accent: 'border-t-blue-500', iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  ]

  const progress = isCheckedOut ? 100 : isCheckedIn ? 60 : 0

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GreetIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{greeting.text}, {user.nama.split(' ')[0]}</h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">{todayStr}</p>
        </div>
      </div>

      <Card className={'overflow-hidden border-t-2 ' + (isCheckedOut ? 'border-t-emerald-500' : isCheckedIn ? 'border-t-blue-500' : 'border-t-muted')}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Fingerprint className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-muted-foreground">Status Hari Ini</span>
                {todayAbsen && (
                  <Badge variant="secondary" className={absensiStatusBadge[todayAbsen.status]}>
                    {absensiStatusLabel[todayAbsen.status]}
                  </Badge>
                )}
              </div>
              <p className="text-base md:text-lg font-bold">
                {isCheckedOut ? 'Absensi Selesai' : isCheckedIn ? 'Sedang Bekerja' : 'Belum Absen'}
              </p>
              {todayAbsen && (
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><LogIn className="h-3 w-3 text-emerald-600" /> {formatJam(todayAbsen.checkIn)}</span>
                  {todayAbsen.checkOut && <span className="flex items-center gap-1"><LogOut className="h-3 w-3 text-red-600" /> {formatJam(todayAbsen.checkOut)}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-600" /> {hitungJam(todayAbsen.checkIn, todayAbsen.checkOut)}</span>
                </div>
              )}
            </div>
            <Button size="sm" className="gap-1.5 shrink-0" data-slot="absen-button" onClick={function() { navigate({ to: '/absensi' }) }}>
              <Fingerprint className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isCheckedIn ? 'Lihat' : 'Absen'}</span>
            </Button>
          </div>
          {todayAbsen && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-[11px] text-muted-foreground shrink-0">{progress + '%'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4" data-slot="summary-cards">
        {statsData.map(function(stat) {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={'border-t-2 ' + stat.accent}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] md:text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <div className={'p-1.5 rounded-md ' + stat.iconBg}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-sm md:text-base font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0 px-4 md:px-5 pt-4 md:pt-5">
            <div className="grid gap-0.5">
              <CardTitle className="text-sm md:text-base">7 Hari Terakhir</CardTitle>
              <CardDescription className="text-[11px] md:text-xs">
                {new Date(Date.now() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                {' — '}
                {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 items-center justify-center pb-3 px-4 md:px-5">
            <AttendancePieChart
              id="pie-7hari"
              data={pie7Data}
              config={attendanceCategoryConfig}
              centerLabel={pct7 + '%'}
              centerSub="kehadiran"
              loading={weekLoading}
            />
            {total7 > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-muted-foreground justify-center">
                {pie7Data.filter(function(d) { return d.value > 0 }).map(function(d) {
                  return <span key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {absensiStatusLabel[d.name as keyof typeof absensiStatusLabel] || d.name.replace(/_/g, ' ')}: {d.value}</span>
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0 px-4 md:px-5 pt-4 md:pt-5">
            <div className="grid gap-0.5">
              <CardTitle className="text-sm md:text-base">Bulan Ini</CardTitle>
              <CardDescription className="text-[11px] md:text-xs">
                {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 items-center justify-center pb-3 px-4 md:px-5">
            <AttendancePieChart
              id="pie-bulan"
              data={pieMonthData}
              config={attendanceCategoryConfig}
              centerLabel={pctMonth + '%'}
              centerSub="kehadiran"
            />
            {totalMonth > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-muted-foreground justify-center">
                {pieMonthData.filter(function(d) { return d.value > 0 }).map(function(d) {
                  return <span key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {absensiStatusLabel[d.name as keyof typeof absensiStatusLabel] || d.name.replace(/_/g, ' ')}: {d.value}</span>
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DISABLED — kalender. Aktifkan: ganti className="hidden" → className="" */}
      <div className="hidden">
      <Card>
        <CardContent className="p-4 md:p-5">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              onDayClick={setDetailDate}
            />
          ) : (
            <Skeleton className="h-[220px] md:h-[260px] w-full rounded-lg" />
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
          onClose={function() { setDetailDate(null) }}
        />
      )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-5 pt-4 md:pt-5">
          <CardTitle className="text-sm md:text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground" onClick={function() { navigate({ to: '/absensi/riwayat' }) }}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="px-4 md:px-5 pb-4 md:pb-5">
          {recent5.length > 0 ? (
            <div className="space-y-0 divide-y divide-border/50">
              {recent5.map(function(a) {
                const tgl = new Date(a.tanggal + 'T00:00:00')
                const dayName = tgl.toLocaleDateString('id-ID', { weekday: 'short' })
                const dayNum = tgl.getDate()
                const monthShort = tgl.toLocaleDateString('id-ID', { month: 'short' })
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className="text-[10px] text-muted-foreground leading-none">{dayName}</span>
                      <span className="text-sm font-bold leading-tight">{dayNum}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">{monthShort}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS_MAP[a.status] || 'var(--color-status-tidakHadir)' }} />
                        <span className="text-xs font-medium truncate">{absensiStatusLabel[a.status]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{formatJam(a.checkIn)}</span>
                        <span>-</span>
                        <span>{formatJam(a.checkOut)}</span>
                        <span className="text-muted-foreground/60">{'·'}</span>
                        <span>{hitungJam(a.checkIn, a.checkOut)}</span>
                      </div>
                    </div>
                    {a.faceVerified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="pointer-events-none">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>Wajah terverifikasi</p></TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Belum ada riwayat absensi" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
