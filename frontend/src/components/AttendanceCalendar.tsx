import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { absensiStatusBadge, absensiStatusLabel, pengajuanJenisLabel, pengajuanJenisBadge, APP_RELEASE_DATE } from '@/lib/constants'
import type { DayAttendanceData } from '@/api/dashboard'
import type { Pengajuan } from '@/types'

interface Props {
  year: number
  month: number
  data: DayAttendanceData[]
  totalKaryawan?: number
  onDayClick?: (tanggal: string) => void
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const STATUS_COLORS: Record<string, string> = {
  hadir: 'bg-green-200 dark:bg-green-800',
  terlambat: 'bg-yellow-200 dark:bg-yellow-800',
  pulang_cepat: 'bg-orange-200 dark:bg-orange-800',
  izin: 'bg-blue-200 dark:bg-blue-800',
  sakit: 'bg-purple-200 dark:bg-purple-800',
  cuti: 'bg-gray-300 dark:bg-gray-600',
  checkInOnly: 'bg-blue-200 dark:bg-blue-800',
  tidakHadir: 'bg-red-200 dark:bg-red-800/60',
  sebelumRilis: 'bg-muted/20 dark:bg-muted/5',
  hariIni: 'bg-blue-100 dark:bg-blue-900/20',
  masaDepan: 'bg-muted/20 dark:bg-muted/5',
}

const todayStr = new Date().toISOString().split('T')[0]

function getDominantStatus(dayData: DayAttendanceData): string {
  if (dayData.hadir > 0) return 'hadir'
  if (dayData.terlambat > 0) return 'terlambat'
  if (dayData.checkInOnly > 0) return 'checkInOnly'
  if (dayData.izin > 0) return 'izin'
  if (dayData.sakit > 0) return 'sakit'
  if (dayData.cuti > 0) return 'cuti'
  return 'tidakHadir'
}

function getDayCellColor(tanggal: string, dayData: DayAttendanceData | undefined): string {
  if (tanggal < APP_RELEASE_DATE) return STATUS_COLORS.sebelumRilis
  if (tanggal > todayStr) return STATUS_COLORS.masaDepan
  if (tanggal === todayStr && !dayData) return STATUS_COLORS.hariIni
  if (!dayData) return STATUS_COLORS.tidakHadir
  const dominant = getDominantStatus(dayData)
  return STATUS_COLORS[dominant] || STATUS_COLORS.tidakHadir
}

function getDayLabel(tanggal: string, dayData: DayAttendanceData | undefined, isAdmin?: boolean, total?: number): string {
  if (tanggal < APP_RELEASE_DATE) return ''
  if (tanggal > todayStr) return ''
  if (tanggal === todayStr && !dayData) return 'Hari Ini'
  if (!dayData) return 'Alfa'
  if (isAdmin && total) {
    const parts: string[] = []
    if (dayData.hadir > 0) parts.push(`${dayData.hadir}H`)
    if (dayData.terlambat > 0) parts.push(`${dayData.terlambat}T`)
    if (dayData.izin > 0) parts.push(`${dayData.izin}I`)
    if (dayData.sakit > 0) parts.push(`${dayData.sakit}S`)
    if (dayData.cuti > 0) parts.push(`${dayData.cuti}C`)
    if (dayData.checkInOnly > 0) parts.push(`${dayData.checkInOnly}In`)
    return parts.length > 0 ? parts.join(' ') : 'Alfa'
  }
  if (dayData.hadir > 0) return 'Hadir'
  if (dayData.terlambat > 0) return 'Telat'
  if (dayData.checkInOnly > 0) return 'In'
  if (dayData.izin > 0) return 'Izin'
  if (dayData.sakit > 0) return 'Sakit'
  if (dayData.cuti > 0) return 'Cuti'
  return 'Alfa'
}

export function AttendanceCalendar({ year, month, data, totalKaryawan, onDayClick }: Props) {
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
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-green-200" /> H</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-yellow-200" /> T</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-blue-200" /> I</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-purple-200" /> S</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" /> C</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-200" /> A</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{day}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const tgl = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayData = dataMap.get(tgl)
          const today = new Date().toISOString().split('T')[0] === tgl
          const isBeforeRelease = tgl < APP_RELEASE_DATE
          const isFuture = tgl > todayStr
          const isDisabled = isBeforeRelease || isFuture
          const isAdmin = totalKaryawan !== undefined && totalKaryawan > 1

          return (
            <button
              key={tgl}
              type="button"
              onClick={() => isDisabled ? null : onDayClick?.(tgl)}
              className={cn(
                'rounded-lg p-1.5 text-center transition-colors border border-transparent text-left',
                isDisabled ? 'cursor-default' : 'cursor-pointer hover:border-primary/40',
                today && 'ring-2 ring-primary/40',
                getDayCellColor(tgl, dayData, isAdmin),
              )}
            >
              <p className={cn('text-sm font-medium', today && 'text-primary')}>{day}</p>
              <p className="text-[10px] leading-tight mt-0.5 text-foreground/60">
                {getDayLabel(tgl, dayData, isAdmin, totalKaryawan)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface DayDetailDialogProps {
  tanggal: string
  userStatus?: { status: string; checkIn: string | null; checkOut: string | null }
  pengajuan?: Pengajuan | null
  allStatus?: { nama: string; status: string }[]
  onClose: () => void
}

export function DayDetailDialog({ tanggal, userStatus, pengajuan, allStatus, onClose }: DayDetailDialogProps) {
  const date = new Date(tanggal + 'T00:00:00')
  const dayName = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const s = userStatus?.status as keyof typeof absensiStatusBadge | undefined

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{dayName}</DialogTitle>
          <DialogDescription>Detail absensi dan pengajuan</DialogDescription>
        </DialogHeader>

        {userStatus && s ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="secondary" className={absensiStatusBadge[s] || ''}>
                {absensiStatusLabel[s] || userStatus.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{userStatus.checkIn ? new Date(userStatus.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium">{userStatus.checkOut ? new Date(userStatus.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
            </div>
          </div>
        ) : pengajuan ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pengajuan</span>
              <Badge variant="secondary" className={pengajuanJenisBadge[pengajuan.jenis] || ''}>
                {pengajuanJenisLabel[pengajuan.jenis]}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Alasan</p>
              <p className="font-medium">{pengajuan.alasan}</p>
            </div>
            {pengajuan.catatan && (
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Catatan</p>
                <p className="text-sm p-2 rounded-md bg-muted">{pengajuan.catatan}</p>
              </div>
            )}
          </div>
        ) : userStatus && !s ? (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Tidak Absen</p>
            <p className="text-xs text-muted-foreground mt-1">Belum melakukan absensi pada tanggal ini.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data untuk tanggal ini.</p>
        )}

        {allStatus && allStatus.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium">Daftar Kehadiran</p>
            {allStatus.map((item) => (
              <div key={item.nama} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                <span>{item.nama}</span>
                <Badge variant="secondary" className={absensiStatusBadge[item.status as keyof typeof absensiStatusBadge] || 'bg-muted'}>
                  {absensiStatusLabel[item.status as keyof typeof absensiStatusLabel] || item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
