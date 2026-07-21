import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WebcamCapture } from './WebcamCapture'
import { loadModels, detectFace, descriptorToArray, isMatch, arrayToDescriptor, isFaceDescriptor } from '@/lib/faceDetection'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUsers'
import { CheckCircle2, XCircle } from 'lucide-react'

interface FaceVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
  onSkip: () => void
}

export function FaceVerification({
  open,
  onOpenChange,
  onVerified,
  onSkip,
}: FaceVerificationProps) {
  const { user, updateUser } = useAuth()
  const updateUserMutation = useUpdateUser()
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const [message, setMessage] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  async function handleCapture(canvas: HTMLCanvasElement) {
    canvasRef.current = canvas
    setProcessing(true)
    setStatus('idle')
    setMessage('')

    try {
      await loadModels()
      const result = await detectFace(canvas)

      if (!result) {
        setStatus('fail')
        setMessage('Wajah tidak terdeteksi. Coba lagi dengan pencahayaan yang cukup.')
        setProcessing(false)
        return
      }

      const storedDescriptor = user?.foto
      let registered: number[]

      if (storedDescriptor && isFaceDescriptor(storedDescriptor)) {
        registered = storedDescriptor
        const match = isMatch(
          result.descriptor,
          arrayToDescriptor(registered),
          0.5
        )
        if (match) {
          setStatus('success')
          setMessage('Wajah cocok!')
          setTimeout(onVerified, 1000)
        } else {
          setStatus('fail')
          setMessage('Wajah tidak cocok dengan data terdaftar.')
        }
      } else {
        registered = descriptorToArray(result.descriptor)
        if (user) {
          updateUserMutation.mutate(
            { id: user.id, data: { foto: JSON.stringify(registered) } },
            {
              onSuccess: () => {
                updateUser({ foto: JSON.stringify(registered) })
                setStatus('success')
                setMessage('Wajah berhasil didaftarkan!')
                setTimeout(onVerified, 1000)
              },
            }
          )
        }
      }
    } catch (err) {
      setStatus('fail')
      setMessage('Gagal memproses wajah. Coba lagi.')
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
            {user?.foto && isFaceDescriptor(user.foto)
              ? 'Arahkan wajah ke kamera untuk verifikasi'
              : 'Daftarkan wajah Anda untuk absensi selanjutnya'}
          </DialogDescription>
        </DialogHeader>

        <WebcamCapture onCapture={handleCapture} processing={processing} />

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

        <div className="flex justify-center">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            Lewati verifikasi wajah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
