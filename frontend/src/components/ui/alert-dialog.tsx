import { createContext, useContext, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const AlertDialogContext = createContext<{ open: boolean; onOpenChange: (v: boolean) => void }>({
  open: false,
  onOpenChange: () => {},
})

export function AlertDialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v: boolean) => void; children?: React.ReactNode }) {
  if (!open) return null
  return (
    <AlertDialogContext.Provider value={useMemo(() => ({ open, onOpenChange: onOpenChange || (() => {}) }), [open, onOpenChange])}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
        <div className="relative z-50 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg mx-4">
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}>{children}</div>
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}

export function AlertDialogAction({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button className={cn(className)} {...props}>{children}</Button>
}

export function AlertDialogCancel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { onOpenChange } = useContext(AlertDialogContext)
  return <Button variant="outline" className={cn(className)} onClick={() => onOpenChange(false)}>{children}</Button>
}
