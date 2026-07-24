import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

type ChartConfig = Record<string, { label: string; color?: string }>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('Chart components must be used within a ChartContainer')
  return context
}

function ChartContainer({ id, config, children, className }: { id?: string; config: ChartConfig; children: React.ReactNode; className?: string }) {
  const colorVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, val] of Object.entries(config)) {
      if (val?.color) vars[`--color-${key}`] = val.color
    }
    return vars
  }, [config])

  return (
    <div id={id} className={cn('w-full', className)} style={colorVars as React.CSSProperties}>
      <ChartContext.Provider value={{ config }}>
        {children}
      </ChartContext.Provider>
    </div>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const css = Object.entries(config)
    .filter(([, val]) => val?.color)
    .map(([key, val]) => `#${id} { --color-${key}: ${val.color}; }`)
    .join('\n')
  return <style>{css}</style>
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[]
  className?: string
  hideLabel?: boolean
}) {
  const { config } = useChart()
  if (!active || !payload?.length) return null
  return (
    <div className={cn('rounded-lg border bg-background px-3 py-2 text-sm shadow-sm', className)}>
      {payload.map((entry) => {
        const cfg = entry.name ? config[entry.name] : undefined
        return (
          <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
            {cfg?.color && <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />}
            <span>{cfg?.label || entry.name}: {entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

function ChartLegendContent({ payload, className }: { payload?: { value: string; color?: string }[]; className?: string }) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground mt-2', className)}>
      {payload.map((entry) => {
        const cfg = config[entry.value]
        return (
          <span key={entry.value} className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm" style={{ backgroundColor: cfg?.color || entry.color }} />
            {cfg?.label || entry.value}
          </span>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, ChartLegendContent, useChart, type ChartConfig }
