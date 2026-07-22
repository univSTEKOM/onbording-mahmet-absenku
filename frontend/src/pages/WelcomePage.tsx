import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import {
  BarChart3,
  CalendarCheck,
  Zap,
  ShieldCheck,
  CloudCheck,
  BadgeCheck,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Verifikasi Wajah',
    desc: 'Pastikan identitas dengan pengenalan wajah terintegrasi. Aman, cepat, dan akurat.',
  },
  {
    icon: BarChart3,
    title: 'Analitik Real-time',
    desc: 'Pantau kehadiran secara langsung dengan laporan mendalam. Lihat tren produktivitas di seluruh organisasi.',
  },
  {
    icon: CalendarCheck,
    title: 'Manajemen Cuti',
    desc: 'Otomatiskan permintaan cuti, izin sakit, dan persetujuan. Alur kerja satu klik tanpa hambatan.',
  },
]

const benefits = [
  { icon: Zap, title: 'Cepat', desc: 'Pembaruan tanpa latensi dan check-in kilat. Absensi tidak perlu menyita waktu Anda.' },
  { icon: ShieldCheck, title: 'Aman', desc: 'Enkripsi tingkat enterprise untuk semua data karyawan. Privasi adalah arsitektur utama kami.' },
  { icon: CloudCheck, title: 'Handal', desc: 'Jaminan uptime 99.9%. AbsenKu bekerja saat tim Anda bekerja, siang atau malam.' },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`transition-all duration-700 opacity-0 translate-y-10 ${className}`}>
      {children}
    </div>
  )
}

export default function WelcomePage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  function goToDashboard() {
    navigate(isAdmin ? '/hrd/dashboard' : '/dashboard')
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/10 selection:text-primary">

      <nav className="sticky top-0 z-40 flex items-center justify-between w-full px-8 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <Logo className="h-9" />
        <div className="flex items-center gap-3">
          {user ? (
            <Button onClick={goToDashboard} className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gap-1.5">
                  Daftar <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <section className="relative pt-24 pb-16 px-8 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-8">
                <BadgeCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Siap Digunakan v2.0</span>
              </div>
            </Reveal>
            <Reveal>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-4xl mb-6 font-sans">
                Kelola Absensi <span className="text-primary">Lebih Mudah.</span>
              </h1>
            </Reveal>
            <Reveal>
              <p className="text-lg text-muted-foreground max-w-2xl mb-12">
                Sistem manajemen kehadiran dan HRD premium untuk tim berkinerja tinggi. 
                Rasakan presisi logistik tenaga kerja modern.
              </p>
            </Reveal>
            <Reveal>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button onClick={goToDashboard} size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Buka Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                        Mulai Sekarang
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="lg" className="text-base px-10 py-6 rounded-xl">
                        Masuk
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-20 relative max-w-6xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-3xl opacity-50 pointer-events-none" />
            <div className="relative bg-card rounded-3xl border border-border shadow-2xl overflow-hidden aspect-[16/9]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-card flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Logo className="h-16 mx-auto opacity-30" />
                  <p className="text-muted-foreground/50 text-sm">Preview Dashboard</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="py-24 px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4 font-sans">Fitur Unggulan</h2>
              <p className="text-lg text-muted-foreground">Alat yang dirancang untuk memberdayakan manajemen dan menyenangkan karyawan.</p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <Reveal key={f.title}>
                    <div className="group bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <Reveal className="flex-1">
              <h2 className="text-4xl font-bold tracking-tight mb-8 leading-tight font-sans">Mengapa Memilih AbsenKu?</h2>
              <div className="space-y-8">
                {benefits.map((b) => {
                  const Icon = b.icon
                  return (
                    <div key={b.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{b.title}</h4>
                        <p className="text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {!user && (
                <div className="mt-8">
                  <Link to="/register">
                    <Button size="lg" className="gap-2">
                      Mulai Sekarang <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </Reveal>
            <Reveal className="flex-1 w-full">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-primary/10 via-primary/5 to-card flex items-center justify-center">
                <Logo className="h-24 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-24 px-8">
          <Reveal>
            <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-16 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold tracking-tight mb-6 font-sans">Siap Mencoba AbsenKu?</h2>
                <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                  Bergabung dengan 500+ perusahaan yang telah mengoptimalkan tenaga kerja mereka.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {user ? (
                    <Button onClick={goToDashboard} size="lg" className="bg-white text-primary hover:bg-white/90 px-10 py-6 rounded-xl text-base font-bold gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Buka Dashboard
                    </Button>
                  ) : (
                    <>
                      <Link to="/register">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-10 py-6 rounded-xl text-base font-bold">
                          Coba Gratis
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 px-10 py-6 rounded-xl text-base font-bold">
                          Masuk
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <p className="mt-4 text-xs text-primary-foreground/60">
                  Demo: andika@stekom.ac.id / password
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-muted/50 pt-16 pb-10 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo className="h-7" />
            <span className="text-sm text-muted-foreground">Sistem Absensi Karyawan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AbsenKu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
