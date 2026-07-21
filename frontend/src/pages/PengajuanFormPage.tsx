import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePengajuan } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function PengajuanFormPage() {
  const navigate = useNavigate()
  const mutation = useCreatePengajuan()
  const [form, setForm] = useState({
    jenis: 'cuti',
    tanggalMulai: '',
    tanggalSelesai: '',
    alasan: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.tanggalMulai) errs.tanggalMulai = 'Tanggal mulai harus diisi'
    if (!form.tanggalSelesai)
      errs.tanggalSelesai = 'Tanggal selesai harus diisi'
    if (form.tanggalMulai && form.tanggalSelesai) {
      if (form.tanggalSelesai < form.tanggalMulai)
        errs.tanggalSelesai = 'Tanggal selesai harus setelah tanggal mulai'
    }
    if (!form.alasan.trim()) errs.alasan = 'Alasan harus diisi'
    else if (form.alasan.length < 10)
      errs.alasan = 'Alasan minimal 10 karakter'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    mutation.mutate(
      {
        jenis: form.jenis,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        alasan: form.alasan,
      },
      {
        onSuccess: () => navigate('/pengajuan'),
        onError: (err) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message || 'Gagal mengajukan. Coba lagi.'
          setApiError(msg)
        },
      }
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ajukan Izin / Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="jenis">
                Jenis <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.jenis}
                onValueChange={(v) =>
                  setForm({ ...form, jenis: v })
                }
              >
                <SelectTrigger id="jenis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalMulai">
                  Tanggal Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) => {
                    setForm({ ...form, tanggalMulai: e.target.value })
                    setErrors((prev) => ({ ...prev, tanggalMulai: '' }))
                  }}
                  className={
                    errors.tanggalMulai ? 'border-destructive' : ''
                  }
                />
                {errors.tanggalMulai && (
                  <p className="text-xs text-destructive">
                    {errors.tanggalMulai}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalSelesai">
                  Tanggal Selesai{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggalSelesai"
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) => {
                    setForm({ ...form, tanggalSelesai: e.target.value })
                    setErrors((prev) => ({ ...prev, tanggalSelesai: '' }))
                  }}
                  className={
                    errors.tanggalSelesai ? 'border-destructive' : ''
                  }
                />
                {errors.tanggalSelesai && (
                  <p className="text-xs text-destructive">
                    {errors.tanggalSelesai}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan">
                Alasan <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="alasan"
                className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ${errors.alasan ? 'border-destructive' : 'border-input'}`}
                value={form.alasan}
                onChange={(e) => {
                  setForm({ ...form, alasan: e.target.value })
                  setErrors((prev) => ({ ...prev, alasan: '' }))
                }}
                placeholder="Jelaskan alasan pengajuan Anda..."
              />
              {errors.alasan && (
                <p className="text-xs text-destructive">
                  {errors.alasan}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/pengajuan')}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Ajukan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
