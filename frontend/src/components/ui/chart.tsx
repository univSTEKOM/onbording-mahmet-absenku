import * as React from 'react'
import { ResponsiveContainer } from 'recharts'
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

  const contextValue = React.useMemo(() => ({ config }), [config])

  return (
    <div id={id} className={cn('w-full', className)} style={colorVars as React.CSSProperties}>
      <ChartContext.Provider value={contextValue}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
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
import * as RechartsPrimitive from 'recharts'

function ChartTooltipContent({ active, payload, hideIndicator }: {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[]
  hideIndicator?: boolean
}) {
  const { config } = useChart()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
      {payload.map((entry) => {
        const cfg = entry.name ? config[entry.name] : undefined
        if ((entry.value ?? 0) <= 0) return null
        return (
          <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
            {!hideIndicator && cfg?.color && <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />}
            <span>{cfg?.label || entry.name}: {entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

function ChartLegend({ content }: { content?: React.ReactNode }) {
  return <>{content}</>
}

function ChartLegendContent({ payload }: { payload?: { value: string; color?: string }[] }) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div className="flex flex-wrap items-center justify-center text-[11px] text-muted-foreground">
      {payload.map((entry) => {
        const cfg = config[entry.value]
        return (
          <span key={entry.value} className="flex items-center gap-1.5 mr-4 last:mr-0">
            <span className="size-3 rounded-sm" style={{ backgroundColor: cfg?.color || entry.color }} />
            {cfg?.label || entry.value}
          </span>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, useChart, type ChartConfig }
