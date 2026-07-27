import { useState, useEffect, useRef, useCallback } from 'react'

interface UseElementTrackerOptions {
  retryCount?: number
  retryDelay?: number
  onNotFound?: () => void
}

export function useElementTracker(
  selector: string | undefined,
  _options?: UseElementTrackerOptions,
) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [found, setFound] = useState(false)
  const [retrying, _setRetrying] = useState(false)
  const prevRectRef = useRef<DOMRect | null>(null)
  const targetRef = useRef<Element | null>(null)
  const tickingRef = useRef(false)
  const _retryRef = useRef(0)
  const foundRef = useRef(false)
  const onNotFoundRef = useRef<(() => void) | undefined>(undefined)
  onNotFoundRef.current = _options?.onNotFound
  const rafRef = useRef(0)

  const update = useCallback(() => {
    if (targetRef.current) {
      setRectIfChanged(targetRef.current.getBoundingClientRect())
    }
  }, [])

  const rafUpdate = useCallback(() => {
    if (tickingRef.current) return
    tickingRef.current = true
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      tickingRef.current = false
      update()
    })
  }, [update])

  function setRectIfChanged(newRect: DOMRect | null) {
    const prev = prevRectRef.current
    if (newRect === null && prev === null) return
    if (newRect && prev &&
        prev.left === newRect.left &&
        prev.top === newRect.top &&
        prev.width === newRect.width &&
        prev.height === newRect.height) return
    prevRectRef.current = newRect
    setRect(newRect)
  }

  useEffect(() => {
    if (!selector) {
      setRect(null)
      setFound(false)
      targetRef.current = null
      foundRef.current = false
      return
    }

    targetRef.current = null
    foundRef.current = false
    setFound(false)

    let ro: ResizeObserver | null = null
    let mo: MutationObserver | null = null

    function onFound(el: Element) {
      targetRef.current = el
      foundRef.current = true
      setFound(true)
      _setRetrying(false)
      update()
      ro = new ResizeObserver(rafUpdate)
      ro.observe(el)
      mo?.disconnect()
    }

    const existing = document.querySelector(selector)
    if (existing) {
      onFound(existing)
    }

    mo = new MutationObserver(() => {
      if (!targetRef.current) {
        const el = document.querySelector(selector)
        if (el) onFound(el)
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('scroll', rafUpdate, { passive: true })
    window.addEventListener('resize', rafUpdate, { passive: true })

    return () => {
      ro?.disconnect()
      mo?.disconnect()
      window.removeEventListener('scroll', rafUpdate)
      window.removeEventListener('resize', rafUpdate)
      cancelAnimationFrame(rafRef.current)
    }
  }, [selector, rafUpdate, update])

  return { rect, found, retrying }
}
