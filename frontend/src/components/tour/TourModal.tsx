import * as LucideIcons from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TourModalProps {
  type: 'welcome' | 'completion'
  title: string
  description: string
  icon?: string
  onStart?: () => void
  onComplete?: () => void
  onSkip?: () => void
}

export function TourModal({ type, title, description, icon, onStart, onComplete, onSkip }: TourModalProps) {
  const IconComponent = icon && icon in LucideIcons
    ? (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[icon]
    : null

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {IconComponent && (
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="size-6 text-primary" />
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </DialogHeader>

          {type === 'welcome' ? (
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={onStart} className="w-full" size="lg">
                Mulai Tur
              </Button>
              <Button variant="ghost" onClick={onSkip} size="sm">
                Lewati
              </Button>
            </div>
          ) : (
            <Button onClick={onComplete} className="w-full" size="lg">
              Buka Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
