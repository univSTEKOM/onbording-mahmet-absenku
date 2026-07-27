import { useState, useEffect } from 'react'
import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { pengajuanJenisLabel } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FaceVerification } from '@/components/shared/FaceVerification'
import { canCheckIn, CHECK_IN_START } from '@/lib/absensiRules'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import {
  Loader2, LogIn, LogOut, History, ChevronRight, Clock, CheckCircle2,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { LoadingState } from '@/components/shared/LoadingState'
import { formatJam, hitungJam } from '@/lib/utils'

export default function AbsensiPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: absensi, isLoading } = useAbsensiToday()
  const { data: recentAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const { data: allPengajuan } = useAllPengajuan()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()
  const [showFaceVerification, setShowFaceVerification] = useState(false)
  const [mode, setMode] = useState<'in' | 'out'>('in')
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const today = clock.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const currentTime = clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const checkInGate = canCheckIn()

  const todayLeave = allPengajuan?.find(function(p) {
    return p.status === 'approved' && p.userId === user?.id
      && p.tanggalMulai <= clock.toISOString().split('T')[0]
      && p.tanggalSelesai >= clock.toISOString().split('T')[0]
  })

  const isCheckedIn = !!absensi?.checkIn
  const isCheckedOut = !!absensi?.checkOut
  const totalJam = hitungJam(absensi?.checkIn || null, absensi?.checkOut || null)
  const progress = isCheckedOut ? 100 : isCheckedIn ? 60 : 0
  const lastAbsensi = recentAbsensi?.[0]

  function handleFaceVerified(photo?: string) {
    setShowFaceVerification(false)
    if (mode === 'in') {
      checkInMutation.mutate(photo ? { photoUrl: photo } : {})
    } else if (absensi) {
      checkOutMutation.mutate({ id: absensi.id, photoUrl: photo })
    }
  }

  function openFaceVerification(m: 'in' | 'out') {
    setMode(m)
    setShowFaceVerification(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
        <LoadingState />
      </div>
    )
  }

  if (todayLeave && !absensi) {
    var leaveLabel = pengajuanJenisLabel[todayLeave.jenis as keyof typeof pengajuanJenisLabel] || todayLeave.jenis
    var leaveDateRange = new Date(todayLeave.tanggalMulai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
      + ' — ' + new Date(todayLeave.tanggalSelesai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div className="space-y-5 md:space-y-6 max-w-2xl animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <Card className="border-t-2 border-t-blue-500">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl">📋</div>
            <div>
              <p className="text-lg font-semibold">Hari ini Anda sedang <span className="text-blue-600">{leaveLabel.toLowerCase()}</span></p>
              <p className="text-sm text-muted-foreground mt-1">{leaveDateRange}</p>
            </div>
            {todayLeave.alasan && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 max-w-md mx-auto">
                "{todayLeave.alasan}"
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Tidak perlu melakukan absensi hari ini.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="py-4 text-center">
            <Button variant="outline" size="sm" onClick={function() { navigate({ to: '/pengajuan' }) }}>
              Lihat daftar pengajuan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = isCheckedOut ? 3 : isCheckedIn ? 2 : 1
  const timelineSteps = [
    { label: 'Check In', time: formatJam(absensi?.checkIn || null), icon: LogIn },
    { label: 'Bekerja', time: isCheckedIn && !isCheckedOut ? currentTime : '-', icon: Clock },
    { label: 'Check Out', time: formatJam(absensi?.checkOut || null), icon: LogOut },
    { label: 'Selesai', time: isCheckedOut ? totalJam : '-', icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-5 md:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      <Card className="overflow-hidden" data-slot="absensi-progress">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-5 mb-5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sekarang</span>
              <span className="text-3xl md:text-4xl font-bold tracking-tight">{currentTime}</span>
            </div>
            <div className="flex-1 min-w-0">
              {absensi ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant="secondary" className={absensiStatusBadge[absensi.status]}>
                      {absensiStatusLabel[absensi.status]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Check In</span>
                      <span className="font-medium text-xs">{formatJam(absensi.checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Check Out</span>
                      <span className="font-medium text-xs">{formatJam(absensi.checkOut)}</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground text-right">
                    {isCheckedOut ? `Selesai — ${totalJam}` : isCheckedIn ? `${totalJam} · Belum check out` : 'Belum absen'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada absensi hari ini. Silakan check in untuk memulai.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isCheckedIn ? (
              <Button
                size="lg"
                className="flex-1 gap-2 h-12 md:h-14 text-sm md:text-base rounded-xl"
                onClick={() => openFaceVerification('in')}
                disabled={!checkInGate.allowed || checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Check In
              </Button>
            ) : !isCheckedOut ? (
              <Button
                size="lg"
                className="flex-1 gap-2 h-12 md:h-14 text-sm md:text-base rounded-xl"
                variant="outline"
                onClick={() => openFaceVerification('out')}
                disabled={checkOutMutation.isPending}
              >
                {checkOutMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                Check Out
              </Button>
            ) : (
              <div className="flex-1 flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Absensi selesai — terima kasih
              </div>
            )}
            {!checkInGate.allowed && !isCheckedIn && (
              <p className="text-xs text-muted-foreground text-center shrink-0">
                Buka {CHECK_IN_START}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 md:p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Linimasa</h3>
          <div className="space-y-0">
            {timelineSteps.map((step, i) => {
              const StepIcon = step.icon
              const isActive = i + 1 === currentStep
              const isPast = i + 1 < currentStep
              const isFuture = i + 1 > currentStep
              return (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isPast
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground/40'
                    }`}>
                      <StepIcon className="h-3.5 w-3.5" />
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-6 ${isPast ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className={`pb-4 ${i === timelineSteps.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-medium ${isFuture ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                      {step.label}
                    </p>
                    {step.time !== '-' && (
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {lastAbsensi && (
        <button
          type="button"
          onClick={() => navigate({ to: '/absensi/riwayat' })}
          className="w-full text-left"
        >
          <Card className="bg-muted/30 hover:bg-muted/50 transition-colors">
            <CardContent className="py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <History className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Terakhir:</span>
                <span className="font-medium whitespace-nowrap">
                  {new Date(lastAbsensi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <Badge variant="secondary" className={absensiStatusBadge[lastAbsensi.status] + ' whitespace-nowrap'}>
                  {absensiStatusLabel[lastAbsensi.status]}
                </Badge>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </button>
      )}

      <FaceVerification
        open={showFaceVerification}
        onOpenChange={setShowFaceVerification}
        onVerified={handleFaceVerified}
        mode={mode}
      />
    </div>
  )
}
