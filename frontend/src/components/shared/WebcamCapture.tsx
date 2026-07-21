import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
  processing?: boolean
}

export function WebcamCapture({ onCapture, processing }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    setError('')
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
      setError('Kamera tidak tersedia')
    }
  }, [])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

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
        {active ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="flex items-center justify-center aspect-[4/3] text-muted-foreground">
            <CameraOff className="h-8 w-8" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="flex justify-center gap-3">
        {!active ? (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="h-4 w-4" />
            Buka Kamera
          </Button>
        ) : (
          <>
            <Button
              onClick={handleCapture}
              disabled={processing}
              className="gap-2"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {processing ? 'Memproses...' : 'Ambil Foto'}
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Tutup Kamera
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
