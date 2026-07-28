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
    <div className={cn('phone-input', error && 'has-error', className)}>
      <LibPhoneInput
        defaultCountry="id"
        value={value}
        onChange={(phone) => {
          const raw = phone || ''
          const digits = raw.replace(/\D/g, '')
          onChange(digits.length <= 3 ? '' : raw)
        }}
        countries={defaultCountries}
        placeholder={placeholder}
        inputProps={{ id, name, disabled }}
      />
    </div>
  )
}
