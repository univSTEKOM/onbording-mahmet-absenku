import { useAbsensiToday, useCheckIn, useCheckOut } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react'

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

  if (isLoading) return null

  const isCheckedIn = !!absensi?.checkIn
  const isCheckedOut = !!absensi?.checkOut

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Absensi Hari Ini</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!isCheckedIn ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Anda belum melakukan check-in hari ini
              </p>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
              >
                <LogIn className="h-5 w-5" />
                {checkInMutation.isPending ? 'Memproses...' : 'Check-in'}
              </Button>
            </div>
          ) : !isCheckedOut ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Sudah Check-in</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Jam masuk:{' '}
                {new Date(absensi.checkIn!).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <Button
                size="lg"
                className="w-full gap-2"
                variant="outline"
                onClick={() => checkOutMutation.mutate(absensi.id)}
                disabled={checkOutMutation.isPending}
              >
                <LogOut className="h-5 w-5" />
                {checkOutMutation.isPending ? 'Memproses...' : 'Check-out'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Absensi Selesai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Jam masuk:{' '}
                {new Date(absensi.checkIn!).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Jam pulang:{' '}
                {new Date(absensi.checkOut!).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
