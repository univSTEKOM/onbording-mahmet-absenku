import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
  processing?: boolean
  autoStart?: boolean

}

export function WebcamCapture({ onCapture, processing, autoStart }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const startCamera = useCallback(async () => {
    setError('')
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)
    } catch {
      setError('Kamera tidak tersedia. Periksa izin kamera atau gunakan HTTPS.')
    } finally {
      setStarting(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }, [])

  useEffect(() => {
    if (autoStart) startCamera()
    return () => {
      stopCamera()
      if (scanTimerRef.current) clearInterval(scanTimerRef.current)
    }
  }, [autoStart, startCamera, stopCamera])

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    onCapture(canvas)
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-sm rounded-lg overflow-hidden bg-muted">
        {starting ? (
          <div className="flex items-center justify-center aspect-[4/3] text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Mengakses kamera...
          </div>
        ) : active ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center aspect-[4/3] text-muted-foreground gap-2">
            <CameraOff className="h-8 w-8" />
            <span className="text-sm">Kamera tidak aktif</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-3">
        {!active ? (
          <Button onClick={startCamera} disabled={starting} className="gap-2">
            {starting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Membuka...</>
            ) : (
              <><Camera className="h-4 w-4" /> Buka Kamera</>
            )}
          </Button>
        ) : (
          <Button onClick={handleCapture} disabled={processing} className="gap-2">
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              <><Camera className="h-4 w-4" /> Ambil Foto</>
            )}
          </Button>
        )}
        {active && (
          <Button variant="outline" onClick={stopCamera}>
            Tutup Kamera
          </Button>
        )}
      </div>
    </div>
  )
}
