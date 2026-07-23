import { createContext, useContext, useState, type ReactNode } from 'react'

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = createContext<TooltipContextType | null>(null)

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function TooltipContent({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(TooltipContext)
  if (!ctx?.open) return null
  return (
    <div className={'absolute z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md ' + (className || '')}>
      {children}
    </div>
  )
}
