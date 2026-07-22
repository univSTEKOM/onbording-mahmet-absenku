import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Fingerprint,
  Clock,
  FileText,
  BarChart3,
  ShieldCheck,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ScanFace,
  CalendarCheck,
} from 'lucide-react'

const features = [
  {
    icon: ScanFace,
    title: 'Verifikasi Wajah',
    desc: 'Absensi berbasis face recognition untuk akurasi dan keamanan data kehadiran.',
  },
  {
    icon: Clock,
    title: 'Check-In / Out',
    desc: 'Catat waktu masuk dan pulang secara otomatis dengan riwayat lengkap.',
  },
  {
    icon: FileText,
    title: 'Izin & Cuti',
    desc: 'Ajukan izin, cuti, atau sakit dengan status persetujuan real-time.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Personal',
    desc: 'Pantau statistik kehadiran harian, mingguan, dan bulanan.',
  },
  {
    icon: Users,
    title: 'Manajemen HRD',
    desc: 'Kelola seluruh karyawan, approve pengajuan, dan lihat rekapitulasi.',
  },
  {
    icon: CalendarCheck,
    title: 'Riwayat Lengkap',
    desc: 'Filter, sortir, dan ekspor riwayat kehadiran ke CSV.',
  },
]

const stats = [
  { label: 'Karyawan Terdaftar', value: '500+' },
  { label: 'Transaksi per Hari', value: '1.2rb+' },
  { label: 'Perusahaan Mitra', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
]

export default function WelcomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-transparent bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-xs">
              <Fingerprint className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">AbsenKu</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#fitur" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Fitur</a>
            <a href="#tentang" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Tentang</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link to="/register" className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5">
                Daftar <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Sistem absensi modern berbasis web
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Absensi Karyawan
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Jadi Lebih Mudah</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Kelola kehadiran, izin, dan cuti karyawan dalam satu platform.
            Dilengkapi verifikasi wajah dan dashboard real-time untuk HRD.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sudah Punya Akun
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card/50 p-5 text-center backdrop-blur-sm transition-colors hover:bg-card/80">
              <p className="text-2xl font-bold tracking-tight text-primary md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fitur" className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Fitur Unggulan</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Semua yang Anda Butuhkan
            </h2>
            <p className="mt-3 text-muted-foreground">
              Platform absensi lengkap untuk karyawan dan HRD dalam satu kesatuan.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="tentang" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative">
              <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-background p-8 md:p-10">
                <ShieldCheck className="mb-4 h-10 w-10 text-primary" />
                <h3 className="text-2xl font-bold tracking-tight">Keamanan & Kenyamanan</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Data kehadiran Anda aman dengan autentikasi modern dan sesi terkelola.
                  Verifikasi wajah opsional memberikan lapisan keamanan tambahan tanpa
                  menghambat alur absensi utama.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Face Recognition', 'SSL Encrypted', 'Session Based', 'Role Access'].map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Badge className="mb-3">Untuk Karyawan</Badge>
                <h4 className="text-lg font-semibold">Absensi Harian & Riwayat</h4>
                <p className="mt-1 text-sm text-muted-foreground">Check-in/out cepat, lihat histori, ajukan izin dalam hitungan detik.</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-3">Untuk HRD</Badge>
                <h4 className="text-lg font-semibold">Dashboard & Manajemen</h4>
                <p className="mt-1 text-sm text-muted-foreground">Pantau seluruh karyawan, kelola pengajuan, dan unduh laporan dalam format CSV.</p>
              </div>
              <Link to="/register">
                <Button variant="outline" className="gap-2">
                  Pelajari Selengkapnya <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Siap Mencoba?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Daftar sekarang dan nikmati kemudahan mengelola absensi karyawan.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Daftar Gratis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Masuk
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo: andika@stekom.ac.id / password
          </p>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
              <Fingerprint className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-medium text-foreground">AbsenKu</span>
            <span className="hidden sm:inline">— Sistem Absensi Karyawan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AbsenKu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
