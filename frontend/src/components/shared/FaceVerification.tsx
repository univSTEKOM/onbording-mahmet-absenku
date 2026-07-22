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
  onVerified: () => void
  onSkip: () => void
  mode?: 'in' | 'out'
}

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
  const [cameraReady, setCameraReady] = useState(false)
  const loadingRef = useRef(false)
  const autoScanRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const saveFaceDescriptor = useCallback(async (descriptor: Float32Array) => {
    const registered = descriptorToArray(descriptor)
    if (!user) return
    return new Promise<void>((resolve, reject) => {
      updateUserMutation.mutate(
        { id: user.id, data: { foto: JSON.stringify(registered) } },
        {
          onSuccess: () => {
            updateUser({ foto: JSON.stringify(registered) })
            resolve()
          },
          onError: reject,
        }
      )
    })
  }, [user, updateUser, updateUserMutation])

  useEffect(() => {
    if (!open || loadingRef.current || modelsLoaded) return
    loadingRef.current = true
    loadModels()
      .then(() => { setModelsLoaded(true); setModelsError('') })
      .catch(() => { setModelsError('Gagal memuat model. Periksa koneksi Internet.') })
      .finally(() => { loadingRef.current = false })
  }, [open, modelsLoaded])

  useEffect(() => {
    if (!cameraReady || !modelsLoaded || autoScanRef.current) return
    autoScanRef.current = setInterval(async () => {
      if (processing || status === 'success') return
      if (!videoRef.current) return
      const video = videoRef.current
      if (video.readyState < 2) return

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0)

      try {
        const result = await detectFace(canvas)
        if (result) {
          if (autoScanRef.current) clearInterval(autoScanRef.current)
          autoScanRef.current = null
          await processFaceResult(result.descriptor)
        }
      } catch {
        // scan continue
      }
    }, 1500)

    return () => {
      if (autoScanRef.current) { clearInterval(autoScanRef.current); autoScanRef.current = null }
    }
  }, [cameraReady, modelsLoaded, processing, status])

  async function processFaceResult(descriptor: Float32Array) {
    setProcessing(true)
    setStatus('idle')
    setMessage('')

    try {
      const storedRaw = user?.foto
      let storedDescriptor: number[] | null = null
      if (storedRaw) {
        try {
          const parsed = JSON.parse(storedRaw)
          if (isFaceDescriptor(parsed)) storedDescriptor = parsed
        } catch { /* ignore */ }
      }

      if (storedDescriptor) {
        const match = isMatch(descriptor, arrayToDescriptor(storedDescriptor), 0.5)
        if (match) {
          setStatus('success')
          setMessage('Wajah cocok!')
          setTimeout(onVerified, 800)
        } else {
          setStatus('fail')
          setMessage('Wajah tidak cocok dengan data terdaftar.')
        }
      } else {
        await saveFaceDescriptor(descriptor)
        setStatus('success')
        setMessage('Wajah berhasil didaftarkan!')
        setTimeout(onVerified, 800)
      }
    } catch {
      setStatus('fail')
      setMessage('Gagal menyimpan data wajah. Coba lagi.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleManualCapture(canvas: HTMLCanvasElement) {
    setProcessing(true)
    setStatus('idle')
    setMessage('')
    try {
      const result = await detectFace(canvas)
      if (!result) {
        setStatus('fail')
        setMessage('Wajah tidak terdeteksi.')
        setProcessing(false)
        return
      }
      await processFaceResult(result.descriptor)
    } catch {
      setStatus('fail')
      setMessage('Gagal memproses wajah. Coba lagi.')
      setProcessing(false)
    }
  }

  function handleVideoReady(video: HTMLVideoElement) {
    videoRef.current = video
    setCameraReady(true)
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

        {cameraReady && modelsLoaded && (
          <p className="text-xs text-center text-muted-foreground">
            Posisikan wajah di depan kamera. Foto akan diambil otomatis saat wajah terdeteksi.
          </p>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 justify-center text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {status === 'fail' && (
          <div className="flex items-center gap-2 justify-center text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="text-sm">{message}</span>
          </div>
        )}

        {modelsLoaded && !processing && status !== 'success' && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Lewati verifikasi wajah
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
