import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Memuat...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      {message}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => ({ id: `sk-r-${i}`, cols: Array.from({ length: cols }, (_, j) => `sk-c-${i}-${j}`) }))
  return (
    <div className="space-y-3">
      {rowKeys.map((row) => (
        <div key={row.id} className="flex gap-4">
          {row.cols.map((colKey) => (
            <div key={colKey} className="h-4 bg-muted rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
