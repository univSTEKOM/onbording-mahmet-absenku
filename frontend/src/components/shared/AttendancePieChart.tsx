import * as React from 'react'
import { PieChart, Pie, Label } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface PieDataItem {
  name: string
  value: number
  fill?: string
}

interface AttendancePieChartProps {
  data: PieDataItem[]
  config: ChartConfig
  centerLabel?: string
  centerSub?: string
  loading?: boolean
}

export function AttendancePieChart({ data, config, centerLabel, centerSub, loading }: AttendancePieChartProps) {
  if (loading) {
    return <div className="mx-auto aspect-square w-full max-w-[200px] rounded-full bg-muted animate-pulse" />
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  if (!data.length || total === 0) {
    return <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
  }

  const colors = React.useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, val] of Object.entries(config)) {
      if (val?.color) vars[key] = val.color
    }
    return vars
  }, [config])

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={config} className="mx-auto aspect-square w-full max-w-[200px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} strokeWidth={2}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      {centerLabel && <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-xl font-bold">{centerLabel}</tspan>}
                      {centerSub && <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground text-[10px]">{centerSub}</tspan>}
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground mt-1">
        {data.filter((d) => d.value > 0).map((d) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: colors[d.name] || d.fill || '#ccc' }} />
            {d.name === 'tidakHadir' ? 'Alfa' : d.name.charAt(0).toUpperCase() + d.name.slice(1)} {d.value}
          </span>
        ))}
      </div>
    </div>
  )
}
