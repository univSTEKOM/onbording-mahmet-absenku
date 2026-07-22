import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export interface FilterValues {
  search: string
  jenis: string
  status: string
  dateFrom: string
  dateTo: string
}

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: FilterValues
  onApply: (values: FilterValues) => void
  onReset: () => void
  showJenis?: boolean
  showStatus?: boolean
  showDate?: boolean
  searchPlaceholder?: string
  jenisOptions?: { value: string; label: string }[]
  statusOptions?: { value: string; label: string }[]
  datePresets?: { label: string; get: () => string }[]
}

export function FilterDialog({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
  showJenis = true,
  showStatus = true,
  showDate = true,
  searchPlaceholder = 'Cari...',
  jenisOptions,
  statusOptions,
  datePresets,
}: FilterDialogProps) {
  const [local, setLocal] = useState<FilterValues>(values)

  useEffect(() => {
    if (open) setLocal(values)
  }, [open, values])

  function handlePreset(get: () => string) {
    const from = get()
    const to = new Date().toISOString().split('T')[0]
    setLocal((prev) => ({ ...prev, dateFrom: from, dateTo: to }))
  }

  function handleApply() {
    onApply(local)
    onOpenChange(false)
  }

  function handleReset() {
    onReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>Saring data pengajuan</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{searchPlaceholder.includes('karyawan') ? 'Karyawan' : 'Pencarian'}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9"
                value={local.search}
                onChange={(e) => setLocal((p) => ({ ...p, search: e.target.value }))}
              />
            </div>
          </div>

          {showJenis && (
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={local.jenis}
                onValueChange={(v) => setLocal((p) => ({ ...p, jenis: v === ' ' ? '' : v || '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Semua</SelectItem>
                  {(jenisOptions || [
                    { value: 'cuti', label: 'Cuti' },
                    { value: 'izin', label: 'Izin' },
                    { value: 'sakit', label: 'Sakit' },
                  ]).map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatus && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={local.status}
                onValueChange={(v) => setLocal((p) => ({ ...p, status: v === ' ' ? '' : v || '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Semua</SelectItem>
                  {(statusOptions || [
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Disetujui' },
                    { value: 'rejected', label: 'Ditolak' },
                  ]).map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showDate && (
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={local.dateFrom} onChange={(e) => setLocal((p) => ({ ...p, dateFrom: e.target.value }))} placeholder="Dari" />
                <Input type="date" value={local.dateTo} onChange={(e) => setLocal((p) => ({ ...p, dateTo: e.target.value }))} placeholder="Sampai" />
              </div>
              {datePresets && (
                <div className="flex gap-1 flex-wrap pt-1">
                  {datePresets.map((p) => (
                    <Button key={p.label} variant="outline" size="sm" type="button" onClick={() => handlePreset(p.get)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleReset}>Reset</Button>
          <Button className="flex-1" onClick={handleApply}>Terapkan</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
