import { Button } from '@/components/ui/button'

interface TourNavigationProps {
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
}

export function TourNavigation({ isFirst, isLast, onPrev, onNext, onSkip }: TourNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      {!isFirst && (
        <Button variant="ghost" size="sm" onClick={onPrev} aria-label="Langkah sebelumnya">
          Kembali
        </Button>
      )}
      <div className="flex-1" />
      <Button variant="ghost" size="sm" onClick={onSkip} aria-label="Lewati panduan">
        Lewati
      </Button>
      <Button variant="default" size="sm" autoFocus onClick={onNext} aria-label={isLast ? 'Selesaikan panduan' : 'Lanjut ke langkah berikutnya'}>
        {isLast ? 'Selesai' : 'Lanjut'}
      </Button>
    </div>
  )
}
