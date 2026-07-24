import type { TourStepDef } from './utils/tour-helpers'

export const karyawanSteps: TourStepDef[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Selamat datang di AbsenKu',
    description: 'Kami akan memandu kamu — kurang dari satu menit.',
    icon: 'Sparkles',
  },
  {
    id: 'sidebar-navigation',
    type: 'spotlight',
    targetSelector: '[data-slot="sidebar-container"]',
    title: 'Navigasi Utama',
    description: 'Ini navigasi utama kamu. Akses absensi, riwayat, pengajuan, dan profil kapan pun.',
    icon: 'Menu',
    position: 'right',
  },
  {
    id: 'dashboard-summary',
    type: 'spotlight',
    targetSelector: '[data-slot="summary-cards"]',
    title: 'Ringkasan Dashboard',
    description: 'Lihat status absensi hari ini, jam kerja, dan jatah cuti — semua di satu tempat.',
    icon: 'LayoutDashboard',
    position: 'bottom',
    route: '/dashboard',
  },
  {
    id: 'attendance-button',
    type: 'spotlight',
    targetSelector: '[data-slot="absen-button"]',
    title: 'Absen Sekarang',
    description: 'Tombol ini untuk merekam kehadiran. Kamu akan diminta verifikasi wajah sebelum check-in.',
    icon: 'Fingerprint',
    position: 'right',
    route: '/dashboard',
  },
  {
    id: 'history-nav',
    type: 'spotlight',
    targetSelector: '[data-slot="nav-riwayat"]',
    title: 'Riwayat Absensi',
    description: 'Mau cek riwayat absensi? Semua tersimpan rapi — bisa dicari pakai filter.',
    icon: 'History',
    position: 'right',
  },
  {
    id: 'leave-nav',
    type: 'spotlight',
    targetSelector: '[data-slot="nav-pengajuan"]',
    title: 'Pengajuan Cuti / Izin',
    description: 'Mau cuti atau izin? Ajukan di sini dan pantau status persetujuan.',
    icon: 'FileText',
    position: 'right',
  },
  {
    id: 'profile-nav',
    type: 'spotlight',
    targetSelector: '[data-slot="nav-user"]',
    title: 'Profil Kamu',
    description: 'Pastikan data kamu selalu update. Di sini juga bisa daftar ulang verifikasi wajah.',
    icon: 'User',
    position: 'top',
  },
  {
    id: 'completion',
    type: 'completion',
    title: 'Selesai!',
    description: 'Kamu sudah siap menggunakan AbsenKu. Silakan eksplorasi fitur lainnya!',
    icon: 'PartyPopper',
  },
]

const adminExtraSteps: TourStepDef[] = [
  {
    id: 'admin-dashboard',
    type: 'spotlight',
    targetSelector: '[data-slot="admin-chart"]',
    title: 'Dashboard Admin',
    description: 'Pantau kehadiran seluruh tim, lihat tren, dan kelola data karyawan.',
    icon: 'BarChart3',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'admin-verification',
    type: 'spotlight',
    targetSelector: '[data-slot="nav-verifikasi"]',
    title: 'Verifikasi Karyawan',
    description: 'Setujui atau tolak pendaftaran karyawan baru dengan cepat.',
    icon: 'UserCheck',
    position: 'right',
  },
]

export const adminSteps: TourStepDef[] = [
  karyawanSteps[0], // welcome
  karyawanSteps[1], // sidebar
  adminExtraSteps[0], // admin-dashboard
  karyawanSteps[4], // history-nav
  adminExtraSteps[1], // admin-verification
  karyawanSteps[5], // leave-nav
  karyawanSteps[6], // profile-nav
  karyawanSteps[7], // completion
]
