import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Field = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
)
Field.displayName = 'Field'

export const FieldGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-4', className)} {...props} />
  )
)
FieldGroup.displayName = 'FieldGroup'

export const FieldLabel = forwardRef<HTMLLabelElement, HTMLAttributes<HTMLLabelElement> & { htmlFor?: string }>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-sm font-medium leading-none', className)} {...props} />
  )
)
FieldLabel.displayName = 'FieldLabel'

export const FieldDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
FieldDescription.displayName = 'FieldDescription'
