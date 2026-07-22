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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const savePhoto = useCallback((canvas: HTMLCanvasElement) => {
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.7))
  }, [])

  useEffect(() => {
    if (!open || loadingRef.current || modelsLoaded) return
    loadingRef.current = true
    loadModels()
      .then(() => { setModelsLoaded(true); setModelsError('') })
      .catch(() => { setModelsError('Gagal memuat model. Periksa koneksi Internet.') })
      .finally(() => { loadingRef.current = false })
  }, [open, modelsLoaded])

  async function handleCapture(canvas: HTMLCanvasElement) {
    setProcessing(true)
    setStatus('idle')
    setMessage('')
    savePhoto(canvas)

    try {
      const result = await detectFace(canvas)
      if (!result) {
        setStatus('fail')
        setMessage('Wajah tidak terdeteksi. Coba lagi dengan pencahayaan yang cukup.')
        setProcessing(false)
        return
      }

      const storedRaw = user?.foto
      let storedDescriptor: number[] | null = null
      if (storedRaw) {
        try {
          const parsed = JSON.parse(storedRaw)
          if (isFaceDescriptor(parsed)) storedDescriptor = parsed
        } catch { /* ignore */ }
      }

      if (storedDescriptor) {
        const match = isMatch(result.descriptor, arrayToDescriptor(storedDescriptor), 0.5)
        if (match) {
          setStatus('success')
          setMessage('Wajah cocok!')
          setTimeout(onVerified, 800)
        } else {
          setStatus('fail')
          setMessage('Wajah tidak cocok dengan data terdaftar.')
        }
      } else {
        const registered = descriptorToArray(result.descriptor)
        if (!user) return
        updateUserMutation.mutate(
          { id: user.id, data: { foto: JSON.stringify(registered) } },
          {
            onSuccess: () => {
              updateUser({ foto: JSON.stringify(registered) })
              setStatus('success')
              setMessage('Wajah berhasil didaftarkan!')
              setTimeout(onVerified, 800)
            },
            onError: () => { setStatus('fail'); setMessage('Gagal menyimpan data wajah.') },
          }
        )
      }
    } catch (err) {
      setStatus('fail')
      setMessage(err instanceof Error && err.message.includes('Timeout')
        ? 'Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.'
        : 'Gagal memproses wajah. Coba lagi.')
    } finally {
      setProcessing(false)
    }
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
          <WebcamCapture onCapture={handleCapture} processing={processing} autoStart />
        )}

        {capturedPhoto && status !== 'idle' && (
          <div className="mx-auto w-20 h-20 rounded-lg overflow-hidden border">
            <img src={capturedPhoto} alt="captured" className="w-full h-full object-cover" />
          </div>
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
