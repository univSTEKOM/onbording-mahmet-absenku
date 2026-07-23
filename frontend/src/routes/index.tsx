import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedRoute from './layouts/ProtectedRoute'
import AdminRoute from './guards/AdminRoute'
import KaryawanRoute from './guards/KaryawanRoute'
import MainLayout from '@/components/layout/MainLayout'
import RoleDashboard from '@/components/shared/RoleDashboard'
import RoleRedirect from '@/components/shared/RoleRedirect'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, lazy: () => import('../pages/WelcomePage').then(m => ({ Component: m.default })) },
      { path: 'login', lazy: () => import('../pages/LoginPage').then(m => ({ Component: m.default })) },
      { path: 'register', lazy: () => import('../pages/RegisterPage').then(m => ({ Component: m.default })) },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: 'dashboard', element: <RoleDashboard /> },
              { path: 'status', lazy: () => import('../pages/StatusAkunPage').then(m => ({ Component: m.default })) },

              {
                element: <KaryawanRoute />,
                children: [
                  { path: 'absensi', lazy: () => import('../pages/AbsensiPage').then(m => ({ Component: m.default })) },
                  { path: 'absensi/riwayat', lazy: () => import('../pages/RiwayatPage').then(m => ({ Component: m.default })) },
                  { path: 'pengajuan', lazy: () => import('../pages/PengajuanListPage').then(m => ({ Component: m.default })) },
                  { path: 'pengajuan/baru', lazy: () => import('../pages/PengajuanFormPage').then(m => ({ Component: m.default })) },
                ],
              },

              { path: 'profil', lazy: () => import('../pages/ProfilPage').then(m => ({ Component: m.default })) },

              {
                element: <AdminRoute />,
                children: [
                  { path: 'hrd/dashboard', lazy: () => import('../pages/HrdDashboardPage').then(m => ({ Component: m.default })) },
                  { path: 'hrd/riwayat', lazy: () => import('../pages/HrdRiwayatPage').then(m => ({ Component: m.default })) },
                  { path: 'hrd/pengajuan', lazy: () => import('../pages/HrdPengajuanPage').then(m => ({ Component: m.default })) },
                  { path: 'hrd/karyawan', lazy: () => import('../pages/HrdKaryawanPage').then(m => ({ Component: m.default })) },
                  { path: 'hrd/verifikasi', lazy: () => import('../pages/HrdVerifikasiPage').then(m => ({ Component: m.default })) },
                ],
              },
            ],
          },
        ],
      },

      { path: '*', element: <RoleRedirect /> },
    ],
  },
])
