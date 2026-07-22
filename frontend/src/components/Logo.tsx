import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function Logo({ className = '', variant = 'full' }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (variant === 'icon') {
      setSrc('/favicon.png')
    } else {
      setSrc(resolvedTheme === 'dark' ? '/logo dark mode.png' : '/logo light mode.png')
    }
  }, [resolvedTheme, variant])

  if (!src) return null

  return (
    <img
      src={src}
      alt="AbsenKu"
      className={`object-contain ${className}`}
    />
  )
}
