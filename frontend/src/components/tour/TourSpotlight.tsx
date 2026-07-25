import { useSpotlight } from './hooks/useSpotlight'

interface TourSpotlightProps {
  selector: string
  padding?: number
}

export function TourSpotlight({ selector, padding = 8 }: TourSpotlightProps) {
  const rect = useSpotlight(selector)

  if (!rect) return null

  return (
    <div className="fixed inset-0 pointer-events-none tour-fade-in" role="dialog" aria-label="Panduan aplikasi AbsenKu">
      <div
        className="absolute rounded-xl border-2 border-primary"
        style={{
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: '0 0 0 9999px var(--tour-overlay)',
          transition: 'left 250ms cubic-bezier(0.4, 0, 0.2, 1), top 250ms cubic-bezier(0.4, 0, 0.2, 1), width 250ms cubic-bezier(0.4, 0, 0.2, 1), height 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  )
}
