import { useState, useCallback, useRef } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, Scissors } from 'lucide-react'

interface ImageCropperDialogProps {
  open: boolean
  imageSrc: string
  onCropComplete: (croppedDataUrl: string) => void
  onCancel: () => void
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = url
  })
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const size = 300

  canvas.width = size
  canvas.height = size

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  )

  return canvas.toDataURL('image/jpeg', 0.8)
}

export function ImageCropperDialog({ open, imageSrc, onCropComplete, onCancel }: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [saving, setSaving] = useState(false)
  const croppedPixelsRef = useRef<Area | null>(null)

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    croppedPixelsRef.current = croppedAreaPixels
  }, [])

  async function handleSave() {
    if (!croppedPixelsRef.current) return
    setSaving(true)
    try {
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedPixelsRef.current)
      onCropComplete(croppedDataUrl)
    } catch {
      onCancel()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Foto</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-black/5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={([v]) => onZoomChange(v)}
          />
          <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">{zoom}x</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={saving}>Batal</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
            {saving ? 'Memproses...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
