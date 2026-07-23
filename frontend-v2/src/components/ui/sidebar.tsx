import { createContext, useContext, forwardRef, type HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { PanelLeft, PanelLeftClose } from 'lucide-react'

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  isMobile: false,
})

export function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      <div className={cn('flex min-h-svh', isMobile ? 'flex-col' : '')}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { setOpen } = useSidebar()
  return (
    <button
      className={cn('inline-flex items-center justify-center rounded-md p-1 hover:bg-muted', className)}
      onClick={() => setOpen(true)}
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  )
}

export const Sidebar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: 'inset' | 'sidebar' }>(
  ({ className, variant = 'sidebar', children, ...props }, ref) => {
    const { open, setOpen } = useSidebar()

    if (!open) return null

    return (
      <>
        <div
          ref={ref}
          className={cn(
            'flex h-svh flex-col border-r bg-sidebar text-sidebar-foreground',
            variant === 'inset' ? 'rounded-r-xl' : '',
            'w-64 shrink-0',
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-end p-2">
            <button
              className="inline-flex items-center justify-center rounded-md p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setOpen(false)}
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </>
    )
  }
)
Sidebar.displayName = 'Sidebar'

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-3 py-2', className)} {...props} />
  )
)
SidebarHeader.displayName = 'SidebarHeader'

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto px-3', className)} {...props} />
  )
)
SidebarContent.displayName = 'SidebarContent'

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-3 py-2', className)} {...props} />
  )
)
SidebarFooter.displayName = 'SidebarFooter'

export const SidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('py-2', className)} {...props} />
  )
)
SidebarGroup.displayName = 'SidebarGroup'

export const SidebarMenu = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props} />
  )
)
SidebarMenu.displayName = 'SidebarMenu'

export const SidebarMenuItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

export function SidebarMenuButton({
  isActive,
  render,
  children,
  className,
}: {
  isActive?: boolean
  render?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('group relative', className)}>
      {render ? (
        <div className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground',
        )}>
          {children}
        </div>
      ) : (
        <div className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground',
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

export const SidebarInset = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-1 flex-col', className)} {...props} />
  )
)
SidebarInset.displayName = 'SidebarInset'
