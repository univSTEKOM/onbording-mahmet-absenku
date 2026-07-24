export interface TourStepDef {
  id: string
  type: 'spotlight' | 'welcome' | 'completion'
  targetSelector?: string
  title: string
  description: string
  icon?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  route?: string
  requiresSidebar?: boolean
}

export type TourRole = 'admin' | 'karyawan'

export function findStepIndex(steps: TourStepDef[], id: string): number {
  return steps.findIndex((s) => s.id === id)
}

export function scrollToElement(selector: string): Promise<void> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector)
    if (!el) { resolve(); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(resolve, 300)
  })
}

export function getElementRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector)
  return el?.getBoundingClientRect() || null
}
