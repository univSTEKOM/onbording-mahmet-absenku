import { useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useCreatePengajuan, useUpdatePengajuan } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { MAX_ALASAN_LENGTH, MIN_ALASAN_LENGTH, MAX_PENGAJUAN_DURATION_DAYS } from '@/lib/constants'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Loader2, Send, ArrowLeft } from 'lucide-react'
import type { Pengajuan } from '@/types'

export default function PengajuanFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editData = (location.state as { edit?: Pengajuan })?.edit
  const isEdit = !!editData

  const createMutation = useCreatePengajuan()
  const updateMutation = useUpdatePengajuan()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState({
    jenis: editData?.jenis || 'cuti',
    tanggalMulai: editData?.tanggalMulai || '',
    tanggalSelesai: editData?.tanggalSelesai || '',
    alasan: editData?.alasan || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.tanggalMulai) errs.tanggalMulai = 'Harus diisi'
    else {
      const today = new Date().toISOString().split('T')[0]
      if (form.tanggalMulai < today) errs.tanggalMulai = 'Tidak boleh mundur'
    }
    if (!form.tanggalSelesai) errs.tanggalSelesai = 'Harus diisi'
    if (form.tanggalMulai && form.tanggalSelesai) {
      if (form.tanggalSelesai < form.tanggalMulai) errs.tanggalSelesai = 'Selesai harus setelah mulai'
      else {
        const start = new Date(form.tanggalMulai)
        const end = new Date(form.tanggalSelesai)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        if (days > MAX_PENGAJUAN_DURATION_DAYS) errs.tanggalSelesai = 'Maksimal ' + MAX_PENGAJUAN_DURATION_DAYS + ' hari'
      }
    }
    if (!form.alasan.trim()) errs.alasan = 'Alasan harus diisi'
    else if (form.alasan.length < MIN_ALASAN_LENGTH) errs.alasan = 'Minimal ' + MIN_ALASAN_LENGTH + ' karakter'
    else if (form.alasan.length > MAX_ALASAN_LENGTH) errs.alasan = 'Maksimal ' + MAX_ALASAN_LENGTH + ' karakter'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    const data = { jenis: form.jenis, tanggalMulai: form.tanggalMulai, tanggalSelesai: form.tanggalSelesai, alasan: form.alasan }

    if (isEdit && editData) {
      updateMutation.mutate(
        { id: editData.id, data },
        {
          onSuccess: function() { navigate({ to: '/pengajuan' }) },
          onError: function(err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memperbarui'
            setApiError(msg)
          },
        }
      )
    } else {
      createMutation.mutate(
        data,
        {
          onSuccess: function() { navigate({ to: '/pengajuan' }) },
          onError: function(err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengajukan'
            setApiError(msg)
          },
        }
      )
    }
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Kembali" onClick={function() { navigate({ to: '/pengajuan' }) }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Kembali ke daftar pengajuan</p></TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{isEdit ? 'Edit Pengajuan' : 'Ajukan Izin / Cuti'}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{isEdit ? 'Ubah data pengajuan Anda' : 'Isi form di bawah untuk mengajukan'}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis</Label>
              <Select value={form.jenis} onValueChange={function(v) { setForm({ ...form, jenis: v || 'cuti' }) }}>
                <SelectTrigger id="jenis"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                <Input id="tanggalMulai" type="date" value={form.tanggalMulai}
                  onChange={function(e) { setForm({ ...form, tanggalMulai: e.target.value }); setErrors(function(p) { return { ...p, tanggalMulai: '' } }) }}
                  className={errors.tanggalMulai ? 'border-destructive' : ''} />
                {errors.tanggalMulai && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.tanggalMulai}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                <Input id="tanggalSelesai" type="date" value={form.tanggalSelesai}
                  onChange={function(e) { setForm({ ...form, tanggalSelesai: e.target.value }); setErrors(function(p) { return { ...p, tanggalSelesai: '' } }) }}
                  className={errors.tanggalSelesai ? 'border-destructive' : ''} />
                {errors.tanggalSelesai && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.tanggalSelesai}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan</Label>
              <textarea id="alasan"
                className={'flex min-h-[80px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ' + (errors.alasan ? 'border-destructive' : 'border-input')}
                value={form.alasan} maxLength={MAX_ALASAN_LENGTH} placeholder="Jelaskan alasan pengajuan..."
                onChange={function(e) { setForm({ ...form, alasan: e.target.value }); setErrors(function(p) { return { ...p, alasan: '' } }) }} />
              {errors.alasan && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.alasan}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 gap-2" onClick={function() { navigate({ to: '/pengajuan' }) }}>
                Batal
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Send className="h-4 w-4" /> {isEdit ? 'Simpan' : 'Ajukan'}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
