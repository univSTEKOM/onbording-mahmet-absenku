import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Logo } from '@/components/Logo'
import { Loader2 } from 'lucide-react'
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
      navigate('/status')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email atau password salah'
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
        className="absolute inset-0 h-full w-full object-cover object-bottom dark:brightness-[0.2] dark:grayscale"
      />
      <div className="relative z-10 flex min-h-svh flex-col gap-4 p-6 md:p-10 lg:w-[420px] lg:bg-background/80 lg:backdrop-blur-sm">
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
                  <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Masukkan email dan password untuk melanjutkan
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                    className={errors.email ? 'border-destructive bg-background' : 'bg-background'}
                    required
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                    className={errors.password ? 'border-destructive bg-background' : 'bg-background'}
                    required
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </Field>
                <Field>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</> : 'Masuk'}
                  </Button>
                </Field>
                <Field>
                  <FieldDescription className="text-center">
                    Belum punya akun?{' '}
                    <Link to="/register" className="underline underline-offset-4 hover:text-foreground">
                      Daftar
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
