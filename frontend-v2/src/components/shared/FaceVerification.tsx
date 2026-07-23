import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Camera, SkipForward, Loader2 } from 'lucide-react'

interface FaceVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: (photo?: string) => void
  onSkip: () => void
  mode: 'in' | 'out'
}

export function FaceVerification({
  open,
  onOpenChange,
  onVerified,
  onSkip,
}: FaceVerificationProps) {
  const [captured, setCaptured] = useState(false)
  const [loading] = useState(false)

  function handleCapture() {
    setCaptured(true)
  }

  function handleConfirm() {
    onVerified('data:image/jpeg;base64,placeholder')
    setCaptured(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Verifikasi Wajah</DialogTitle>
          <DialogDescription>Arahkan wajah ke kamera</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center">
            {captured ? (
              <div className="text-center p-4">
                <Camera className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-green-600 font-medium">Wajah terdeteksi</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Kamera siap</p>
                    <Button size="sm" onClick={handleCapture}>Ambil Foto</Button>
                  </>
                )}
              </div>
            )}
          </div>
          {captured && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCaptured(false)}>Ulangi</Button>
              <Button className="flex-1" onClick={handleConfirm}>Konfirmasi</Button>
            </div>
          )}
          {!captured && (
            <Button variant="outline" className="w-full gap-2" onClick={onSkip}>
              <SkipForward className="h-4 w-4" /> Lewati
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
