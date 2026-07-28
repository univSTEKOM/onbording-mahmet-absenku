import { Check, Circle } from 'lucide-react'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface PasswordRequirementsProps {
  value: string
}

const rules = [
  {
    label: `${MIN_PASSWORD_LENGTH} karakter`,
    tooltip: `Minimal ${MIN_PASSWORD_LENGTH} karakter`,
    test: (v: string) => v.length >= MIN_PASSWORD_LENGTH,
  },
  {
    label: 'A-Z',
    tooltip: 'Huruf besar (A-Z)',
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    label: 'a-z',
    tooltip: 'Huruf kecil (a-z)',
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    label: '0-9',
    tooltip: 'Angka (0-9)',
    test: (v: string) => /[0-9]/.test(v),
  },
]

export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const interacted = value.length > 0
  const allMet = rules.every((r) => r.test(value))

  return (
    <div className="min-h-[28px] pt-1.5 flex items-center justify-start gap-1.5 flex-wrap">
      {rules.map((rule) => {
        const met = interacted && rule.test(value)
        const pill = (
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-normal transition-all duration-300 ${
              met
                ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400'
                : 'border-muted-foreground/20 text-muted-foreground/40'
            }`}
          >
            {met ? (
              <Check className="h-2.5 w-2.5 shrink-0" />
            ) : (
              <Circle className="h-2 w-2 shrink-0" />
            )}
            {rule.label}
          </div>
        )
        return (
          <Tooltip key={rule.label}>
            <TooltipTrigger render={pill} />
            <TooltipContent side="top" className="text-[11px]">{rule.tooltip}</TooltipContent>
          </Tooltip>
        )
      })}
      {allMet && (
        <div className="inline-flex items-center gap-1 rounded-full border border-green-500/50 bg-green-500/10 px-2 py-0.5 text-[11px] leading-normal text-green-600 dark:text-green-400 font-medium animate-in fade-in zoom-in-95 duration-300">
          <Check className="h-2.5 w-2.5 shrink-0" />
          Siap!
        </div>
      )}
    </div>
  )
}
