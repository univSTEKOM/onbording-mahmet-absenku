import { forwardRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false)

    return (
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          className={cn('pr-9', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{show ? 'Sembunyikan' : 'Tampilkan'} password</span>
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
