import type { ChartConfig } from '@/components/ui/chart'

const OPACITY = '50%'

export function statusColor(key: string): string {
  return `color-mix(in srgb, var(--color-status-${key}) ${OPACITY}, transparent)`
}

export function pieDataItem(name: string, value: number): { name: string; value: number } {
  return { name, value }
}

export const absensiChartConfig: ChartConfig = {
  hadir:        { label: 'Hadir',        color: statusColor('hadir') },
  terlambat:    { label: 'Terlambat',    color: statusColor('terlambat') },
  pulang_cepat: { label: 'Pulang Cepat', color: statusColor('pulang_cepat') },
  izin:         { label: 'Izin',         color: statusColor('izin') },
  sakit:        { label: 'Sakit',        color: statusColor('sakit') },
  cuti:         { label: 'Cuti',         color: statusColor('cuti') },
  tidakHadir:   { label: 'Alfa',         color: statusColor('tidakHadir') },
}

export type StatusKey = keyof typeof absensiChartConfig
