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
    setSrc(resolvedTheme === 'dark' ? '/logo dark mode.png' : '/logo light mode.png')
  }, [resolvedTheme])

  if (!src) return null

  if (variant === 'icon') {
    return (
      <img
        src={src}
        alt="AbsenKu"
        className={`h-8 w-8 object-contain ${className}`}
      />
    )
  }

  return (
    <img
      src={src}
      alt="AbsenKu"
      className={`h-8 object-contain ${className}`}
    />
  )
}
