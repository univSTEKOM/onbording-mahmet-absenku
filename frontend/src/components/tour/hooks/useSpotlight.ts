import { useState, useEffect, useRef } from 'react'

export function useSpotlight(selector: string | undefined) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!selector) {
      setRect(null)
      return
    }

    function update() {
      const el = document.querySelector(selector)
      if (el) setRect(el.getBoundingClientRect())
    }

    function rafUpdate() {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    update()

    const resizeObserver = new ResizeObserver(rafUpdate)
    const target = document.querySelector(selector)
    if (target) resizeObserver.observe(target)

    window.addEventListener('scroll', rafUpdate, { passive: true })
    window.addEventListener('resize', rafUpdate, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', rafUpdate)
      window.removeEventListener('resize', rafUpdate)
    }
  }, [selector])

  return rect
}
