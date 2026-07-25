import { Shield } from 'lucide-react'

interface RoleBadgeProps {
  role: string
  size?: 'sm' | 'md'
}

const roleConfig: Record<string, { label: string; light: string; dark: string }> = {
  admin: {
    label: 'Admin',
    light: 'bg-blue-100 text-blue-700',
    dark: 'dark:bg-blue-900/30 dark:text-blue-400',
  },
  karyawan: {
    label: 'Karyawan',
    light: 'bg-yellow-100 text-yellow-700',
    dark: 'dark:bg-yellow-900/30 dark:text-yellow-400',
  },
}

var sizeClasses: Record<string, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export function RoleBadge(p: RoleBadgeProps) {
  var cfg = roleConfig[p.role] || roleConfig.karyawan
  var sizeClass = sizeClasses[p.size || 'sm']

  return (
    <span className={'inline-flex items-center gap-1 rounded-full font-medium border-0 shrink-0 ' + sizeClass + ' ' + cfg.light + ' ' + cfg.dark}>
      <Shield className={p.size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'} />
      {cfg.label}
    </span>
  )
}
