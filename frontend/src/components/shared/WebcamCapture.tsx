import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'
import { detectFace, countFaces, drawFaceOverlay } from '@/lib/faceDetection'

/* Ubah ke true untuk mengaktifkan tombol ambil foto manual */
const MANUAL_CAPTURE_ENABLED = false

interface FaceStatus {
  detected: boolean
  stable: boolean
  message: string
  color: 'red' | 'yellow' | 'green'
}

interface WebcamCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
  processing?: boolean
  onVideoReady?: (video: HTMLVideoElement) => void
  active?: boolean
  onAutoCapture?: (photoUrl: string) => void
  onFaceStatus?: (status: FaceStatus) => void
}

const SCAN_DELAY = 300
const STABLE_THRESHOLD = 10
const MIN_FACE_AREA = 5000

export function WebcamCapture({ onCapture, processing, onVideoReady, active, onAutoCapture, onFaceStatus }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const captureRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stableRef = useRef(0)
  const frameRef = useRef(0)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const getVideoDimensions = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return { w: 640, h: 480 }
    return { w: v.videoWidth, h: v.videoHeight }
  }, [])

  const startCamera = useCallback(async () => {
    setError('')
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      video.onloadeddata = () => {
        if (onVideoReady) onVideoReady(video)
      }
    } catch (e) {
      console.error('WebcamCapture: startCamera error', e)
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
    if (active && !streamRef.current) startCamera()
    if (!active && streamRef.current) stopCamera()
    return () => stopCamera()
  }, [active, startCamera, stopCamera])

  /* Detection loop */
  useEffect(() => {
    if (!active || !onAutoCapture) return

    scanRef.current = setInterval(async () => {
      const v = videoRef.current
      if (!v || v.readyState < 2) return

      const { w, h } = getVideoDimensions()
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(v, 0, 0, w, h)
      const overlay = overlayRef.current
      if (!overlay) return

      try {
        const result = await detectFace(canvas, 500)
        const boxes: { x: number; y: number; width: number; height: number }[] = []

        if (result) {
          const box = result.detection.box
          const faceStable = (box.width * box.height) > MIN_FACE_AREA
          boxes.push({ x: box.x, y: box.y, width: box.width, height: box.height })
          drawFaceOverlay(overlay, w, h, boxes, faceStable)

          frameRef.current++
          if (frameRef.current % 3 === 0) {
            const faceCount = await countFaces(canvas)
            if (faceCount > 1) {
              stableRef.current = 0
              onFaceStatus?.({ detected: true, stable: false, message: `Terdeteksi ${faceCount} wajah. Pastikan hanya 1 wajah.`, color: 'yellow' })
              return
            }
          }

          if (faceStable) {
            stableRef.current++
            if (stableRef.current >= STABLE_THRESHOLD) {
              if (scanRef.current) { clearInterval(scanRef.current); scanRef.current = null }
              const photoUrl = canvas.toDataURL('image/jpeg', 0.7)
              onAutoCapture(photoUrl)
            }
            onFaceStatus?.({ detected: true, stable: true, message: 'Wajah terdeteksi, harap diam', color: 'green' })
          } else {
            stableRef.current = 0
            onFaceStatus?.({ detected: true, stable: false, message: 'Dekatkan wajah ke kamera', color: 'yellow' })
          }
        } else {
          stableRef.current = 0
          drawFaceOverlay(overlay, w, h, null, false)
          onFaceStatus?.({ detected: false, stable: false, message: 'Wajah tidak terdeteksi', color: 'red' })
        }
      } catch {
        stableRef.current = 0
      }
    }, SCAN_DELAY)

    return () => { if (scanRef.current) { clearInterval(scanRef.current); scanRef.current = null } }
  }, [active, onAutoCapture, onFaceStatus, getVideoDimensions])

  function handleManualCapture() {
    const v = videoRef.current
    const c = captureRef.current
    if (!v || !c) return
    c.width = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0)
    onCapture(c)
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
        <canvas
          ref={overlayRef}
          className={'absolute inset-0 w-full h-full pointer-events-none' + (active ? '' : ' hidden')}
        />
        <canvas ref={captureRef} className="hidden" />
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
        {MANUAL_CAPTURE_ENABLED && active && (
          <Button onClick={handleManualCapture} disabled={processing} className="gap-2">
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : <><Camera className="h-4 w-4" /> Ambil Foto</>}
          </Button>
        )}
      </div>
    </div>
  )
}
