import { createContext, useContext } from 'react'
import type { TourStepDef } from '../utils/tour-helpers'

export interface TourContextType {
  isActive: boolean
  currentStep: number
  steps: TourStepDef[]
  total: number
  isFirst: boolean
  isLast: boolean
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
  complete: () => void
  goToStep: (index: number) => void
}

export const TourContext = createContext<TourContextType | null>(null)

export function useTour(): TourContextType {
  const ctx = useContext(TourContext)
  if (!ctx) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return ctx
}
