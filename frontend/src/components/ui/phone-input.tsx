import { PhoneInput as LibPhoneInput, defaultCountries } from 'react-international-phone'
import 'react-international-phone/style.css'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
}

export function PhoneInput({ value, onChange, error, className, id, name, disabled, placeholder }: PhoneInputProps) {
  return (
    <div className={cn('phone-input', error && '[--PhoneInputCountrySelectArrow-color:hsl(var(--destructive))] [--PhoneInputCountryFlag-border-color:hsl(var(--destructive))]', className)}>
      <LibPhoneInput
        defaultCountry="id"
        value={value}
        onChange={(phone) => onChange(phone || '')}
        countries={defaultCountries}
        placeholder={placeholder}
        inputProps={{ id, name, disabled }}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
