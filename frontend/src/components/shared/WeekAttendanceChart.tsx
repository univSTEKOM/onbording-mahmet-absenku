import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'

interface WeekAttendanceChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[]
  config: ChartConfig
  legendOrder: string[]
  loading?: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`rounded-lg bg-muted animate-pulse ${className}`} />
}

export function WeekAttendanceChart({ data, config, legendOrder, loading }: WeekAttendanceChartProps) {
  const barKeys = Object.keys(config)

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />
  }

  if (!data.length) {
    return <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
  }

  return (
    <ChartContainer config={config} className="h-[250px]">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(v: string) => v.slice(0, 3)} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <ChartLegend content={<ChartLegendContent payload={legendOrder.map((key) => ({ value: key }))} />} />
        {barKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={i === 0 ? [0, 0, 4, 4] : i === barKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            stackId="a"
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
