import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
  className?: string
  disabled?: boolean
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children?: React.ReactNode
  actions: ConfirmAction[]
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  actions,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          {actions.map((action, i) => (
            <Button
              key={i}
              variant={action.variant || 'default'}
              className={action.className}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
