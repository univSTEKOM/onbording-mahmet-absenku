import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    if (validateNama(form.nama)) return false
    if (validateEmail(form.email)) return false
    if (validatePassword(form.password)) return false
    if (form.password !== form.konfirmasiPassword) return false
    if (validateJabatan(form.jabatan)) return false
    if (validatePhone(form.phone)) return false
    return true
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo className="h-8" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
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
                    className="bg-background" required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email" name="email" type="email" placeholder="m@example.com"
                    value={form.email} onChange={handleChange}
                    className="bg-background" required
                  />
                  <FieldDescription>Kami akan menggunakan ini untuk menghubungi Anda.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password" name="password" type="password"
                    value={form.password} onChange={handleChange}
                    className="bg-background" required
                  />
                  <FieldDescription>Minimal 6 karakter.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="konfirmasiPassword">Konfirmasi Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="konfirmasiPassword" name="konfirmasiPassword" type="password"
                      value={form.konfirmasiPassword} onChange={handleChange}
                      className="bg-background" required
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
                </Field>

                <Field>
                  <FieldLabel htmlFor="jabatan">Jabatan</FieldLabel>
                  <Input
                    id="jabatan" name="jabatan" type="text" placeholder="Staff IT"
                    value={form.jabatan} onChange={handleChange}
                    className="bg-background" required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">No. Telepon <span className="text-muted-foreground font-normal">(opsional)</span></FieldLabel>
                  <PhoneInput
                    id="phone" name="phone"
                    value={form.phone}
                    onChange={(v) => { setForm({ ...form, phone: v }) }}
                  />
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
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/login&register background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
