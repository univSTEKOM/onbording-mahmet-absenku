import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Loader2, Fingerprint } from 'lucide-react'
import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from '@/lib/constants'
import { validateEmail, validatePassword } from '@/lib/validation'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    const e = validateEmail(email)
    if (e) errs.email = e
    const p = validatePassword(password)
    if (p) errs.password = p
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email atau password salah'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh">
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Fingerprint className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Absensi Karyawan</h1>
            <p className="text-sm text-muted-foreground">Masuk ke akun Anda</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{apiError}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" value={email} maxLength={MAX_EMAIL_LENGTH}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" value={password} maxLength={MAX_PASSWORD_LENGTH}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</> : 'Masuk'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">Daftar</Link>
            </p>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Demo: andika@stekom.ac.id / password
          </p>
        </div>
      </div>
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-10">
        <div className="relative space-y-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
            <Fingerprint className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Sistem Absensi Karyawan</h2>
            <p className="text-muted-foreground max-w-sm">
              Kelola kehadiran, izin, dan cuti karyawan dengan mudah dan efisien.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {['Absensi', 'Izin/Cuti', 'Laporan'].map((item) => (
              <div key={item} className="rounded-xl bg-background/80 backdrop-blur-sm p-4 text-center shadow-xs">
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
