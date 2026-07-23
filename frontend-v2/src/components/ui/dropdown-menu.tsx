import { forwardRef, type HTMLAttributes, createContext, useContext, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownContext.Provider>
  )
}

export const DropdownMenuTrigger = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, children, ...props }, ref) => {
  const ctx = useContext(DropdownContext)
  return (
    <div ref={ref} className={cn('inline-block', className)} onClick={() => ctx?.setOpen(!ctx?.open)} {...props}>
      {children}
    </div>
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

export function DropdownMenuContent({ children, className }: {
  children: React.ReactNode
  className?: string
  side?: string
  align?: string
  sideOffset?: number
}) {
  const ctx = useContext(DropdownContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx?.setOpen(false)
      }
    }
    if (ctx?.open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ctx?.open])

  if (!ctx?.open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>{children}</div>
}

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
}

export function DropdownMenuItem({ children, className, onClick, ...props }: HTMLAttributes<HTMLDivElement> & { onClick?: () => void }) {
  const ctx = useContext(DropdownContext)
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      onClick={() => { onClick?.(); ctx?.setOpen(false) }}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
