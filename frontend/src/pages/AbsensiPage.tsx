import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/shared/LoadingState'
import { LogIn, LogOut, Loader2 } from 'lucide-react'

export default function AbsensiPage() {
  const { data: absensi, isLoading } = useAbsensiToday()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  const now = new Date()
  const today = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Absensi Hari Ini</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Card>
          <CardContent>
            <LoadingState />
          </CardContent>
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
              <Button
                size="lg"
                className="w-full gap-2 h-14 text-base"
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Check-in Sekarang
                  </>
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
                    {new Date(absensi.checkIn!).toLocaleTimeString(
                      'id-ID',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs">Pulang</p>
                  <p className="font-semibold text-base">
                    {new Date(absensi.checkOut!).toLocaleTimeString(
                      'id-ID',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Sudah Check-in
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Jam masuk</p>
                <p className="text-3xl font-bold">
                  {new Date(absensi.checkIn!).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 h-14 text-base"
                variant="outline"
                onClick={() => checkOutMutation.mutate(absensi.id)}
                disabled={checkOutMutation.isPending}
              >
                {checkOutMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    Check-out Sekarang
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
