import { useState, type ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps {
  id: string
  name?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
  matchValue?: string
}

export function PasswordInput({ id, name, value, onChange, error, placeholder, matchValue }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const showMatch = matchValue !== undefined && value.length > 0

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(error ? 'border-destructive bg-background' : 'bg-background', 'pr-14')}
          required
        />
        {showMatch && value === matchValue && (
          <span className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" title="Kata sandi cocok">
            <CheckCircle2 className="size-4 text-green-500" />
          </span>
        )}
        {showMatch && value !== matchValue && (
          <span className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" title="Kata sandi tidak cocok">
            <XCircle className="size-4 text-destructive" />
          </span>
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          title={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
