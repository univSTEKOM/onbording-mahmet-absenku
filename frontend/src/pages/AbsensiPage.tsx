import { useState, useMemo } from 'react'
import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/shared/LoadingState'
import { FaceVerification } from '@/components/shared/FaceVerification'
import { canCheckIn, CHECK_IN_START, CHECK_IN_END, CHECK_OUT_MIN } from '@/lib/absensiRules'
import { absensiStatusBadge } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import {
  Loader2, LogIn, LogOut, History, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '-'
  const selisih = Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

export default function AbsensiPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: absensi, isLoading } = useAbsensiToday()
  const { data: recentAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()
  const [showFaceVerification, setShowFaceVerification] = useState(false)
  const [mode, setMode] = useState<'in' | 'out'>('in')

  const now = new Date()
  const today = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const checkInGate = useMemo(() => canCheckIn(), [])

  const isCheckedIn = !!absensi?.checkIn
  const isCheckedOut = !!absensi?.checkOut
  const totalJam = hitungJam(absensi?.checkIn || null, absensi?.checkOut || null)
  const progress = isCheckedOut ? 100 : isCheckedIn ? 50 : 0
  const lastAbsensi = recentAbsensi?.[0]

  if (isLoading) {
    return <div className="space-y-4"><h1 className="text-2xl font-bold">Absensi Hari Ini</h1><LoadingState /></div>
  }

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

  const steps = [
    { label: 'Check In', time: formatJam(absensi?.checkIn || null), done: isCheckedIn },
    { label: 'Sedang Bekerja', time: isCheckedIn && !isCheckedOut ? currentTime : '-', done: isCheckedIn && !isCheckedOut },
    { label: 'Check Out', time: formatJam(absensi?.checkOut || null), done: isCheckedOut },
    { label: 'Selesai', time: isCheckedOut ? totalJam : '-', done: isCheckedOut },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ringkasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {absensi ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary" className={absensiStatusBadge[absensi.status]}>{absensi.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check In</span>
                  <span className="font-medium">{formatJam(absensi.checkIn)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check Out</span>
                  <span className="font-medium">{formatJam(absensi.checkOut)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Jam</span>
                  <span className="font-medium">{totalJam}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {isCheckedOut ? 'Absensi selesai' : isCheckedIn ? 'Belum check out' : 'Belum absen'}
                </p>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">Belum ada absensi hari ini</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${step.done ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`} />
                    {i < steps.length - 1 && <div className={`w-0.5 h-8 ${step.done ? 'bg-primary' : 'bg-muted-foreground/20'}`} />}
                  </div>
                  <div className={`pb-4 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground/60'}`}>{step.label}</p>
                    {step.time !== '-' && <p className="text-xs text-muted-foreground">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`border-2 ${!isCheckedIn ? 'border-primary/30' : isCheckedOut ? 'border-green-200 dark:border-green-800' : 'border-blue-200 dark:border-blue-800'}`}>
        <CardContent className="py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {!isCheckedIn ? 'Check In' : isCheckedOut ? 'Absensi Selesai' : 'Check Out'}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isCheckedIn
                  ? `Window absensi ${CHECK_IN_START} - ${CHECK_IN_END}`
                  : isCheckedOut
                    ? 'Terima kasih, sampai jumpa besok!'
                    : `Check out mulai ${CHECK_OUT_MIN}`}
              </p>
            </div>
            <div className="flex gap-2">
              {!isCheckedIn ? (
                <Button size="lg" className="gap-2 min-w-[140px]" onClick={() => openFaceVerification('in')} disabled={!checkInGate.allowed || checkInMutation.isPending}>
                  {checkInMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  Check In
                </Button>
              ) : !isCheckedOut ? (
                <Button size="lg" variant="outline" className="gap-2 min-w-[140px]" onClick={() => openFaceVerification('out')} disabled={checkOutMutation.isPending}>
                  {checkOutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Check Out
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {lastAbsensi && (
        <Card className="bg-muted/30">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Absensi terakhir:</span>
              <span className="font-medium">{new Date(lastAbsensi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              <Badge variant="secondary" className={absensiStatusBadge[lastAbsensi.status]}>{lastAbsensi.status}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/absensi/riwayat')}>
              Riwayat <ChevronRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      <FaceVerification
        open={showFaceVerification}
        onOpenChange={setShowFaceVerification}
        onVerified={handleFaceVerified}
        onSkip={() => {
          setShowFaceVerification(false)
          if (mode === 'in') checkInMutation.mutate({})
          else if (absensi) checkOutMutation.mutate({ id: absensi.id })
        }}
        mode={mode}
      />
    </div>
  )
}
