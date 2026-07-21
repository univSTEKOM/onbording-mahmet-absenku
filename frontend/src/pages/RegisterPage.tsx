import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    jabatan: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch {
      setError('Gagal mendaftar. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Daftar</CardTitle>
        <CardDescription>Buat akun baru</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input id="nama" name="nama" value={form.nama} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan</Label>
            <Input id="jabatan" name="jabatan" value={form.jabatan} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
