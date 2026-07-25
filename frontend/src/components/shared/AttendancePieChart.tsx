import * as React from 'react'
import { PieChart, Pie, Label, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface PieDataItem {
  name: string
  value: number
  fill?: string
}

interface AttendancePieChartProps {
  id: string
  data: PieDataItem[]
  config: ChartConfig
  centerLabel: string
  centerSub?: string
  loading?: boolean
}

export function AttendancePieChart({ id, data, config, centerLabel, centerSub, loading }: AttendancePieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState(-1)

  if (loading) {
    return <div className="mx-auto w-full max-w-[250px] h-[250px] rounded-full bg-muted animate-pulse" />
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  if (!data.length || total === 0) {
    return <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
  }

  return (
    <>
      <ChartStyle id={id} config={config} />
      <ChartContainer id={id} config={config} className="mx-auto w-full max-w-[250px] h-[250px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={2}
            shape={({ index, outerRadius = 0, ...props }: PieSectorDataItem & { index: number }) => (
              <Sector {...props} className={`fill-status-${data[index]?.name || 'hadir'}`}
                outerRadius={index === activeIndex ? outerRadius + 6 : outerRadius} />
            )}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-2xl font-bold">{centerLabel}</tspan>
                      {centerSub && <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-xs">{centerSub}</tspan>}
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground mt-2">
        {data.filter((d) => d.value > 0).map((d) => {
          const cfg = config[d.name]
          return (
            <span key={d.name} className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm" style={{ backgroundColor: cfg?.color || d.fill || 'var(--color-status-hadir)' }} />
              {d.name === 'tidakHadir' ? 'Alfa' : d.name.charAt(0).toUpperCase() + d.name.slice(1)}
            </span>
          )
        })}
      </div>
    </>
  )
}
