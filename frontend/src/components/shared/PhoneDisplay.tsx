import { cn } from '@/lib/utils'

const flagMap: Record<string, string> = {
  '1': '🇺🇸', '44': '🇬🇧', '60': '🇲🇾', '61': '🇦🇺',
  '62': '🇮🇩', '63': '🇵🇭', '65': '🇸🇬', '66': '🇹🇭',
  '81': '🇯🇵', '82': '🇰🇷', '84': '🇻🇳', '86': '🇨🇳',
  '91': '🇮🇳',
}

function getCountryCode(phone: string): string {
  const m = phone.match(/^\+(\d+)/)
  if (!m) return ''
  for (let len = 3; len >= 1; len--) {
    const code = m[1].slice(0, len)
    if (flagMap[code]) return code
  }
  return ''
}

function getFlag(phone: string): string {
  const code = getCountryCode(phone)
  return code ? flagMap[code] : ''
}

function formatNational(phone: string): string {
  const code = getCountryCode(phone)
  const digits = phone.replace(/\D/g, '')
  const national = code ? digits.slice(code.length) : digits
  if (!national) return phone

  const parts: string[] = []
  for (let i = 0; i < national.length; i += 4) {
    parts.push(national.slice(i, i + 4))
  }
  return '+' + code + ' ' + parts.join(' ')
}

interface PhoneDisplayProps {
  value: string | null | undefined
  className?: string
}

export function PhoneDisplay({ value, className }: PhoneDisplayProps) {
  if (!value) return <span className={cn('text-muted-foreground', className)}>-</span>

  const flag = getFlag(value)
  const display = formatNational(value)

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {flag && <span className="text-base leading-none">{flag}</span>}
      <span>{display}</span>
    </span>
  )
}
