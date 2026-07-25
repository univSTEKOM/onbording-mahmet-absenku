interface TourProgressProps {
  current: number
  total: number
}

export function TourProgress({ current, total }: TourProgressProps) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        Langkah {current + 1} dari {total}
      </p>
      <div className="h-1 w-full rounded-full bg-muted">
        <div
          className="h-1 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
