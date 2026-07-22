import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Fingerprint,
  BarChart3,
  CalendarCheck,
  Zap,
  ShieldCheck,
  CloudCheck,
  BadgeCheck,
  PlayCircle,
  Globe,
  AtSign,
  Share2,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: Fingerprint,
    title: 'Biometric Verification',
    desc: 'Ensure identity integrity with advanced facial recognition integrations. Secure, fast, and foolproof.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Live attendance tracking with deep-dive reports. Monitor productivity and trends as they happen across your entire organization.',
  },
  {
    icon: CalendarCheck,
    title: 'Seamless Leave Management',
    desc: 'Automate vacation requests, medical leaves, and approvals. One-click workflow that keeps the team moving without friction.',
  },
]

const benefits = [
  { icon: Zap, title: 'Fast', desc: 'Zero-latency updates and rapid check-ins. Time tracking shouldn\'t take your time.' },
  { icon: ShieldCheck, title: 'Secure', desc: 'Enterprise-grade encryption for all employee data. Privacy is our primary architecture.' },
  { icon: CloudCheck, title: 'Reliable', desc: '99.9% uptime guaranteed. AbsenKu works when your team works, day or night.' },
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
  return (
    <div className="bg-background text-foreground selection:bg-primary/10 selection:text-primary">

      <nav className="sticky top-0 z-40 flex items-center justify-between w-full px-8 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <span className="text-2xl font-extrabold tracking-tight text-primary font-sans">AbsenKu</span>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-primary font-semibold border-b-2 border-primary pb-1 text-xs uppercase tracking-widest">Home</a>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-widest">Features</a>
          <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-widest">About</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">Masuk</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main>
        <section className="relative pt-24 pb-16 px-8 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-8">
                <BadgeCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Enterprise Ready v2.0</span>
              </div>
            </Reveal>
            <Reveal>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-4xl mb-6 font-sans">
                Master Your Time with <span className="text-primary">AbsenKu.</span>
              </h1>
            </Reveal>
            <Reveal>
              <p className="text-lg text-muted-foreground max-w-2xl mb-12">
                Premium employee attendance and HR management system for high-performance teams. Experience the precision of modern workforce logistics.
              </p>
            </Reveal>
            <Reveal>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                    Get Started
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-base px-10 py-6 rounded-xl gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-20 relative max-w-6xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-3xl opacity-50 pointer-events-none" />
            <div className="relative bg-card rounded-3xl border border-border shadow-2xl overflow-hidden aspect-[16/9]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-card flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Fingerprint className="h-16 w-16 text-primary/30 mx-auto" />
                  <p className="text-muted-foreground/50 text-sm">Dashboard Preview</p>
                </div>
              </div>
              <div className="absolute top-12 left-12 glass-card p-4 rounded-xl shadow-xl w-64 hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Clocked In</p>
                    <p className="text-sm text-muted-foreground">09:00 AM Today</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="py-24 px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4 font-sans">Engineered for Precision</h2>
              <p className="text-lg text-muted-foreground">Tools designed to empower management and delight employees.</p>
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

        <section id="benefits" className="py-24 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <Reveal className="flex-1">
              <h2 className="text-4xl font-bold tracking-tight mb-8 leading-tight font-sans">Why High-Performance Teams Choose AbsenKu</h2>
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
            </Reveal>
            <Reveal className="flex-1 w-full">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-primary/10 via-primary/5 to-card flex items-center justify-center">
                <Fingerprint className="h-24 w-24 text-primary/20" />
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
                <h2 className="text-4xl font-bold tracking-tight mb-6 font-sans">Ready to transform your HR management?</h2>
                <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                  Join 500+ enterprises who have optimized their workforce with AbsenKu. Start your 14-day free trial today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-10 py-6 rounded-xl text-base font-bold">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 px-10 py-6 rounded-xl text-base font-bold">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-muted/50 pt-20 pb-10 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <span className="text-2xl font-extrabold tracking-tight text-primary font-sans mb-6 block">AbsenKu</span>
            <p className="text-muted-foreground max-w-xs leading-relaxed mb-6">
              Professional employee management for the modern era. Precision, security, and clarity in every clock-in.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><AtSign className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Share2 className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-6 uppercase tracking-widest">Product</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-6 uppercase tracking-widest">Company</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press Kit</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-6 uppercase tracking-widest">Support</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; 2024 AbsenKu Enterprise. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
