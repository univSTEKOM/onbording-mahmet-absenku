import { useTheme } from '@/components/theme-provider'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  const { theme } = useTheme()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <img
      src={isDark ? '/logo dark mode.png' : '/logo light mode.png'}
      alt="AbsenKu"
      className={`object-contain ${className}`}
    />
  )
}
