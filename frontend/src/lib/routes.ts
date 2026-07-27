export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  STATUS: '/status',
  PROFIL: '/profil',
  ABSENSI: '/absensi',
  ABSENSI_RIWAYAT: '/absensi/riwayat',
  PENGAJUAN: '/pengajuan',
  PENGAJUAN_BARU: '/pengajuan/baru',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    KARYAWAN: '/admin/karyawan',
    PENGAJUAN: '/admin/pengajuan',
    PROFILE: '/admin/profile',
    RIWAYAT: '/admin/riwayat',
    VERIFIKASI: '/admin/verifikasi',
  },
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
