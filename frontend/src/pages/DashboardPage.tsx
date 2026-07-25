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
import { absensiChartConfig, pieDataItem, statusColor } from '@/lib/chart-config'

var now = new Date()
var curMonth = now.getMonth()
var curYear = now.getFullYear()

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn) return '-'
  var keluar = checkOut ? new Date(checkOut).getTime() : Date.now()
  var selisih = Math.max(0, keluar - new Date(checkIn).getTime())
  var jam = Math.floor(selisih / (1000 * 60 * 60))
  var menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return jam + 'j ' + menit + 'm'
}

function getGreeting(): { text: string; icon: typeof Sun } {
  var hour = now.getHours()
  if (hour < 12) return { text: 'Selamat pagi', icon: Sunrise }
  if (hour < 15) return { text: 'Selamat siang', icon: Sun }
  if (hour < 18) return { text: 'Selamat sore', icon: Sun }
  return { text: 'Selamat malam', icon: Moon }
}

export default function DashboardPage() {
  var { user } = useAuth()
  var navigate = useNavigate()
  var [detailDate, setDetailDate] = useState<string | null>(null)
  var { data: recentAbsensi, isLoading: weekLoading } = useRecentAbsensi()
  var { data: monthData } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  var { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  var { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: now.toISOString().split('T')[0] })
  var { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )
  var { data: allPengajuan } = useAllPengajuan()

  var dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(function(p) { return p.status === 'approved' && p.userId === user?.id && p.tanggalMulai <= detailDate && p.tanggalSelesai >= detailDate })
    : null

  var isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  var isCheckedOut = !!todayAbsensi?.[0]?.checkOut

  var monthStats = {
    total: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) }).length || 0,
    hadir: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'hadir' }).length || 0,
    pulangCepat: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'pulang_cepat' }).length || 0,
    terlambat: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && a.status === 'terlambat' }).length || 0,
    izinSakit: allAbsensi?.filter(function(a) { return a.tanggal.startsWith(curYear + '-' + String(curMonth + 1).padStart(2, '0')) && ['izin', 'sakit', 'cuti'].includes(a.status) }).length || 0,
  }

  var recent5 = useMemo(function() {
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
    var cutoffStr = cutoff.toISOString().split('T')[0]
    return allAbsensi?.filter(function(a) { return a.tanggal >= cutoffStr }).slice(0, 5) || []
  }, [allAbsensi])

  var pie7Data = useMemo(function() {
    var counts: Record<string, number> = { hadir: 0, pulangCepat: 0, terlambat: 0, tidakHadir: 0 }
    recentAbsensi?.forEach(function(item) {
      if (item.status === 'hadir') counts.hadir++
      else if (item.status === 'pulang_cepat') counts.pulangCepat++
      else if (item.status === 'terlambat') counts.terlambat++
      else counts.tidakHadir++
    })
    return [
      pieDataItem('hadir', counts.hadir),
      pieDataItem('pulang_cepat', counts.pulangCepat),
      pieDataItem('terlambat', counts.terlambat),
      pieDataItem('tidakHadir', counts.tidakHadir),
    ]
  }, [recentAbsensi])

  var total7 = pie7Data.reduce(function(s, d) { return s + d.value }, 0)
  var hadir7 = pie7Data[0].value
  var pulangCepat7 = pie7Data[1].value
  var pct7 = total7 > 0 ? Math.round(((hadir7 + pulangCepat7) / total7) * 100) : 0

  var totalMonth = monthStats.hadir + monthStats.pulangCepat + monthStats.terlambat + monthStats.izinSakit
  var totalKehadiran = monthStats.hadir + monthStats.pulangCepat
  var pctMonth = totalMonth > 0 ? Math.round((totalKehadiran / totalMonth) * 100) : 0

  var pieMonthData = useMemo(function() {
    return [
      pieDataItem('hadir', monthStats.hadir),
      pieDataItem('pulang_cepat', monthStats.pulangCepat),
      pieDataItem('terlambat', monthStats.terlambat),
      { name: 'izin/sakit', value: monthStats.izinSakit, fill: statusColor('sakit') },
    ]
  }, [monthStats.hadir, monthStats.pulangCepat, monthStats.terlambat, monthStats.izinSakit])

  if (!user) return null

  var todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  var todayAbsen = todayAbsensi?.[0]
  var greeting = getGreeting()
  var GreetIcon = greeting.icon

  var statsData = [
    { label: 'Hadir', value: totalKehadiran + ' hari', icon: CalendarDays, accent: 'border-t-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Pulang Cepat', value: monthStats.pulangCepat + ' kali', icon: ChevronsUpDown, accent: 'border-t-orange-500', iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Terlambat', value: monthStats.terlambat + ' kali', icon: TrendingUp, accent: 'border-t-amber-500', iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Izin / Sakit', value: monthStats.izinSakit + ' hari', icon: Clock, accent: 'border-t-blue-500', iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  ]

  var progress = isCheckedOut ? 100 : isCheckedIn ? 60 : 0

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
            <Button size="sm" className="gap-1.5 shrink-0" onClick={function() { navigate({ to: '/absensi' }) }}>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {statsData.map(function(stat) {
          var Icon = stat.icon
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
              config={absensiChartConfig}
              centerLabel={pct7 + '%'}
              centerSub="kehadiran"
              loading={weekLoading}
            />
            {total7 > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-muted-foreground justify-center">
                {pie7Data.filter(function(d) { return d.value > 0 }).map(function(d) {
                  return <span key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {d.name}: {d.value}</span>
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
              config={{ ...absensiChartConfig, 'izin/sakit': { label: 'Izin/Sakit', color: statusColor('sakit') } }}
              centerLabel={pctMonth + '%'}
              centerSub="kehadiran"
            />
            {totalMonth > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-muted-foreground justify-center">
                {pieMonthData.filter(function(d) { return d.value > 0 }).map(function(d) {
                  return <span key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {d.name}: {d.value}</span>
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                var tgl = new Date(a.tanggal + 'T00:00:00')
                var dayName = tgl.toLocaleDateString('id-ID', { weekday: 'short' })
                var dayNum = tgl.getDate()
                var monthShort = tgl.toLocaleDateString('id-ID', { month: 'short' })
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className="text-[10px] text-muted-foreground leading-none">{dayName}</span>
                      <span className="text-sm font-bold leading-tight">{dayNum}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">{monthShort}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS_MAP[a.status] || '#999' }} />
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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
