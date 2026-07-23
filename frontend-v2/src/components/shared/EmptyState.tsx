import { Inbox, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  icon?: LucideIcon
}

export function EmptyState({
  message = 'Belum ada data',
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
