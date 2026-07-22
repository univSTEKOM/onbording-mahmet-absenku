import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
  processing?: boolean
  autoStart?: boolean
  onVideoReady?: (video: HTMLVideoElement) => void
  active?: boolean
}

export function WebcamCapture({ onCapture, processing, autoStart, onVideoReady, active: externalActive }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const autoStartedRef = useRef(false)
  const [internalActive, setInternalActive] = useState(false)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const isActive = externalActive !== undefined ? externalActive && internalActive : internalActive

  const startCamera = useCallback(async () => {
    setError('')
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      setInternalActive(true)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadeddata = () => {
          if (onVideoReady && videoRef.current) onVideoReady(videoRef.current)
        }
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
    setInternalActive(false)
  }, [])

  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true
      startCamera()
    }
    return () => { stopCamera(); autoStartedRef.current = false }
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

  if (!isActive && !starting) return null

  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-sm rounded-lg overflow-hidden bg-muted">
        {starting ? (
          <div className="flex items-center justify-center aspect-[4/3] text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Mengakses kamera...
          </div>
        ) : internalActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
        ) : null}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">{error}</div>
      )}

      <div className="flex justify-center gap-3">
        {!internalActive && !starting && (
          <Button onClick={startCamera} disabled={starting} className="gap-2">
            {starting ? <><Loader2 className="h-4 w-4 animate-spin" /> Membuka...</> : <><Camera className="h-4 w-4" /> Buka Kamera</>}
          </Button>
        )}
        {internalActive && (
          <Button onClick={handleCapture} disabled={processing} className="gap-2">
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : <><Camera className="h-4 w-4" /> Ambil Foto</>}
          </Button>
        )}
        {internalActive && (
          <Button variant="outline" onClick={stopCamera}>Tutup Kamera</Button>
        )}
      </div>
    </div>
  )
}
