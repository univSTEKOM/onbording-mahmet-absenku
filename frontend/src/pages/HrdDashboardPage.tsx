import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHrdWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { StatsCard } from '@/components/shared/StatsCard'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react'
import { STATUS_COLORS_MAP } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '@/api/axios'
import type { User } from '@/types'

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

const DONUT_ORDER = ['hadir', 'terlambat', 'izin', 'sakit', 'cuti', 'tidakHadir']

export default function HrdDashboardPage() {
  const navigate = useNavigate()
  const { data: hrdData, isLoading, refetch, isFetching } = useHrdWeek()
  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth + 1)
  const { data: pendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => api.get('/api/users/pending').then((r) => r.data as User[]),
  })

  const s = hrdData?.summary
  const chart = hrdData?.chart || []
  const pendingCount = pendingUsers?.length || 0
  const totalKaryawan = s?.totalKaryawan || 0

  const donutData = useMemo(() => {
    if (!monthData?.data) return []
    const hadirTotal = monthData.data.reduce((sum, d) => sum + (d.hadir || 0), 0)
    const terlambatTotal = monthData.data.reduce((sum, d) => sum + (d.terlambat || 0), 0)
    const izinTotal = monthData.data.reduce((sum, d) => sum + (d.izin || 0), 0)
    const sakitTotal = monthData.data.reduce((sum, d) => sum + (d.sakit || 0), 0)
    const cutiTotal = monthData.data.reduce((sum, d) => sum + (d.cuti || 0), 0)
    const alfaTotal = monthData.data.reduce((sum, d) => sum + (d.tidakHadir || 0), 0)
    return [
      { name: 'Hadir', value: hadirTotal },
      { name: 'Terlambat', value: terlambatTotal },
      { name: 'Izin', value: izinTotal },
      { name: 'Sakit', value: sakitTotal },
      { name: 'Cuti', value: cutiTotal },
      { name: 'Alfa', value: alfaTotal },
    ]
  }, [monthData])

  const hadirPct = donutData.length > 0 ? Math.round((donutData[0].value / (donutData.reduce((s, d) => s + d.value, 0) || 1)) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground text-sm">
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Karyawan" value={isLoading ? '-' : String(totalKaryawan)} icon={Users} />
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Hadir Hari Ini</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{isLoading ? '-' : s?.hadirHariIni || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">dari {totalKaryawan} karyawan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Terlambat</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{isLoading ? '-' : s?.terlambatHariIni || 0}</p>
            {s?.terlambatHariIni && s.terlambatHariIni > 0 && (
              <Button variant="link" size="sm" className="h-5 p-0 text-xs text-muted-foreground" onClick={() => navigate({ to: '/hrd/riwayat' })}>
                Lihat detail →
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="relative">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Verifikasi</span>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">karyawan perlu verifikasi</p>
            {pendingCount > 0 && (
              <Button size="sm" variant="ghost" className="absolute bottom-2 right-2 gap-1 text-xs text-blue-600 h-7" onClick={() => navigate({ to: '/hrd/verifikasi' })}>
                Verifikasi <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-base">Tren Kehadiran 7 Hari</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(today.getTime() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {' — '}
              {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : chart.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} barSize={28}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
                            <p className="font-medium mb-1">{d.name}</p>
                            {d.cuti > 0 && <p className="text-muted-foreground">Cuti: {d.cuti}</p>}
                            {d.sakit > 0 && <p className="text-muted-foreground">Sakit: {d.sakit}</p>}
                            {d.terlambat > 0 && <p className="text-muted-foreground">Terlambat: {d.terlambat}</p>}
                            {d.izin > 0 && <p className="text-muted-foreground">Izin: {d.izin}</p>}
                            {d.hadir > 0 && <p className="text-muted-foreground">Hadir: {d.hadir}</p>}
                            {d.tidakHadir > 0 && <p className="text-muted-foreground">Tidak Hadir: {d.tidakHadir}</p>}
                            <p className="text-muted-foreground text-xs mt-1">{d.persen}% kehadiran</p>
                          </div>
                        )
                      }}
                    />
                    {/* Stacked: belakang→depan = terbanyak→tersedikit */}
                    <Bar dataKey="tidakHadir" fill={STATUS_COLORS_MAP.tidakHadir} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="hadir" fill={STATUS_COLORS_MAP.hadir} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="izin" fill={STATUS_COLORS_MAP.izin} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill={STATUS_COLORS_MAP.terlambat} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="sakit" fill={STATUS_COLORS_MAP.sakit} radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="cuti" fill={STATUS_COLORS_MAP.cuti} radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
            )}
            <div className="flex items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.cuti }} /> Cuti</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.sakit }} /> Sakit</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.terlambat }} /> Terlambat</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.izin }} /> Izin</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.hadir }} /> Hadir</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP.tidakHadir }} /> Alfa</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-base">Kehadiran Bulan Ini</h3>
            <p className="text-xs text-muted-foreground">{monthNames[currentMonth]} {currentYear}</p>
          </div>
          <CardContent>
            {monthLoading ? (
              <Skeleton className="h-[200px] w-full rounded-lg" />
            ) : donutData.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="relative h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
                        {donutData.map((d, i) => (
                          <Cell key={i} fill={STATUS_COLORS_MAP[DONUT_ORDER[i]] || '#ccc'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{hadirPct}%</p>
                      <p className="text-[10px] text-muted-foreground">hadir</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 text-xs">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS_MAP[DONUT_ORDER[i]] || '#ccc' }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {monthLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <AttendanceCalendar
              year={currentYear}
              month={currentMonth}
              data={monthData?.data || []}
              totalKaryawan={monthData?.totalKaryawan || totalKaryawan}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
