import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/Logo'
import { Loader2, LogIn } from 'lucide-react'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { validateEmail, validatePassword } from '@/lib/validation'
import { getApiErrorMessage } from '@/lib/utils'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoError, setVideoError] = useState(false)

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
      navigate({ to: '/' })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Email atau password salah')
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

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-sm rounded-2xl bg-background/90 backdrop-blur-md p-6 md:p-8 shadow-lg lg:bg-background/80 lg:backdrop-blur-xl lg:shadow-2xl lg:border lg:border-border/50">
          <div className="flex flex-col items-center gap-2 mb-8">
            <Logo className="h-9" />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col items-center gap-1.5 text-center mb-8">
              <h1 className="text-xl font-semibold tracking-tight">Masuk ke akun Anda</h1>
              <p className="text-sm text-muted-foreground">
                Masukkan email dan password untuk melanjutkan
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                    className={errors.email ? 'border-destructive bg-background' : 'bg-background'}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                    error={errors.password}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                ) : (
                  <><LogIn className="h-4 w-4" /> Masuk</>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Belum punya akun?{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Daftar
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
