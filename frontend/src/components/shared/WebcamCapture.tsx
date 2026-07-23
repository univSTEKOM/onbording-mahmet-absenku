import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
  processing?: boolean
  onVideoReady?: (video: HTMLVideoElement) => void
  active?: boolean
}

export function WebcamCapture({ onCapture, processing, onVideoReady, active }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    setError('')
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      videoRef.current!.srcObject = stream
      videoRef.current!.onloadeddata = () => {
        if (onVideoReady && videoRef.current) onVideoReady(videoRef.current)
      }
    } catch {
      setError('Kamera tidak tersedia. Periksa izin kamera atau gunakan HTTPS.')
    } finally {
      setStarting(false)
    }
  }, [onVideoReady])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (active && !streamRef.current) {
      startCamera()
    }
    if (!active && streamRef.current) {
      stopCamera()
    }
    return () => { stopCamera() }
  }, [active, startCamera, stopCamera])

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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={'w-full aspect-[4/3] object-cover' + (active ? '' : ' hidden')}
        />
        <canvas ref={canvasRef} className="hidden" />
        {!active && (
          <div className="flex items-center justify-center aspect-[4/3] text-muted-foreground">
            {starting ? (
              <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Mengakses kamera...</>
            ) : error ? (
              <p className="text-sm text-destructive px-4 text-center">{error}</p>
            ) : (
              <p className="text-sm">Kamera siap</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {!active && !starting && (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="h-4 w-4" /> Buka Kamera
          </Button>
        )}
        {active && (
          <Button onClick={handleCapture} disabled={processing} className="gap-2">
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : <><Camera className="h-4 w-4" /> Ambil Foto</>}
          </Button>
        )}
      </div>
    </div>
  )
}
