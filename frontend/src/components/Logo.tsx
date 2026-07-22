import { useTheme } from 'next-themes'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function Logo({ className = '', variant = 'full' }: LogoProps) {
  const { resolvedTheme } = useTheme()

  if (variant === 'icon') {
    return (
      <img
        src="/favicon.png"
        alt="AbsenKu"
        className={`object-contain ${className}`}
      />
    )
  }

  return (
    <img
      src={resolvedTheme === 'dark' ? '/logo dark mode.png' : '/logo light mode.png'}
      alt="AbsenKu"
      className={`object-contain ${className}`}
    />
  )
}
