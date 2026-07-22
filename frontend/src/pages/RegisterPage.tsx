import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { PhoneInput } from '@/components/ui/phone-input'
import { Logo } from '@/components/Logo'
import { MAX_NAMA_LENGTH, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MAX_JABATAN_LENGTH } from '@/lib/constants'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
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
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mendaftar'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh">
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Logo className="h-10 mb-2" />
                <h1 className="text-2xl font-bold">Buat akun baru</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Isi formulir di bawah untuk mendaftar
                </p>
              </div>

              {apiError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{apiError}</div>
              )}

              <Field>
                <FieldLabel htmlFor="nama">Nama Lengkap</FieldLabel>
                <Input
                  id="nama" name="nama" type="text" placeholder="John Doe"
                  value={form.nama} maxLength={MAX_NAMA_LENGTH} onChange={handleChange}
                  className={`bg-background ${errors.nama ? 'border-destructive' : ''}`}
                  required
                />
                {errors.nama && <p className="text-xs text-destructive mt-1">{errors.nama}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email" name="email" type="email" placeholder="m@example.com"
                  value={form.email} maxLength={MAX_EMAIL_LENGTH} onChange={handleChange}
                  className={`bg-background ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
                <FieldDescription>Kami akan menggunakan ini untuk menghubungi Anda.</FieldDescription>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password" name="password" type="password"
                  value={form.password} maxLength={MAX_PASSWORD_LENGTH} onChange={handleChange}
                  className={`bg-background ${errors.password ? 'border-destructive' : ''}`}
                  required
                />
                <FieldDescription>Minimal 6 karakter.</FieldDescription>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="konfirmasiPassword">Konfirmasi Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="konfirmasiPassword" name="konfirmasiPassword" type="password"
                    value={form.konfirmasiPassword} maxLength={MAX_PASSWORD_LENGTH} onChange={handleChange}
                    className={`bg-background ${errors.konfirmasiPassword ? 'border-destructive' : ''}`}
                    required
                  />
                  {form.konfirmasiPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {form.konfirmasiPassword === form.password ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {errors.konfirmasiPassword && <p className="text-xs text-destructive mt-1">{errors.konfirmasiPassword}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="jabatan">Jabatan</FieldLabel>
                <Input
                  id="jabatan" name="jabatan" type="text" placeholder="Staff IT"
                  value={form.jabatan} maxLength={MAX_JABATAN_LENGTH} onChange={handleChange}
                  className={`bg-background ${errors.jabatan ? 'border-destructive' : ''}`}
                  required
                />
                {errors.jabatan && <p className="text-xs text-destructive mt-1">{errors.jabatan}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">No. Telepon <span className="text-muted-foreground font-normal">(opsional)</span></FieldLabel>
                <PhoneInput
                  id="phone" name="phone"
                  value={form.phone}
                  onChange={(v) => { setForm({ ...form, phone: v }); setErrors((p) => ({ ...p, phone: '' })) }}
                  error={errors.phone}
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </Field>

              <Field>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</> : 'Daftar'}
                </Button>
              </Field>

              <Field>
                <p className="text-center text-sm text-muted-foreground">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
                    Masuk
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden">
        <img src="/login&register background.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 flex items-center justify-center w-full p-10">
          <div className="text-center space-y-6 bg-background/40 backdrop-blur-sm p-8 rounded-2xl">
            <Logo className="h-16 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Bergabunglah</h2>
              <p className="text-muted-foreground max-w-sm">
                Daftarkan akun Anda dan mulai kelola kehadiran dengan mudah.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {['Mudah', 'Cepat', 'Aman', 'Terpercaya'].map((item) => (
                <div key={item} className="rounded-xl bg-background/80 backdrop-blur-sm p-4 text-center shadow-xs">
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
