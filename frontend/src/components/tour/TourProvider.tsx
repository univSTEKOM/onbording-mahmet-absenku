import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { TourContext } from './hooks/useTour'
import { karyawanSteps, adminSteps } from './TourStepRegistry'
import { scrollToElement, type TourRole } from './utils/tour-helpers'
import { isTourCompleted, markTourCompleted, markTourSkipped } from './utils/tour-storage'
import { TourSpotlight } from './TourSpotlight'
import { TourTooltip } from './TourTooltip'
import { TourModal } from './TourModal'
import { TourPaused } from './TourPaused'
import { useElementTracker } from './hooks/useElementTracker'

interface TourProviderProps {
  children: ReactNode
  role: TourRole
  autoStart?: boolean
}

export function TourProvider({ children, role, autoStart = true }: TourProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [paused, setPaused] = useState(false)

  const steps = useMemo(() => role === 'admin' ? adminSteps : karyawanSteps, [role])

  const total = steps.length
  const currentStepDef = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === total - 1

  const start = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    setPaused(false)
  }, [])

  const complete = useCallback(() => {
    markTourCompleted()
    setIsActive(false)
    setPaused(false)
    const target = role === 'admin' ? '/admin/dashboard' : '/dashboard'
    if (location.pathname !== target) {
      navigate({ to: target as any })
    }
  }, [navigate, location.pathname, role])

  const skip = useCallback(() => {
    markTourSkipped()
    setIsActive(false)
    setPaused(false)
  }, [])

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  const goToStep = useCallback((index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, total - 1)))
  }, [total])

  const resume = useCallback(() => {
    const route = currentStepDef?.route
    if (route && location.pathname !== route) {
      navigate({ to: route as any })
      return
    }
    setPaused(false)
  }, [currentStepDef, location.pathname, navigate])

  const next = useCallback(() => {
    const nextIndex = currentStep + 1
    if (nextIndex >= total) {
      complete()
      return
    }
    const step = steps[nextIndex]
    if (step.route && step.route !== location.pathname) {
      navigate({ to: step.route as any })
    }
    if (step.targetSelector) {
      scrollToElement(step.targetSelector)
    }
    setCurrentStep(nextIndex)
  }, [currentStep, total, steps, complete, navigate, location.pathname])

  useEffect(() => {
    if (autoStart && !isActive && !isTourCompleted()) {
      const id = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(id)
    }
  }, [autoStart, isActive])

  useEffect(() => {
    if (!isActive) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); skip() }
      if (e.key === 'ArrowRight' && !paused) { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft' && !paused) { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isActive, next, prev, skip, paused])

  useEffect(() => {
    if (!isActive || !currentStepDef) return
    if (currentStepDef.type === 'welcome' || currentStepDef.type === 'completion') return
    if (!currentStepDef.route) return
    const onCorrectPage = location.pathname === currentStepDef.route
    if (!onCorrectPage && !paused) {
      setPaused(true)
    } else if (onCorrectPage && paused) {
      setPaused(false)
    }
  }, [location.pathname, isActive, currentStepDef, paused])

  const showSpotlight = isActive && !paused && currentStepDef?.type === 'spotlight'
  const spotlight = useElementTracker(
    showSpotlight ? currentStepDef?.targetSelector : undefined,
  )
  const spotlightRect = spotlight.rect

  const value = useMemo(() => ({
    isActive,
    currentStep,
    steps,
    total,
    isFirst,
    isLast,
    start,
    next,
    prev,
    skip,
    complete,
    goToStep,
  }), [isActive, currentStep, steps, total, isFirst, isLast, start, next, prev, skip, complete, goToStep])

  return (
    <TourContext.Provider value={value}>
      {children}
      {showSpotlight && currentStepDef?.targetSelector && spotlightRect && (
        <>
          <TourSpotlight selector={currentStepDef.targetSelector} />
          <TourTooltip
            step={currentStepDef}
            currentIndex={currentStep}
            total={total}
            isFirst={isFirst}
            isLast={isLast}
            spotlightRect={spotlightRect}
            onNext={next}
            onPrev={prev}
            onSkip={skip}
          />
        </>
      )      }
      {isActive && !paused && currentStepDef?.type === 'welcome' && (
        <TourModal
          type="welcome"
          title={currentStepDef.title}
          description={currentStepDef.description}
          icon={currentStepDef.icon}
          onStart={next}
          onSkip={skip}
        />
      )}
      {isActive && !paused && currentStepDef?.type === 'completion' && (
        <TourModal
          type="completion"
          title={currentStepDef.title}
          description={currentStepDef.description}
          icon={currentStepDef.icon}
          onComplete={complete}
        />
      )}
      {isActive && paused && (
        <TourPaused onResume={resume} onSkip={skip} />
      )}
    </TourContext.Provider>
  )
}
