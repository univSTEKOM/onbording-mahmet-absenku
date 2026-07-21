import { useState, useMemo } from 'react'
import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LoadingState } from '@/components/shared/LoadingState'
import { FaceVerification } from '@/components/shared/FaceVerification'
import { canCheckIn, CHECK_IN_START, CHECK_IN_END, CHECK_OUT_MIN } from '@/lib/absensiRules'
import {
  Loader2, AlertTriangle, Clock,
  CheckCircle2, XCircle, ArrowRightFromLine, ArrowLeftFromLine,
} from 'lucide-react'

export default function AbsensiPage() {
  const { data: absensi, isLoading } = useAbsensiToday()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()
  const [showFaceVerification, setShowFaceVerification] = useState(false)

  const now = new Date()
  const today = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const checkInGate = useMemo(() => canCheckIn(), [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
        <Card><CardContent className="py-12"><LoadingState /></CardContent></Card>
      </div>
    )
  }

  const isCheckedIn = !!absensi?.checkIn
  const isCheckedOut = !!absensi?.checkOut

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Absensi Hari Ini</h1>
        <p className="text-muted-foreground">{today}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {currentTime}
        </div>
      </div>

      <Card className="bg-muted/40 border-dashed">
        <CardContent className="py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Check-in <strong>{CHECK_IN_START}–{CHECK_IN_END}</strong> &middot; Check-out mulai <strong>{CHECK_OUT_MIN}</strong></span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {!isCheckedIn ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" /> Belum absen
                </div>
              </div>

              {!checkInGate.allowed && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {checkInGate.message}
                </div>
              )}
              {checkInGate.allowed && checkInGate.status === 'terlambat' && (
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {checkInGate.message}
                </div>
              )}

              <Button
                size="lg" className="w-full gap-2 h-14 text-base shadow-sm"
                onClick={() => setShowFaceVerification(true)}
                disabled={!checkInGate.allowed || checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><ArrowRightFromLine className="h-5 w-5" /> Check-in Sekarang</>
                )}
              </Button>
            </div>
          ) : isCheckedOut ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Absensi Selesai
              </div>
              <Progress value={100} className="h-2" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Masuk</p>
                  <p className="text-xl font-bold">{new Date(absensi.checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Pulang</p>
                  <p className="text-xl font-bold">{new Date(absensi.checkOut!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <p className="text-sm capitalize text-muted-foreground">Status: {absensi.status}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                Sudah Check-in
              </div>
              <Progress value={50} className="h-2" />
              <div>
                <p className="text-sm text-muted-foreground">Jam masuk</p>
                <p className="text-3xl font-bold">{new Date(absensi.checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <p className="text-sm capitalize text-muted-foreground">Status: {absensi.status}</p>
              <Button
                size="lg" className="w-full gap-2 h-14 text-base" variant="outline"
                onClick={() => checkOutMutation.mutate(absensi.id)}
                disabled={checkOutMutation.isPending}
              >
                {checkOutMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><ArrowLeftFromLine className="h-5 w-5" /> Check-out Sekarang</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <FaceVerification
        open={showFaceVerification}
        onOpenChange={setShowFaceVerification}
        onVerified={() => { setShowFaceVerification(false); checkInMutation.mutate() }}
        onSkip={() => { setShowFaceVerification(false); checkInMutation.mutate() }}
      />
    </div>
  )
}
