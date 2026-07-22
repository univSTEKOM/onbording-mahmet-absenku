import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WebcamCapture } from './WebcamCapture'
import {
  loadModels,
  detectFace,
  descriptorToArray,
  isMatch,
  arrayToDescriptor,
  isFaceDescriptor,
} from '@/lib/faceDetection'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUsers'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'

interface FaceVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: (photo?: string) => void
  onSkip: () => void
  mode?: 'in' | 'out'
}

const STABLE_FRAMES = 3
const SCAN_INTERVAL = 1200

export function FaceVerification({
  open,
  onOpenChange,
  onVerified,
  onSkip,
  mode = 'in',
}: FaceVerificationProps) {
  const { user, updateUser } = useAuth()
  const updateUserMutation = useUpdateUser()
  const [processing, setProcessing] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const [message, setMessage] = useState('')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const photoRef = useRef<string | null>(null)

  const loadingRef = useRef(false)
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stableCountRef = useRef(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const finishedRef = useRef(false)

  const saveDescriptor = useCallback(async (descriptor: Float32Array) => {
    const arr = descriptorToArray(descriptor)
    if (!user) return
    return new Promise<void>((resolve, reject) => {
      updateUserMutation.mutate(
        { id: user.id, data: { foto: JSON.stringify(arr) } },
        { onSuccess: () => { updateUser({ foto: JSON.stringify(arr) }); resolve() }, onError: reject }
      )
    })
  }, [user, updateUser, updateUserMutation])

  /* Load models once */
  useEffect(() => {
    if (!open || loadingRef.current || modelsLoaded) return
    loadingRef.current = true
    finishedRef.current = false
    loadModels()
      .then(() => { setModelsLoaded(true); setModelsError('') })
      .catch(() => { setModelsError('Gagal memuat model. Periksa koneksi Internet.') })
      .finally(() => { loadingRef.current = false })
  }, [open, modelsLoaded])

  /* Stop scan when dialog closes */
  useEffect(() => {
    if (!open) {
      if (scanRef.current) { clearInterval(scanRef.current); scanRef.current = null }
      stableCountRef.current = 0
      setCapturedPhoto(null)
      setStatus('idle')
      setMessage('')
      finishedRef.current = false
    }
  }, [open])

  /* Auto-scan loop — only runs when camera is ready + models loaded + not finished */
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || finishedRef.current || scanRef.current) return

    scanRef.current = setInterval(async () => {
      if (finishedRef.current || !videoRef.current || videoRef.current.readyState < 2) return

      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(videoRef.current, 0, 0)

      try {
        const result = await detectFace(canvas, 3000)
        if (result) {
          stableCountRef.current++
          if (stableCountRef.current >= STABLE_FRAMES) {
            /* Face is stable — capture now */
            if (scanRef.current) { clearInterval(scanRef.current); scanRef.current = null }
            const photoUrl = canvas.toDataURL('image/jpeg', 0.7)
            photoRef.current = photoUrl
            setCapturedPhoto(photoUrl)
            await processResult(result.descriptor)
          }
        } else {
          stableCountRef.current = 0
        }
      } catch {
        /* timeout, keep scanning */
      }
    }, SCAN_INTERVAL)

    return () => {
      if (scanRef.current) { clearInterval(scanRef.current); scanRef.current = null }
    }
  }, [modelsLoaded])

  async function processResult(descriptor: Float32Array) {
    if (finishedRef.current) return
    finishedRef.current = true
    setProcessing(true)
    setStatus('idle')
    setMessage('')

    try {
      const raw = user?.foto
      let stored: number[] | null = null
      if (raw) {
        try { const p = JSON.parse(raw); if (isFaceDescriptor(p)) stored = p } catch { /* ok */ }
      }

      if (stored) {
        const match = isMatch(descriptor, arrayToDescriptor(stored))
        if (match) { setStatus('success'); setMessage('Wajah cocok!'); setTimeout(() => onVerified(photoRef.current ?? undefined), 800) }
        else { setStatus('fail'); setMessage('Wajah tidak cocok dengan data terdaftar.') }
      } else {
        await saveDescriptor(descriptor)
        setStatus('success'); setMessage('Wajah berhasil didaftarkan!'); setTimeout(() => onVerified(photoRef.current ?? undefined), 800)
      }
    } catch {
      setStatus('fail'); setMessage('Gagal menyimpan data wajah.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleManualCapture(canvas: HTMLCanvasElement) {
    if (finishedRef.current) return
    finishedRef.current = true
    setProcessing(true); setStatus('idle'); setMessage('')
    const photoUrl = canvas.toDataURL('image/jpeg', 0.7)
    photoRef.current = photoUrl
    setCapturedPhoto(photoUrl)
    try {
      const result = await detectFace(canvas)
      if (!result) { setStatus('fail'); setMessage('Wajah tidak terdeteksi.'); setProcessing(false); return }
      await processResult(result.descriptor)
    } catch { setStatus('fail'); setMessage('Gagal memproses wajah.'); setProcessing(false) }
  }

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video
  }, [])

  function handleRetry() {
    finishedRef.current = false
    setStatus('idle')
    setMessage('')
    setCapturedPhoto(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Wajah</DialogTitle>
          <DialogDescription>
            {user?.foto
              ? `Verifikasi wajah untuk ${mode === 'in' ? 'check in' : 'check out'}`
              : 'Daftarkan wajah Anda untuk absensi selanjutnya'}
          </DialogDescription>
        </DialogHeader>

        {modelsError ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm text-center space-y-3">
            <AlertTriangle className="h-8 w-8 mx-auto" />
            <p>{modelsError}</p>
            <Button variant="outline" size="sm" onClick={onSkip}>Lewati verifikasi</Button>
          </div>
        ) : !modelsLoaded ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Memuat model pengenalan wajah...
          </div>
        ) : (
          <WebcamCapture onCapture={handleManualCapture} processing={processing} autoStart onVideoReady={handleVideoReady} />
        )}

        {capturedPhoto && (
          <div className="mx-auto w-20 h-20 rounded-lg overflow-hidden border">
            <img src={capturedPhoto} alt="captured" className="w-full h-full object-cover" />
          </div>
        )}

        {modelsLoaded && !finishedRef.current && (
          <p className="text-xs text-center text-muted-foreground">
            Posisikan wajah di depan kamera. Foto akan diambil otomatis.
          </p>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 justify-center text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {status === 'fail' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 justify-center text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>Coba Lagi</Button>
              <Button variant="ghost" size="sm" onClick={onSkip}>Lewati</Button>
            </div>
          </div>
        )}

        {status !== 'success' && status !== 'fail' && !processing && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onSkip}>Lewati verifikasi</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
