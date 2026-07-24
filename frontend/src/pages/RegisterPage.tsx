import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { PhoneInput } from '@/components/ui/phone-input'
import { Logo } from '@/components/Logo'
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
      navigate({ to: '/login' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mendaftar'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      <img
        src="/login&register background.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div className="relative z-10 flex min-h-svh flex-col gap-4 p-6 md:p-10 lg:w-[420px] lg:bg-background/80 lg:backdrop-blur-sm overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo className="h-8" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {apiError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{apiError}</div>
              )}
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Buat akun baru</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Isi formulir di bawah untuk mendaftar
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="nama">Nama Lengkap</FieldLabel>
                  <Input
                    id="nama" name="nama" type="text" placeholder="John Doe"
                    value={form.nama} onChange={handleChange}
                    className={errors.nama ? 'border-destructive bg-background' : 'bg-background'} required
                  />
                  {errors.nama && <p className="text-xs text-destructive mt-1">{errors.nama}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email" name="email" type="email" placeholder="m@example.com"
                    value={form.email} onChange={handleChange}
                    className={errors.email ? 'border-destructive bg-background' : 'bg-background'} required
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password" name="password" type="password"
                    value={form.password} onChange={handleChange}
                    className={errors.password ? 'border-destructive bg-background' : 'bg-background'} required
                  />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="konfirmasiPassword">Konfirmasi Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="konfirmasiPassword" name="konfirmasiPassword" type="password"
                      value={form.konfirmasiPassword} onChange={handleChange}
                      className={errors.konfirmasiPassword ? 'border-destructive bg-background' : 'bg-background'} required
                    />
                    {form.konfirmasiPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {form.konfirmasiPassword === form.password ? (
                          <CheckCircle2 className="size-4 text-green-500" />
                        ) : (
                          <XCircle className="size-4 text-destructive" />
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
                    value={form.jabatan} onChange={handleChange}
                    className={errors.jabatan ? 'border-destructive bg-background' : 'bg-background'} required
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
                  <FieldDescription className="text-center">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
                      Masuk
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
