import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Logo } from '@/components/Logo'
import { Loader2, UserPlus } from 'lucide-react'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { PasswordRequirements } from '@/components/shared/PasswordRequirements'
import { getApiErrorMessage } from '@/lib/utils'
import { validateEmail, validatePassword, validateNama, validateJabatan, validatePhone } from '@/lib/validation'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama: '', email: '', password: '', konfirmasiPassword: '', jabatan: '', phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoError, setVideoError] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    const n = validateNama(form.nama)
    if (n) errs.nama = n
    const e = validateEmail(form.email)
    if (e) errs.email = e
    const p = validatePassword(form.password)
    if (p) errs.password = p
    if (form.password !== form.konfirmasiPassword) errs.konfirmasiPassword = 'Password tidak cocok'
    const j = validateJabatan(form.jabatan)
    if (j) errs.jabatan = j
    const ph = validatePhone(form.phone)
    if (ph) errs.phone = ph
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
      navigate({ to: '/login' })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Gagal mendaftar')
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {videoError ? (
        <img
          src="/login&register background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
      ) : (
        <video
          src="/videos/login-register-video-background.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-4 md:p-10 overflow-y-auto">
        <div className="w-full max-w-sm rounded-2xl bg-background/90 backdrop-blur-md p-6 md:p-8 shadow-lg lg:bg-background/80 lg:backdrop-blur-xl lg:shadow-2xl lg:border lg:border-border/50">
          <div className="flex flex-col items-center gap-2 mb-8">
            <Logo className="h-9" />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col items-center gap-1.5 text-center mb-8">
              <h1 className="text-xl font-semibold tracking-tight">Buat akun baru</h1>
              <p className="text-sm text-muted-foreground">
                Isi data diri Anda untuk mendaftar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {apiError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  {apiError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama" name="nama" type="text" placeholder="John Doe"
                    value={form.nama} onChange={handleChange}
                    className={errors.nama ? 'border-destructive bg-background' : 'bg-background'}
                    required autoFocus
                  />
                  {errors.nama && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.nama}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email" name="email" type="email" placeholder="m@example.com"
                    value={form.email} onChange={handleChange}
                    className={errors.email ? 'border-destructive bg-background' : 'bg-background'}
                    required autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      id="password" name="password"
                      value={form.password} onChange={handleChange}
                      error={errors.password}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="konfirmasiPassword">Konfirmasi</Label>
                    <PasswordInput
                      id="konfirmasiPassword" name="konfirmasiPassword"
                      value={form.konfirmasiPassword} onChange={handleChange}
                      error={errors.konfirmasiPassword}
                      matchValue={form.password}
                    />
                  </div>
                </div>
                <PasswordRequirements value={form.password} />

                <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                      id="jabatan" name="jabatan" type="text" placeholder="Staff IT"
                      value={form.jabatan} onChange={handleChange}
                      className={errors.jabatan ? 'border-destructive bg-background' : 'bg-background'}
                      required
                    />
                    {errors.jabatan && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.jabatan}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telepon <span className="text-muted-foreground font-normal">(opsional)</span></Label>
                    <PhoneInput
                      id="phone" name="phone"
                      value={form.phone}
                      onChange={(v) => { setForm({ ...form, phone: v }); setErrors((p) => ({ ...p, phone: '' })) }}
                      error={errors.phone}
                    />
                    {errors.phone && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.phone}</p>}
                  </div>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Daftar</>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Masuk
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
