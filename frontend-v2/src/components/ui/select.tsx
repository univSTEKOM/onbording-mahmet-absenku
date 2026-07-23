import { forwardRef, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectContextType {
  value: string
  onChange: (value: string) => void
}

const SelectContext = createContext<SelectContextType | null>(null)

export function Select({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = forwardRef<HTMLButtonElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>span]:line-clamp-1',
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

export function SelectValue({ placeholder = 'Pilih...' }: { placeholder?: string }) {
  const ctx = useContext(SelectContext)
  if (ctx?.value) return null
  return <span>{placeholder}</span>
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('absolute z-50 mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-md', className)}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(SelectContext)
  const isSelected = ctx?.value === value
  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className,
      )}
      onClick={() => ctx?.onChange(value)}
    >
      {children}
    </div>
  )
}
