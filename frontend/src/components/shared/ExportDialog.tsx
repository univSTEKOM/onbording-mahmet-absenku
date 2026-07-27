import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileDown, X, Check } from 'lucide-react'
import { absensiStatusLabel } from '@/lib/constants'
import type { AbsensiStatus } from '@/types'

const MAIN_CATEGORIES = [
  { value: '', label: 'Semua' },
  { value: 'physical_present', label: 'Kehadiran Fisik' },
  { value: 'absent_permit', label: 'Ketidakhadiran Berizin' },
  { value: 'absent_unpermit', label: 'Tanpa Izin' },
] as const

const STATUS_OPTIONS: { value: AbsensiStatus; label: string }[] = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'pulang_cepat', label: 'Pulang Cepat' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'cuti', label: 'Cuti' },
  { value: 'tidakHadir', label: 'Alfa' },
]

interface DatePreset {
  label: string
  getRange: () => { from: string; to: string }
}

const presets: DatePreset[] = [
  { label: 'Hari Ini', getRange: function() { const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); const s = y + '-' + m + '-' + day; return { from: s, to: s } } },
  { label: '7 Hari', getRange: function() { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); const fmt = function(d: Date) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }; return { from: fmt(from), to: fmt(to) } } },
  { label: 'Bulan Ini', getRange: function() { const to = new Date(); const from = new Date(); from.setDate(1); const fmt = function(d: Date) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }; return { from: fmt(from), to: fmt(to) } } },
  { label: 'Semua', getRange: function() { return { from: '', to: '' } } },
]

interface ExportFilters {
  mainCategory: string
  statuses: AbsensiStatus[]
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (dateFrom: string, dateTo: string, filters: ExportFilters) => void
  loading?: boolean
  initialFilters?: ExportFilters
}

export function ExportDialog(p: ExportDialogProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [mainCategory, setMainCategory] = useState(p.initialFilters?.mainCategory || '')
  const [selectedStatuses, setSelectedStatuses] = useState<AbsensiStatus[]>(p.initialFilters?.statuses || [])

  function applyPreset(pr: DatePreset) {
    const range = pr.getRange()
    setDateFrom(range.from)
    setDateTo(range.to)
  }

  function toggleStatus(status: AbsensiStatus) {
    setSelectedStatuses(function(prev) {
      if (prev.includes(status)) return prev.filter(function(s) { return s !== status })
      return [...prev, status]
    })
  }

  function handleExport() {
    p.onExport(dateFrom, dateTo, { mainCategory, statuses: selectedStatuses })
  }

  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent key={String(p.open)} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export Data XLSX
          </DialogTitle>
          <DialogDescription>Pilih filter dan rentang tanggal</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Rentang Tanggal</Label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(function(pr) {
                return (
                  <Button key={pr.label} variant="outline" size="xs" onClick={function() { applyPreset(pr) }}>
                    {pr.label}
                  </Button>
                )
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="exp-from" className="text-xs">Dari</Label>
                <Input id="exp-from" type="date" value={dateFrom} onChange={function(e) { setDateFrom(e.target.value) }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-to" className="text-xs">Sampai</Label>
                <Input id="exp-to" type="date" value={dateTo} onChange={function(e) { setDateTo(e.target.value) }} />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Kategori</Label>
            <div className="flex flex-wrap gap-1.5">
              {MAIN_CATEGORIES.map(function(cat) {
                const catActive = mainCategory === cat.value
                return (
                  <Button
                    key={cat.value || 'all'}
                    variant={catActive ? 'default' : 'outline'}
                    size="xs"
                    onClick={function() { setMainCategory(cat.value) }}
                    className={catActive ? 'ring-2 ring-primary/30' : ''}
                  >
                    {catActive && <Check className="h-3 w-3 mr-1" />}
                    {cat.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Status</Label>
              {selectedStatuses.length > 0 && (
                <button
                  type="button"
                  onClick={function() { setSelectedStatuses([]) }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Hapus semua
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(function(opt) {
                const active = selectedStatuses.includes(opt.value)
                return (
                  <Button
                    key={opt.value}
                    variant={active ? 'default' : 'outline'}
                    size="xs"
                    onClick={function() { toggleStatus(opt.value) }}
                    className={active ? 'ring-2 ring-primary/30' : ''}
                  >
                    {active && <Check className="h-3 w-3 mr-1" />}
                    {absensiStatusLabel[opt.value]}
                    {active && <X className="h-3 w-3 ml-1" />}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={function() { p.onOpenChange(false) }}>Batal</Button>
          <Button onClick={handleExport} disabled={p.loading}>
            <FileDown className="h-4 w-4 mr-2" />
            Export XLSX
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
