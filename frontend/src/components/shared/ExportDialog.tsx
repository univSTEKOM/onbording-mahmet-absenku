import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileDown, CalendarDays } from 'lucide-react'

interface DatePreset {
  label: string
  getRange: () => { from: string; to: string }
}

const presets: DatePreset[] = [
  { label: 'Hari Ini', getRange: function() { const d = new Date(); const s = d.toISOString().split('T')[0]; return { from: s, to: s } } },
  { label: '7 Hari', getRange: function() { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] } } },
  { label: 'Bulan Ini', getRange: function() { const to = new Date(); const from = new Date(); from.setDate(1); return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] } } },
  { label: 'Semua', getRange: function() { return { from: '', to: '' } } },
]

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: 'xlsx' | 'csv', dateFrom: string, dateTo: string) => void
  loading?: boolean
}

export function ExportDialog(p: ExportDialogProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')

  function applyPreset(pr: DatePreset) {
    const range = pr.getRange()
    setDateFrom(range.from)
    setDateTo(range.to)
  }

  function handleExport() {
    p.onExport(format, dateFrom, dateTo)
  }

  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export Data
          </DialogTitle>
          <DialogDescription>Pilih rentang tanggal dan format export</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Rentang Cepat</Label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(function(pr) {
                return (
                  <Button key={pr.label} variant="outline" size="xs" onClick={function() { applyPreset(pr) }}>
                    {pr.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exp-from">Dari</Label>
              <Input id="exp-from" type="date" value={dateFrom} onChange={function(e) { setDateFrom(e.target.value) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-to">Sampai</Label>
              <Input id="exp-to" type="date" value={dateTo} onChange={function(e) { setDateTo(e.target.value) }} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex gap-2">
              <Button variant={format === 'xlsx' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2" onClick={function() { setFormat('xlsx') }}>
                <FileDown className="h-4 w-4" /> Excel (.xlsx)
              </Button>
              <Button variant={format === 'csv' ? 'default' : 'outline'} size="sm" className="flex-1 gap-2" onClick={function() { setFormat('csv') }}>
                <FileDown className="h-4 w-4" /> CSV (.csv)
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={function() { p.onOpenChange(false) }}>Batal</Button>
          <Button onClick={handleExport} disabled={p.loading}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
