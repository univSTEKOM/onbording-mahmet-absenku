import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TourPausedProps {
  onResume: () => void
  onSkip: () => void
}

export function TourPaused({ onResume, onSkip }: TourPausedProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="shadow-lg border-border">
        <CardContent className="p-3 flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Tur dijeda
          </p>
          <Button variant="default" size="sm" onClick={onResume} aria-label="Lanjutkan tur">
            Lanjutkan
          </Button>
          <Button variant="ghost" size="sm" onClick={onSkip} aria-label="Akhiri tur">
            Akhiri
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
