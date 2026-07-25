import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TourProgress } from './TourProgress'
import { TourNavigation } from './TourNavigation'
import type { TourStepDef } from './utils/tour-helpers'

interface TourTooltipProps {
  step: TourStepDef
  currentIndex: number
  total: number
  isFirst: boolean
  isLast: boolean
  spotlightRect: DOMRect | null
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

type PositionStyle = {
  left?: number
  right?: number
  top?: number
  bottom?: number
}

function computePosition(
  rect: DOMRect | null,
  preferred: TourStepDef['position'],
): { style: PositionStyle; placement: string } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const isMobile = vw < 768

  if (!rect) {
    if (isMobile) {
      return { style: { left: 16, right: 16, bottom: 24 }, placement: 'bottom-center' }
    }
    return { style: { left: 16, top: 16 }, placement: 'bottom-left' }
  }

  const gap = 16
  const tw = vw < 480 ? vw - 32 : 360

  const candidates = [
    {
      name: preferred ?? 'right',
      style: (() => {
        switch (preferred ?? 'right') {
          case 'right':
            return { left: rect.right + gap, top: rect.top }
          case 'left':
            return { right: vw - rect.left + gap, top: rect.top }
          case 'bottom':
            return { left: rect.left, top: rect.bottom + gap }
          case 'top':
            return { left: rect.left, bottom: vh - rect.top + gap }
          default:
            return { left: rect.right + gap, top: rect.top }
        }
      })(),
    },
    { name: 'right', style: { left: rect.right + gap, top: rect.top } },
    { name: 'left', style: { right: vw - rect.left + gap, top: rect.top } },
    { name: 'bottom', style: { left: rect.left, top: rect.bottom + gap } },
    { name: 'top', style: { left: rect.left, bottom: vh - rect.top + gap } },
  ]

  for (const c of candidates) {
    const s = c.style as Record<string, number | undefined>
    const left = s.left ?? 0
    const top = s.top ?? 0
    const fitsX = !s.left || left + tw <= vw
    const fitsY = !s.top || top + 200 <= vh
    if (fitsX && fitsY) return { style: c.style, placement: c.name }
  }

  return { style: { left: 16, top: 16 }, placement: 'bottom-left' }
}

export function TourTooltip({
  step,
  currentIndex,
  total,
  isFirst,
  isLast,
  spotlightRect,
  onNext,
  onPrev,
  onSkip,
}: TourTooltipProps) {
  const { style } = useMemo(
    () => computePosition(spotlightRect, step.position),
    [spotlightRect, step.position],
  )

  return (
    <div
      className="fixed tour-slide-up"
      role="dialog"
      aria-label={`Langkah ${currentIndex + 1} dari ${total}: ${step.title}`}
      style={{ maxWidth: 360, width: 'calc(100vw - 32px)', ...style }}
    >
      <Card className="shadow-lg border-border">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-base font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
          <div role="status" aria-live="polite">
            <TourProgress current={currentIndex} total={total} />
          </div>
          <TourNavigation
            isFirst={isFirst}
            isLast={isLast}
            onPrev={onPrev}
            onNext={onNext}
            onSkip={onSkip}
          />
        </CardContent>
      </Card>
    </div>
  )
}
