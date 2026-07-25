import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES } from '@/lib/countries'
import { MAX_PHONE_DIGITS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  country?: string
  onCountryChange?: (code: string) => void
  error?: string
  className?: string
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
}

export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  const parts: string[] = []
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4))
  }
  return parts.join(' ')
}

export function PhoneInput({
  value,
  onChange,
  country = '+62',
  onCountryChange,
  error,
  className,
  placeholder = '812 3456 7890',
  id,
  name,
  disabled,
}: PhoneInputProps) {
  const display = formatPhoneDisplay(value)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS)
    onChange(raw)
  }

  return (
    <div className={cn('flex gap-0', className)}>
      <Select value={country} onValueChange={(v) => onCountryChange?.(v || '+62')}>
        <SelectTrigger className="w-[70px] rounded-r-none border-r-0 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Input
          id={id}
          name={name}
          value={display}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn('rounded-l-none', error && 'border-destructive')}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
