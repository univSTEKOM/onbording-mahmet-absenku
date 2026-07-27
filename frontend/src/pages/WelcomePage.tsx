import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Fingerprint,
  BarChart3,
  CalendarCheck,
  Zap,
  ShieldCheck,
  CloudCheck,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  Users,
  Clock,
} from 'lucide-react'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

const features = [
  {
    icon: Fingerprint,
    title: 'Verifikasi Wajah',
    desc: 'Pastikan identitas dengan pengenalan wajah terintegrasi. Proses check-in lebih aman dan akurat tanpa kartu fisik.',
  },
  {
    icon: BarChart3,
    title: 'Analitik Real-time',
    desc: 'Pantau kehadiran secara langsung dengan laporan visual. Lihat tren produktivitas tim di seluruh organisasi.',
  },
  {
    icon: CalendarCheck,
    title: 'Manajemen Cuti & Izin',
    desc: 'Ajukan cuti, izin, atau sakit dalam hitungan detik. Alur persetujuan satu klik tanpa hambatan birokrasi.',
  },
  {
    icon: Users,
    title: 'Multi-level Role',
    desc: 'Dua peran terpisah — Karyawan dan Admin — dengan akses dan fitur yang sesuai kebutuhan masing-masing.',
  },
  {
    icon: Clock,
    title: 'Riwayat & Rekapitulasi',
    desc: 'Akses riwayat kehadiran lengkap dengan filter tanggal, ekspor CSV, dan kalender interaktif.',
  },
  {
    icon: Sparkles,
    title: 'Dashboard Personal',
    desc: 'Setiap karyawan mendapat ringkasan kehadiran personal lengkap dengan statistik dan grafik kehadiran.',
  },
]

const benefits = [
  { icon: Zap, title: 'Cepat & Responsif', desc: 'Aplikasi ringan dengan pembaruan real-time. Absensi tidak perlu menyita waktu berharga Anda.' },
  { icon: ShieldCheck, title: 'Keamanan Data', desc: 'Enkripsi untuk semua data karyawan. Sesuai standar keamanan aplikasi enterprise modern.' },
  { icon: CloudCheck, title: 'Infrastruktur Andal', desc: 'Dibangun di atas arsitektur modern dan skalabel. Siap melayani tim dari berbagai skala.' },
]

export default function WelcomePage() {
  const { user, isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    if (user.status === 'pending' || user.status === 'rejected') {
      navigate({ to: '/status', replace: true })
    } else {
      navigate({ to: isAdmin ? '/admin/dashboard' : '/dashboard', replace: true })
    }
  }, [user, isLoading, isAdmin, navigate])

  useScrollReveal()

  function goToDashboard() {
    navigate({ to: isAdmin ? '/admin/dashboard' : '/dashboard' })
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-lg">
        Langsung ke konten utama
      </a>

      <nav className="sticky top-0 z-40 flex items-center justify-between w-full px-4 md:px-8 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <Logo className="h-8 md:h-9" />
        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          {user ? (
            <Button onClick={goToDashboard} size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-1.5">
                Masuk <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main id="main-content">
        <section className="relative pt-16 md:pt-24 pb-12 md:pb-16 px-4 md:px-8 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 ease-out">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 md:px-4 py-1 rounded-full mb-6 md:mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[11px] md:text-xs font-semibold uppercase tracking-widest">Siap Digunakan v2.0</span>
              </div>
            </div>

            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 delay-100 ease-out">
              <h1 className="text-[clamp(2rem,7vw,4.5rem)] font-extrabold tracking-tight leading-[1.05] max-w-4xl mb-4 md:mb-6">
                Kelola Absensi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Lebih Mudah.
                </span>
              </h1>
            </div>

            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 delay-200 ease-out">
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mb-8 md:mb-12 px-2">
                Sistem manajemen kehadiran dan administrasi premium untuk tim berkinerja tinggi.
                Rasakan presisi logistik tenaga kerja modern.
              </p>
            </div>

            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 delay-300 ease-out">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                {user ? (
                  <Button onClick={goToDashboard} size="lg" className="text-sm md:text-base px-6 md:px-10 py-4 md:py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all gap-2 w-full sm:w-auto">
                    <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
                    Buka Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button size="lg" className="text-sm md:text-base px-6 md:px-10 py-4 md:py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                        Mulai Sekarang
                      </Button>
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="text-sm md:text-base px-6 md:px-10 py-4 md:py-6 rounded-xl w-full sm:w-auto">
                        Masuk
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="reveal-on-scroll translate-y-8 opacity-0 transition-all duration-700 delay-500 ease-out mt-12 md:mt-20 w-full">
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl rounded-3xl opacity-50 pointer-events-none" />
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/dashboard-illustration.png"
                    alt="Dashboard AbsenKu"
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 md:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 ease-out text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                Fitur Unggulan
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Alat yang dirancang untuk memberdayakan manajemen dan menyenangkan karyawan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 ease-out"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="group bg-card p-5 md:p-8 rounded-xl md:rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">{f.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 ease-out flex-1">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6 md:mb-8 leading-tight">
                Mengapa Memilih AbsenKu?
              </h2>
              <div className="space-y-6 md:space-y-8">
                {benefits.map((b) => {
                  const Icon = b.icon
                  return (
                    <div key={b.title} className="flex gap-3 md:gap-4">
                      <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white">
                        <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm md:text-lg font-semibold mb-0.5 md:mb-1">{b.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 delay-200 ease-out flex-1 w-full">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/why-choose-me-illustration.png"
                  alt="Ilustrasi AbsenKu"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="reveal-on-scroll translate-y-6 opacity-0 transition-all duration-700 ease-out max-w-5xl mx-auto">
            <div className="relative overflow-hidden bg-primary rounded-2xl md:rounded-3xl p-8 md:p-16 text-center text-primary-foreground">
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl -mr-24 md:-mr-32 -mt-24 md:-mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-3xl -ml-16 md:-ml-24 -mb-16 md:-mb-24 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-6">
                  Siap Mencoba AbsenKu?
                </h2>
                <p className="text-sm md:text-lg text-primary-foreground/80 mb-6 md:mb-10 max-w-xl mx-auto px-2">
                  Sistem absensi modern untuk tim Anda. Gratis dicoba, tanpa komitmen.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                  {user ? (
                    <Button onClick={goToDashboard} size="lg" className="bg-white text-primary hover:bg-white/90 px-6 md:px-10 py-4 md:py-6 rounded-xl text-sm md:text-base font-bold gap-2 w-full sm:w-auto">
                      <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" />
                      Buka Dashboard
                    </Button>
                  ) : (
                    <>
                      <Link to="/register" className="w-full sm:w-auto">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-6 md:px-10 py-4 md:py-6 rounded-xl text-sm md:text-base font-bold w-full sm:w-auto shadow-lg">
                          Coba Gratis
                        </Button>
                      </Link>
                      <Link to="/login" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 px-6 md:px-10 py-4 md:py-6 rounded-xl text-sm md:text-base font-bold w-full sm:w-auto">
                          Masuk
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/30 pt-10 md:pt-16 pb-8 md:pb-10 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Logo className="h-6 md:h-7" />
            <span className="text-xs md:text-sm text-muted-foreground">Sistem Absensi Karyawan</span>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AbsenKu by <a href="https://github.com/MAHMETT" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/MAHMETT</a>
          </p>
        </div>
      </footer>

      <style>{`
        .revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-on-scroll {
            opacity: 1 !important;
            transform: translateY(0) !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}
