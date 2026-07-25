import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ImageViewerProps {
  open: boolean
  imageUrl: string
  alt?: string
  onClose: () => void
}

export function ImageViewer(p: ImageViewerProps) {
  var open = p.open
  var onClose = p.onClose

  useEffect(function() {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return function() {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!p.open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 animate-in fade-in duration-200"
      onClick={p.onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        onClick={p.onClose}
        aria-label="Tutup"
      >
        <X className="h-5 w-5" />
      </button>

      <img
        src={p.imageUrl}
        alt={p.alt || 'Preview'}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={function(e) { e.stopPropagation() }}
      />
    </div>
  )
}
