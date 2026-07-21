import { useState, useMemo } from 'react'
import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/shared/LoadingState'
import { FaceVerification } from '@/components/shared/FaceVerification'
import { canCheckIn, canCheckOut, CHECK_IN_START, CHECK_IN_END, CHECK_OUT_MIN } from '@/lib/absensiRules'
import { Fingerprint, LogOut, Loader2, AlertTriangle } from 'lucide-react'

export default function AbsensiPage() {
  const { data: absensi, isLoading } = useAbsensiToday()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()
  const [showFaceVerification, setShowFaceVerification] = useState(false)

  const now = new Date()
  const today = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const checkInGate = useMemo(() => canCheckIn(), [])
  const checkOutGate = useMemo(() => canCheckOut(), [])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Absensi Hari Ini</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Card>
          <CardContent><LoadingState /></CardContent>
        </Card>
      </div>
    )
  }

  const isCheckedIn = !!absensi?.checkIn
  const isCheckedOut = !!absensi?.checkOut

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Absensi Hari Ini</h1>
        <p className="text-muted-foreground">{today}</p>
        <p className="text-sm text-muted-foreground">{currentTime}</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="py-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Check-in: {CHECK_IN_START} – {CHECK_IN_END} | Check-out: mulai {CHECK_OUT_MIN}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Status Kehadiran</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {!isCheckedIn ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Anda belum melakukan check-in hari ini
              </p>
              {!checkInGate.allowed && (
                <p className="text-sm text-destructive flex items-center justify-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> {checkInGate.message}
                </p>
              )}
              {checkInGate.allowed && checkInGate.status === 'terlambat' && (
                <p className="text-sm text-yellow-600 flex items-center justify-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> {checkInGate.message}
                </p>
              )}
              <Button
                size="lg"
                className="w-full gap-2 h-14 text-base"
                onClick={() => setShowFaceVerification(true)}
                disabled={!checkInGate.allowed || checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><Fingerprint className="h-5 w-5" /> Check-in Sekarang</>
                )}
              </Button>
            </div>
          ) : isCheckedOut ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Absensi Selesai
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs">Masuk</p>
                  <p className="font-semibold text-base">
                    {new Date(absensi.checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs">Pulang</p>
                  <p className="font-semibold text-base">
                    {new Date(absensi.checkOut!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-sm capitalize text-muted-foreground">Status: {absensi.status}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Sudah Check-in
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Jam masuk</p>
                <p className="text-3xl font-bold">
                  {new Date(absensi.checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!checkOutGate.allowed && (
                <p className="text-sm text-destructive">{checkOutGate.message}</p>
              )}
              <p className="text-sm capitalize text-muted-foreground">Status: {absensi.status}</p>
              <Button
                size="lg"
                className="w-full gap-2 h-14 text-base"
                variant="outline"
                onClick={() => checkOutMutation.mutate(absensi.id)}
                disabled={checkOutMutation.isPending}
              >
                {checkOutMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><LogOut className="h-5 w-5" /> Check-out Sekarang</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <FaceVerification
        open={showFaceVerification}
        onOpenChange={setShowFaceVerification}
        onVerified={() => {
          setShowFaceVerification(false)
          checkInMutation.mutate()
        }}
        onSkip={() => {
          setShowFaceVerification(false)
          checkInMutation.mutate()
        }}
      />
    </div>
  )
}
