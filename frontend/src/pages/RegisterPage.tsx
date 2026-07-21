import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasiPassword: '', jabatan: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.nama.trim()) errs.nama = 'Nama harus diisi'
    if (!form.email.trim()) errs.email = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid'
    if (!form.password) errs.password = 'Password harus diisi'
    else if (form.password.length < 6) errs.password = 'Minimal 6 karakter'
    if (form.password !== form.konfirmasiPassword) errs.konfirmasiPassword = 'Password tidak cocok'
    if (!form.jabatan.trim()) errs.jabatan = 'Jabatan harus diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register({ nama: form.nama, email: form.email, password: form.password, jabatan: form.jabatan, phone: form.phone })
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mendaftar'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Akun</h1>
          <p className="text-sm text-muted-foreground">Daftar sebagai karyawan</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">{apiError}</div>}

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" name="nama" value={form.nama} onChange={handleChange} className={errors.nama ? 'border-destructive' : ''} />
                {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} className={errors.password ? 'border-destructive' : ''} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="konfirmasiPassword">Konfirmasi</Label>
                  <Input id="konfirmasiPassword" name="konfirmasiPassword" type="password" value={form.konfirmasiPassword} onChange={handleChange} className={errors.konfirmasiPassword ? 'border-destructive' : ''} />
                  {errors.konfirmasiPassword && <p className="text-xs text-destructive">{errors.konfirmasiPassword}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input id="jabatan" name="jabatan" value={form.jabatan} onChange={handleChange} className={errors.jabatan ? 'border-destructive' : ''} />
                {errors.jabatan && <p className="text-xs text-destructive">{errors.jabatan}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon <span className="text-muted-foreground">(opsional)</span></Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</> : 'Daftar'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Masuk</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
