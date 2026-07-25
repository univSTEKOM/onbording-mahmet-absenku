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

const SAVE_TIMEOUT = 15000

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
  const [faceStatus, setFaceStatus] = useState('')
  const [faceColor, setFaceColor] = useState<'red' | 'yellow' | 'green'>('red')

  const loadingRef = useRef(false)
  const finishedRef = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveDescriptor = useCallback(async (descriptor: Float32Array) => {
    const arr = descriptorToArray(descriptor)
    if (!user) return
    return new Promise<void>((resolve, reject) => {
      saveTimeoutRef.current = setTimeout(() => reject(new Error('Timeout')), SAVE_TIMEOUT)
      updateUserMutation.mutate(
        { id: user.id, data: { faceDescriptor: JSON.stringify(arr) } },
        {
          onSuccess: () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            updateUser({ faceDescriptor: JSON.stringify(arr) })
            resolve()
          },
          onError: (err) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            reject(err)
          },
        }
      )
    })
  }, [user, updateUser, updateUserMutation])

  /* Reset state setiap dialog dibuka */
  useEffect(() => {
    if (!open) return
    finishedRef.current = false
    setCapturedPhoto(null)
    setStatus('idle')
    setMessage('')
    setFaceStatus('')
    if (saveTimeoutRef.current) { clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null }
  }, [open])

  /* Load models hanya sekali */
  useEffect(() => {
    if (!open || loadingRef.current || modelsLoaded) return
    loadingRef.current = true
    loadModels()
      .then(() => { setModelsLoaded(true); setModelsError('') })
      .catch(() => { setModelsError('Gagal memuat model. Periksa koneksi Internet.') })
      .finally(() => { loadingRef.current = false })
  }, [open, modelsLoaded])

  useEffect(() => {
    if (!open) {
      if (saveTimeoutRef.current) { clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null }
    }
  }, [open])

  async function processResult(descriptor: Float32Array, photoUrl?: string) {
    if (finishedRef.current) return
    finishedRef.current = true
    setStatus('idle')
    setMessage('')

    try {
      const raw = user?.faceDescriptor
      let stored: number[] | null = null
      if (raw) {
        try { const p = JSON.parse(raw); if (isFaceDescriptor(p)) stored = p } catch (e) { console.error('FaceVerification: parse descriptor error', e) }
      }

      if (stored) {
        const match = isMatch(descriptor, arrayToDescriptor(stored))
        if (match) {
          setStatus('success')
          setMessage('Wajah cocok!')
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
          saveTimeoutRef.current = setTimeout(() => onVerified(photoUrl), 800)
        } else {
          setStatus('fail')
          setMessage('Wajah tidak cocok dengan data terdaftar.')
        }
      } else {
        await saveDescriptor(descriptor)
        setStatus('success')
        setMessage('Wajah berhasil didaftarkan!')
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => onVerified(photoUrl), 800)
      }
    } catch {
      finishedRef.current = false
      setStatus('fail')
      setMessage('Gagal menyimpan data wajah. Coba lagi.')
      setCapturedPhoto(null)
    }
  }

  async function handleAutoCapture(photoUrl: string) {
    if (finishedRef.current) return
    setCapturedPhoto(photoUrl)
    setProcessing(true)
    setStatus('idle')
    setMessage('')
    try {
      /* Konversi data URL ke canvas untuk deteksi */
      const img = new Image()
      img.src = photoUrl
      await new Promise((r) => { img.onload = r })
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const result = await detectFace(canvas)
      if (!result) { setStatus('fail'); setMessage('Wajah tidak terdeteksi.'); setCapturedPhoto(null); setProcessing(false); return }
      await processResult(result.descriptor, photoUrl)
    } catch (e) { console.error('FaceVerification: auto-capture error', e); setStatus('fail'); setMessage('Gagal memproses wajah.'); setCapturedPhoto(null) }
    setProcessing(false)
  }

  async function handleManualCapture(canvas: HTMLCanvasElement) {
    if (finishedRef.current) return
    const photoUrl = canvas.toDataURL('image/jpeg', 0.7)
    setCapturedPhoto(photoUrl)
    setProcessing(true)
    setStatus('idle')
    setMessage('')
    try {
      const result = await detectFace(canvas)
      if (!result) { setStatus('fail'); setMessage('Wajah tidak terdeteksi.'); setCapturedPhoto(null); setProcessing(false); return }
      await processResult(result.descriptor, photoUrl)
    } catch (e) { console.error('FaceVerification: manual-capture error', e); setStatus('fail'); setMessage('Gagal memproses wajah.'); setCapturedPhoto(null) }
    setProcessing(false)
  }

  const handleVideoReady = useCallback(() => {}, [])

  function handleRetry() {
    finishedRef.current = false
    setStatus('idle')
    setMessage('')
    setCapturedPhoto(null)
    setFaceStatus('')
  }

  const cameraActive = modelsLoaded && !finishedRef.current && status === 'idle'
  const showCaptured = capturedPhoto && (status === 'success' || status === 'idle' || processing)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Wajah</DialogTitle>
          <DialogDescription>
            {user?.faceDescriptor
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
        ) : showCaptured ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-muted shadow-sm">
              <img src={capturedPhoto!} alt="captured" className="w-full h-full object-cover" />
            </div>
            {processing && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi...</p>}
          </div>
        ) : status === 'idle' ? (
          <WebcamCapture
            onCapture={handleManualCapture}
            processing={processing}
            onVideoReady={handleVideoReady}
            active={status === 'idle' && !finishedRef.current}
            onAutoCapture={handleAutoCapture}
            onFaceStatus={(s) => { setFaceStatus(s.message); setFaceColor(s.color) }}
          />
        ) : null}

        {status === 'idle' && cameraActive && faceStatus && (
          <p className={`text-xs text-center ${
            faceColor === 'green' ? 'text-green-600 font-medium' :
            faceColor === 'yellow' ? 'text-yellow-600' :
            'text-muted-foreground'
          }`}>
            {faceStatus}
          </p>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 justify-center text-green-600"><CheckCircle2 className="h-5 w-5" /><span className="font-medium">{message}</span></div>
        )}

        {status === 'fail' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 justify-center text-destructive"><XCircle className="h-5 w-5" /><span className="text-sm">{message}</span></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>Coba Lagi</Button>
              <Button variant="ghost" size="sm" onClick={onSkip}>Lewati</Button>
            </div>
          </div>
        )}

        {status === 'idle' && !processing && !cameraActive && !showCaptured && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onSkip}>Lewati verifikasi</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
