import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { TourContext } from './hooks/useTour'
import { karyawanSteps, adminSteps, verificationSteps } from './TourStepRegistry'
import { scrollToElement, type TourRole } from './utils/tour-helpers'
import { isTourCompleted, markTourCompleted, markTourSkipped, isVerificationTourCompleted, markVerificationTourCompleted, markVerificationTourSkipped } from './utils/tour-storage'
import { TourSpotlight } from './TourSpotlight'
import { TourTooltip } from './TourTooltip'
import { TourModal } from './TourModal'
import { TourPaused } from './TourPaused'
import { useElementTracker } from './hooks/useElementTracker'
import type { User } from '@/types'
import { useSidebar } from '@/components/ui/sidebar'

interface TourProviderProps {
  children: ReactNode
  role: TourRole
  status?: User['status']
  autoStart?: boolean
}

export function TourProvider({ children, role, status, autoStart = true }: TourProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setOpen, setOpenMobile, openMobile: _openMobile, isMobile } = useSidebar()

  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [exiting, setExiting] = useState(false)

  const steps = useMemo(() => {
    if (status === 'pending' || status === 'rejected') return verificationSteps
    return role === 'admin' ? adminSteps : karyawanSteps
  }, [role, status])

  const total = steps.length
  const currentStepDef = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === total - 1

  const start = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    setPaused(false)
  }, [])

  const isOnboarding = status === 'pending' || status === 'rejected'

  const complete = useCallback(() => {
    if (isOnboarding) markVerificationTourCompleted()
    else markTourCompleted()
    setIsActive(false)
    setPaused(false)
    setExiting(false)
    if (!isOnboarding) {
      const target = role === 'admin' ? '/admin/dashboard' : '/dashboard'
      if (location.pathname !== target) {
        navigate({ to: target as string })
      }
    }
  }, [isOnboarding, role, navigate, location.pathname])

  const skip = useCallback(() => {
    if (isOnboarding) markVerificationTourSkipped()
    else markTourSkipped()
    setIsActive(false)
    setPaused(false)
    setExiting(false)
  }, [isOnboarding])

  const changeStep = useCallback((nextIndex: number) => {
    setExiting(true)
    setTimeout(() => {
      setExiting(false)
      const step = steps[nextIndex]
      if (!isMobile && step.requiresSidebar) {
        if (isMobile) setOpenMobile(true)
        else setOpen(true)
      } else if (!isMobile && currentStepDef?.requiresSidebar) {
        if (isMobile) setOpenMobile(false)
      }
      if (step.route && step.route !== location.pathname) {
        navigate({ to: step.route as string })
      }
      if (step.targetSelector) {
        scrollToElement(step.targetSelector)
      }
      setCurrentStep(nextIndex)
    }, 150)
  }, [steps, currentStepDef, isMobile, setOpen, setOpenMobile, navigate, location.pathname])

  const next = useCallback(() => {
    const nextIndex = currentStep + 1
    if (nextIndex >= total) {
      complete()
      return
    }
    changeStep(nextIndex)
  }, [currentStep, total, complete, changeStep])

  const prev = useCallback(() => {
    const nextIndex = Math.max(0, currentStep - 1)
    if (nextIndex !== currentStep) changeStep(nextIndex)
  }, [currentStep, changeStep])

  const goToStep = useCallback((index: number) => {
    changeStep(Math.max(0, Math.min(index, total - 1)))
  }, [total, changeStep])

  const resume = useCallback(() => {
    const route = currentStepDef?.route
    if (route && location.pathname !== route) {
      navigate({ to: route as string })
      return
    }
    setPaused(false)
  }, [currentStepDef, location.pathname, navigate])

  useEffect(() => {
    const isOnboarding = status === 'pending' || status === 'rejected'
    if (autoStart && !isActive) {
      if (isOnboarding && isVerificationTourCompleted()) return
      if (!isOnboarding && isTourCompleted()) return
      const id = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(id)
    }
  }, [autoStart, isActive, status])

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

  const showSpotlight = isActive && !paused && currentStepDef?.type === 'spotlight' && !isMobile
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
      {isActive && createPortal(
        <div className={cn('fixed inset-0 z-[60] pointer-events-none', exiting && 'tour-slide-down')}>
          {showSpotlight && (
            <>
              {!isMobile && spotlightRect && (
                <TourSpotlight selector={currentStepDef.targetSelector!} />
              )}
              <div className="pointer-events-auto">
                <TourTooltip
                  step={currentStepDef}
                  currentIndex={currentStep}
                  total={total}
                  isFirst={isFirst}
                  isLast={isLast}
                  spotlightRect={isMobile ? null : spotlightRect}
                  onNext={next}
                  onPrev={prev}
                  onSkip={skip}
                />
              </div>
            </>
          )}
          {isActive && paused && (
            <div className="pointer-events-auto">
              <TourPaused onResume={resume} onSkip={skip} />
            </div>
          )}
        </div>,
        document.body,
      )}
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
    </TourContext.Provider>
  )
}
