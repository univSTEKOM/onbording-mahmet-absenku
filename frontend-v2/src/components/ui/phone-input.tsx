import { Input } from './input'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  id?: string
  name?: string
}

export function PhoneInput({ value, onChange, error, id, name }: PhoneInputProps) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center px-3 py-1 rounded-lg border bg-muted text-sm text-muted-foreground">
        +62
      </div>
      <div className="flex-1">
        <Input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          className={error ? 'border-destructive' : ''}
          placeholder="81234567890"
        />
      </div>
    </div>
  )
}
