interface TourProgressProps {
  current: number
  total: number
}

export function TourProgress({ current, total }: TourProgressProps) {
  return (
    <p className="text-xs text-muted-foreground">
      Langkah {current + 1} dari {total}
    </p>
  )
}
