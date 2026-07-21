import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePengajuan } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PengajuanFormPage() {
  const navigate = useNavigate()
  const mutation = useCreatePengajuan()
  const [form, setForm] = useState({
    jenis: 'cuti',
    tanggalMulai: '',
    tanggalSelesai: '',
    alasan: '',
  })
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.tanggalMulai || !form.tanggalSelesai || !form.alasan) {
      setError('Semua field harus diisi')
      return
    }
    if (form.tanggalSelesai < form.tanggalMulai) {
      setError('Tanggal selesai harus setelah tanggal mulai')
      return
    }

    mutation.mutate(
      {
        jenis: form.jenis,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        alasan: form.alasan,
      },
      {
        onSuccess: () => navigate('/pengajuan'),
        onError: () => setError('Gagal mengajukan. Coba lagi.'),
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
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.jenis}
                onValueChange={(v) => setForm({ ...form, jenis: v })}
              >
                <SelectTrigger>
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
                <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) =>
                    setForm({ ...form, tanggalMulai: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                <Input
                  id="tanggalSelesai"
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) =>
                    setForm({ ...form, tanggalSelesai: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan</Label>
              <textarea
                id="alasan"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.alasan}
                onChange={(e) =>
                  setForm({ ...form, alasan: e.target.value })
                }
                required
              />
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
                {mutation.isPending ? 'Mengirim...' : 'Ajukan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
