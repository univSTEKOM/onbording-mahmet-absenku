import { Loader2 } from 'lucide-react'

export function LoadingState({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      {message}
    </div>
  )
}
