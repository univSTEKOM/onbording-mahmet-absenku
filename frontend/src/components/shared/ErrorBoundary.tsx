import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-3 text-destructive" />
          <h2 className="text-lg font-semibold mb-1">Terjadi Kesalahan</h2>
          <p className="text-sm mb-4">{this.state.error?.message}</p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba Lagi
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
